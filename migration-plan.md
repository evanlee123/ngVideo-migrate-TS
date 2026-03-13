# NgVideo Migration Plan: AngularJS 1.2 → Angular 17 (NgUpgrade)

## Context

NgVideo is a modularized HTML5 video player library (~2,023 lines) built with AngularJS 1.2.19. It has 14 component files containing 1 service, 2 constants, 1 value, and 27 directives. The example app runs on Express (port 3507) with no routing. The goal is an incremental migration to Angular 17 using NgUpgrade, converting each subcomponent individually with full test coverage, while keeping the website functional throughout via Playwright e2e tests.

---

## Phase 0: Project Scaffolding & Hybrid Bootstrap ✅ COMPLETE

Set up Angular 17 alongside the existing AngularJS app using NgUpgrade.

**Steps:**
1. Initialize Angular 17 project with Angular CLI in the repo root (generate `angular.json`, `tsconfig.json`, `src/main.ts`)
2. Install dependencies: `@angular/upgrade`, `@angular-devkit/build-angular`, `rxjs`, `zone.js`
3. Create hybrid bootstrap in `src/main.ts` using `UpgradeModule`:
   - Bootstrap AngularJS `videoApp` module within Angular's `platformBrowserDynamic`
   - Downgrade Angular components with `downgradeComponent` so AngularJS templates can use them
4. Configure Angular CLI build to include existing AngularJS files
5. Migrate Express server to serve the Angular CLI output (`ng serve` for dev)
6. Verify the app still works identically in hybrid mode

**Files to create/modify:**
- `angular.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`
- `src/main.ts` (hybrid bootstrap)
- `src/app/app.module.ts` (root NgModule importing UpgradeModule)
- `package.json` (add Angular 17 deps, update scripts)

---

## Phase 1: Core Service & Constants Migration ✅ COMPLETE

Migrate the foundation that all directives depend on.

### 1a. `ngVideoOptions` constant → `VideoOptionsConfig` (Injectable)
- **Source:** `components/Service.js:20-32`
- **Target:** `src/app/services/video-options.config.ts`
- **Approach:** Create as an `InjectionToken<VideoOptions>` with a typed interface
- **Downgrade:** Use `downgradeInjectable` so AngularJS directives can still inject it
- **Test:** Unit test verifying default values match original constants

### 1b. `ngVideoPlaylist` value → `PlaylistService`
- **Source:** `components/Service.js:38`
- **Target:** `src/app/services/playlist.service.ts`
- **Approach:** Injectable service wrapping a `BehaviorSubject<VideoModel[]>` replacing the shared array
- **Downgrade:** `downgradeInjectable` for AngularJS consumption
- **Test:** Unit test for add/remove/clear/observable emissions

### 1c. `ngVideoMessages` constant → `VideoMessagesConfig`
- **Source:** `components/Messages.js` (message definitions)
- **Target:** `src/app/services/video-messages.config.ts`
- **Approach:** `InjectionToken` with typed interface
- **Downgrade:** `downgradeInjectable`
- **Test:** Unit test verifying all 20 message types present

### 1d. `video` service → `VideoService`
- **Source:** `components/Service.js:47-159`
- **Target:** `src/app/services/video.service.ts`
- **Approach:** Angular `@Injectable()` service. Replace `$rootScope.$broadcast('ng-video/add')` with RxJS `Subject` events. Methods: `addSource()`, `multiSource()`, `resetSource()`, `throwException()`
- **Downgrade:** `downgradeInjectable`
- **Test:** Unit test for addSource, multiSource, resetSource, observable event emissions

### 1e. `VideoEventBus` (new) — replaces `$rootScope.$broadcast`
- **Target:** `src/app/services/video-event-bus.service.ts`
- **Approach:** Central RxJS `Subject`-based event bus replacing all `$broadcast`/`$on` patterns:
  - `videoAdded$`, `videoReset$`, `attachEvents$`, `volumeChanged$`, `feedbackRefresh$`, `seekableChanged$`
- **Test:** Unit test for each event stream

---

## Phase 2: Leaf Directive Migrations (no child directives) ✅ COMPLETE

Migrate simple directives that don't contain other directives. Attribute directives stay as AngularJS thin wrappers delegating to Angular services (see lesson #3). Template-bearing directives become Angular components via `downgradeComponent`.

### Foundation

- **`src/app/ajs-downgrade.ts`** — registers `downgradeInjectable` for `VideoPlayerContext` and `VideoEventService`, and `downgradeComponent` for `BufferComponent` and `TimelineComponent`
- **`src/main.ts`** — imports `ajs-downgrade.ts` so registrations run before AngularJS bootstrap
- **`components/Bootstrap.js`** — modified to inject the downgraded Angular services, sync `player`/`container`/`playing`/`loading` to `VideoPlayerContext`, and dual-emit events to both `$rootScope.$broadcast` and RxJS Subjects
- **`src/app/testing/mocks.ts`** — shared mock factories (`createMockVideoPlayerContext`, `createMockVideoEventService`, `createMockVideoElement`)

### 2a. `viScreen` — thin wrapper
- **File:** `components/Screen.js` (modified in place)
- **Approach:** Injects `videoPlayerContext`; click handler delegates to `videoPlayerContext.toggleState()` and reads `videoPlayerContext.loading$.value` instead of `scope.loading`

### 2b. `viControls` / `viControlsPlay` / `viControlsPause` — thin wrapper
- **File:** `components/Controls.js` (modified in place)
- **Approach:** `viControls` container controller injects `videoPlayerContext`; `$scope.play()`/`$scope.pause()` delegate to `videoPlayerContext.play()`/`pause()`. Leaf directives (`viControlsPlay`, `viControlsPause`) unchanged — they still call `scope.play`/`scope.pause` which now routes through the service

### 2c. `viFullScreenOpen/Close/Toggle` — thin wrapper
- **File:** `components/FullScreen.js` (modified in place)
- **Approach:** Factory injects `videoPlayerContext`; click callbacks delegate to `videoPlayerContext.openFullScreen()`/`closeFullScreen()`

### 2d. `viVolume` / `viVolumeDecrease/Increase/Mute/Loudest` — thin wrapper
- **File:** `components/Volume.js` (modified in place)
- **Approach:** `viVolume` container injects `videoPlayerContext` and `videoEventService`; `setVolume()` reads/writes `videoPlayerContext.player` and dual-emits via `$rootScope.$broadcast('ng-video/volume')` + `videoEventService.volumeChanged$.next()`. Leaf directives unchanged

### 2e. `viPlaybackRate` + variants — thin wrapper
- **File:** `components/PlaybackRate.js` (modified in place)
- **Approach:** Factory injects `videoPlayerContext` and `videoEventService`; reads `videoPlayerContext.player.playbackRate`, dual-emits `feedbackRefresh$`

### 2f. `viSeekable` + variants — thin wrapper
- **File:** `components/Seekable.js` (modified in place)
- **Approach:** Factory injects `videoPlayerContext` and `videoEventService`; reads `videoPlayerContext.player.currentTime`, dual-emits `feedbackRefresh$`

### 2g. `viBuffer` → `BufferComponent` — Angular component
- **Source:** `components/Buffer.js` (79 lines) — **removed from `angular.json` scripts**
- **Target:** `src/app/components/buffer/buffer.component.ts`
- **Approach:** Self-contained polling via `interval(REFRESH)` merged with `feedbackRefresh$`; reads `player.buffered`/`player.duration` from `VideoPlayerContext`; draws on `<canvas>` with configurable colour/dimensions from `VIDEO_OPTIONS`
- **Downgrade:** `downgradeComponent` as `vi-buffer` (element directive)
- **HTML change:** `<section vi-buffer class="buffer">` → `<section class="buffer"><vi-buffer></vi-buffer></section>`
- **Test:** 7 unit tests (canvas rendering, buffer region drawing, null-safety, cleanup)

### 2h. `viTimeline` → `TimelineComponent` — Angular component
- **Source:** `components/Timeline.js` (111 lines) — **removed from `angular.json` scripts**
- **Target:** `src/app/components/timeline/timeline.component.ts`
- **Approach:** Self-contained polling via `interval(REFRESH)` merged with `seekableChanged$`; subscribes to `videoReset$` for range reset; pauses on mousedown / resumes on mouseup via `VideoPlayerContext`; updates `player.currentTime` on change
- **Downgrade:** `downgradeComponent` as `vi-timeline` (element directive)
- **HTML change:** `<input vi-timeline />` → `<vi-timeline></vi-timeline>`
- **Test:** 8 unit tests (range input, reset, pause/resume seeking, position updates, cleanup)

### 2i. `viMeta` → `MetaComponent` — Angular component (not wired in)
- **Source:** `components/Meta.js` (95 lines) — **kept in `angular.json` scripts**
- **Target:** `src/app/components/meta/meta.component.ts`
- **Approach:** Creates temporary `<video>` element, sets `preload=metadata`, listens for `loadedmetadata` to read duration. Accepts `@Input() videoModel`.
- **Status:** Created with 7 unit tests but NOT wired into the running app. The AngularJS directive remains active because it uses `require: 'ngModel'` inside `ng-repeat` — patterns that don't translate cleanly to a downgraded component during the hybrid period. Will be wired in when `viPlaylist` is migrated (Phase 3e).
- **Test:** 7 unit tests (single/array model, metadata loading, cleanup)

---

## Phase 3: Container Directive Migrations ✅ COMPLETE

Migrate directives that contain/manage child directives. Each container currently uses `scope: true` for child scope inheritance. In Angular, child components access shared state via `VideoPlayerContext` and events via `VideoEventService`. Containers use `<ng-content>` for content projection where children are still AngularJS.

**Note:** The `viControls` and `viVolume` containers were already partially migrated in Phase 2 (their controllers now delegate to Angular services). Phase 3 converts them to full Angular components.

### 3a. `viControls` → `ControlsComponent`
- **Source:** `components/Controls.js` (container part — the `viControls` directive)
- **Target:** `src/app/components/controls/controls.component.ts`
- **Approach:** Angular component with `<ng-content>` for play/pause child elements. No logic needed — the controller's `play()`/`pause()` were moved to `VideoPlayerContext` in Phase 2
- **Downgrade:** `downgradeComponent` as `vi-controls`
- **HTML change:** `<section vi-controls class="controls">` → `<vi-controls class="controls">`
- **Note:** Child directives `viControlsPlay`/`viControlsPause` remain as AngularJS attribute directives inside the projected content
- **Test:** Unit test with projected content

### 3b. `viVolume` → `VolumeComponent`
- **Source:** `components/Volume.js` (container part — the `viVolume` directive)
- **Target:** `src/app/components/volume/volume.component.ts`
- **Approach:** Angular component with `<ng-content>`. `setVolume()` logic already delegates to `VideoPlayerContext` + `VideoEventService` (Phase 2). Move `setVolume()` into an Angular service or keep in the component
- **Downgrade:** `downgradeComponent` as `vi-volume`
- **HTML change:** `<section vi-volume class="volume">` → `<vi-volume class="volume">`
- **Challenge:** Child volume button directives call `scope.setVolume()` via scope inheritance. When `viVolume` becomes an Angular component, AngularJS children inside `<ng-content>` lose access to the parent scope. Options: (a) expose `setVolume` on `VideoPlayerContext`, (b) keep volume buttons as AngularJS thin wrappers that inject `videoPlayerContext` directly
- **Test:** Unit test for volume state management

### 3c. `viFeedback` → `FeedbackComponent`
- **Source:** `components/Feedback.js` (226 lines)
- **Target:** `src/app/components/feedback/feedback.component.ts`
- **Approach:** Polls video element for stats (currentTime, duration, volume, playbackRate, buffered, percentagePlayed) using RxJS `interval(REFRESH)` instead of `$interval`. Subscribes to `videoReset$`, `volumeChanged$`, `feedbackRefresh$`, `attachEvents$`. Exposes stats as template bindings
- **Downgrade:** `downgradeComponent` as `vi-feedback`
- **HTML change:** `<section vi-feedback class="feedback">` → `<vi-feedback class="feedback">`
- **Key detail:** This is the most complex container — it has a polling loop, buffering detection, and exposes ~10 scope properties that the template reads (`{{currentTime}}`, `{{duration}}`, `{{volume}}`, etc.). The Angular component template must reproduce these bindings
- **Test:** Unit test for stat polling with mock video element

### 3d. `viMessages` → `MessagesComponent`
- **Source:** `components/Messages.js` (112 lines, directive portion)
- **Target:** `src/app/components/messages/messages.component.ts`
- **Approach:** Subscribes to `attachEvents$` to get the video element reference, then binds all 21 `ngVideoMessages` events on the video element. Each event pushes a timestamped message to an internal array. Template exposes `messages.length`
- **Downgrade:** `downgradeComponent` as `vi-messages`
- **HTML change:** `<span vi-messages>` → `<vi-messages>` (used inline, content moves inside component template)
- **Test:** Unit test for message accumulation from events

### 3e. `viPlaylist` / `viPlaylistVideo` → `PlaylistComponent` / `PlaylistVideoComponent`
- **Source:** `components/Playlist.js` (173 lines)
- **Target:** `src/app/components/playlist/playlist.component.ts`, `playlist-video.component.ts`
- **Approach:** `PlaylistComponent` uses `PlaylistService.getAll$()` observable with `*ngFor` replacing `ng-repeat`. `PlaylistVideoComponent` renders a single playlist item with click-to-play. Wire in `MetaComponent` (from Phase 2i) as a child for duration display
- **Actual approach:** `PlaylistComponent` is a `<ng-content>` wrapper. The playlist template stays in `index.html` as AngularJS-compiled projected content. `viPlaylistVideo` and `viMeta` remain as AngularJS directives for now. Bootstrap.js exposes `scope.playlistItems = ngVideoPlaylist` so `ng-repeat` works from the ngVideo scope. `$parent.playlistOpen` references updated to `playlistOpen` (scope chain changed without child scope).
- **Downgrade:** `downgradeComponent` as `vi-playlist`
- **HTML change:** `<section vi-playlist>` → `<vi-playlist>`, `ng-repeat="video in videos"` → `ng-repeat="video in playlistItems"`, `$parent.playlistOpen` → `playlistOpen`
- **Test:** 4 unit tests (creation, content projection, child rendering)

---

## Phase 4: Main Directive & App Migration ✅ COMPLETE

### 4a. `ngVideo` → `NgVideoComponent`
- **Source:** `components/Bootstrap.js` (currently ~400 lines with Phase 2 sync additions)
- **Target:** `src/app/components/ng-video/ng-video.component.ts`
- **Approach:** Main container component. Manages video element lifecycle, playlist navigation, auto-play on ended. Uses `VideoEventService` for all cross-component communication. Uses `@ContentChild`/`@ViewChild` to access the `<video>` element. Most of the logic already exists in `VideoPlayerContext` — the component wires it up
- **Key detail:** `Bootstrap.js` already syncs state to `VideoPlayerContext` and dual-emits events (Phase 2). The Angular component absorbs this logic natively, eliminating the sync layer
- **Downgrade:** `downgradeComponent` as `ng-video`
- **Test:** Unit test for video lifecycle, playlist advancement, event attachment

### 4b. `VideoController` → `AppComponent`
- **Source:** `example/js/controllers/VideoController.js`
- **Target:** `src/app/app.component.ts`
- **Approach:** Convert to Angular component. Inject `VideoService` instead of AngularJS `video` service. Manages `playlistOpen` state and video name display
- **Test:** Unit test for video source loading, playlist management

### 4c. Remove AngularJS bootstrap — full Angular
- Remove `UpgradeModule`, remove all `downgradeComponent`/`downgradeInjectable` calls
- Delete `src/app/ajs-downgrade.ts`
- Remove all dual-emit `$rootScope.$broadcast` calls from Angular components
- Update `src/main.ts` to pure Angular bootstrap
- Remove AngularJS script includes from `angular.json`
- Remove `angular` package from dependencies
- Delete remaining `components/*.js` files

---

## Phase 5: Playwright E2E Tests ✅ COMPLETE

Create e2e tests that verify the website works. These should be written **before Phase 1** and run after each phase to catch regressions.

**Setup:**
- Install Playwright: `npm install -D @playwright/test`
- Config: `playwright.config.ts` (base URL `http://localhost:3507`)
- Test directory: `e2e/`

**Test cases** (`e2e/video-player.spec.ts`):
1. **Page loads** — verify title, video container visible
2. **Video element present** — `<video>` tag exists with source
3. **Play/Pause** — click play, verify playing state; click pause, verify paused
4. **Volume controls** — click increase/decrease, verify volume bar changes
5. **Playlist** — open playlist, verify video items listed, click video to switch
6. **Timeline** — verify timeline input exists and updates during playback
7. **Buffer** — verify canvas buffer element renders
8. **Fullscreen toggle** — click fullscreen button, verify request made
9. **Playback rate** — change rate, verify display updates
10. **Messages** — verify message count increments on events
11. **Meta** — verify duration displays in playlist items

**File:** `e2e/video-player.spec.ts`

---

## Phase 6: Cleanup & Build System

1. Remove Grunt build system (`Gruntfile.js`)
2. Remove Bower (`bower.json`, `.bowerrc`)
3. Remove old Karma config (`KarmaUnit.js`)
4. Remove old test file (`tests/Spec.js`) — replaced by Angular TestBed tests
5. Update `package.json` scripts: `ng serve`, `ng build`, `ng test`, `npx playwright test`
6. Update `.travis.yml` or replace with GitHub Actions
7. Update `README.md` with new development instructions
8. Generate production `dist/` with `ng build`

---

## Migration Order Summary

```
E2E tests (Phase 5 setup — write first, run throughout)
  ↓
Phase 0: Scaffold Angular 17 + hybrid bootstrap
  ↓
Phase 1: Services & constants (VideoService, PlaylistService, EventBus, configs)
  ↓
Phase 2: Leaf directives (Screen, Buffer, Timeline, buttons, etc.)
  ↓
Phase 3: Container directives (Controls, Volume, Feedback, Messages, Playlist)
  ↓
Phase 4: Main directive (NgVideo) + App component + remove AngularJS
  ↓
Phase 6: Cleanup Grunt/Bower/Karma, finalize build
```

---

## Key Files — Current State

| Original File | Angular File(s) | Status |
|---|---|---|
| `components/Service.js` | `src/app/services/video.service.ts`, `video-options.config.ts`, `playlist.service.ts`, `video-event.service.ts`, `video-player-context.ts` | ✅ Phase 1 |
| `components/Bootstrap.js` | Modified in place (syncs to Angular services); will become `src/app/components/ng-video/ng-video.component.ts` | Phase 2 sync done, Phase 4 for full migration |
| `components/Screen.js` | Modified in place (thin wrapper → `videoPlayerContext`) | ✅ Phase 2 |
| `components/Buffer.js` | `src/app/components/buffer/buffer.component.ts` | ✅ Phase 2 (Angular component, wired in) |
| `components/Timeline.js` | `src/app/components/timeline/timeline.component.ts` | ✅ Phase 2 (Angular component, wired in) |
| `components/Controls.js` | `src/app/components/controls/controls.component.ts` + leaf directives in `Controls.js` | ✅ Phase 3 (Angular component, wired in) |
| `components/FullScreen.js` | Modified in place (thin wrapper → `videoPlayerContext`) | ✅ Phase 2 |
| `components/Volume.js` | `src/app/components/volume/volume.component.ts` + leaf directives in `Volume.js` | ✅ Phase 3 (Angular component, wired in) |
| `components/PlaybackRate.js` | Modified in place (thin wrapper → `videoPlayerContext` + `videoEventService`) | ✅ Phase 2 |
| `components/Seekable.js` | Modified in place (thin wrapper → `videoPlayerContext` + `videoEventService`) | ✅ Phase 2 |
| `components/Feedback.js` | `src/app/components/feedback/feedback.component.ts` | ✅ Phase 3 (Angular component, removed from scripts) |
| `components/Messages.js` | `src/app/components/messages/messages.component.ts` | ✅ Phase 3 (Angular component, removed from scripts) |
| `components/Meta.js` | `src/app/components/meta/meta.component.ts` (created, not wired in) | Phase 2 component created, Phase 3e to wire in |
| `components/Playlist.js` | `src/app/components/playlist/playlist.component.ts` + `viPlaylistVideo` in `Playlist.js` | ✅ Phase 3 (Angular wrapper, wired in) |
| `example/js/controllers/VideoController.js` | Will become `src/app/app.component.ts` | Phase 4 |
| `example/index.html` | `src/index.html` (partially migrated — Buffer, Timeline use Angular components) | Ongoing |
| — | `src/app/ajs-downgrade.ts` (downgrade bridge) | ✅ Phase 2 (delete in Phase 4c) |
| — | `src/app/testing/mocks.ts` (shared test utilities) | ✅ Phase 2 |

---

## Verification

After each phase:
1. Run `npx playwright test` — all e2e tests pass (website still works)
2. Run `ng test` — all unit tests pass for migrated components
3. Manual smoke test: open `http://localhost:3507`, play a video, use controls
