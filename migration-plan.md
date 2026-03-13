# NgVideo Migration Plan: AngularJS 1.2 → Angular 17 (NgUpgrade)

## Context

NgVideo is a modularized HTML5 video player library (~2,023 lines) built with AngularJS 1.2.19. It has 14 component files containing 1 service, 2 constants, 1 value, and 27 directives. The example app runs on Express (port 3507) with no routing. The goal is an incremental migration to Angular 17 using NgUpgrade, converting each subcomponent individually with full test coverage, while keeping the website functional throughout via Playwright e2e tests.

---

## Phase 0: Project Scaffolding & Hybrid Bootstrap

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

## Phase 1: Core Service & Constants Migration

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

## Phase 2: Leaf Directive Migrations (no child directives)

Migrate simple directives that don't contain other directives. Each migrated component is downgraded for use in AngularJS templates.

### Migration order (simplest → most complex):

### 2a. `viScreen` → `ScreenComponent`
- **Source:** `components/Screen.js` (49 lines)
- **Target:** `src/app/components/screen/screen.component.ts`
- **Approach:** Angular component rendering `<video>` element. Emits reference to parent.
- **Downgrade:** `downgradeComponent` as `vi-screen`
- **Test:** Unit test verifying video element creation

### 2b. `viBuffer` → `BufferComponent`
- **Source:** `components/Buffer.js` (79 lines)
- **Target:** `src/app/components/buffer/buffer.component.ts`
- **Approach:** Component with `<canvas>` element, draws buffer progress bar
- **Downgrade:** `downgradeComponent` as `vi-buffer`
- **Test:** Unit test for canvas rendering with mock buffer data

### 2c. `viTimeline` → `TimelineComponent`
- **Source:** `components/Timeline.js` (111 lines)
- **Target:** `src/app/components/timeline/timeline.component.ts`
- **Approach:** Component wrapping `<input type="range">` for seeking
- **Downgrade:** `downgradeComponent` as `vi-timeline`
- **Test:** Unit test for range input binding and seek event emission

### 2d. `viControlsPlay` / `viControlsPause` → `PlayButtonComponent` / `PauseButtonComponent`
- **Source:** `components/Controls.js` (lines for play/pause child directives)
- **Target:** `src/app/components/controls/play-button.component.ts`, `pause-button.component.ts`
- **Downgrade:** `downgradeComponent` as `vi-controls-play`, `vi-controls-pause`
- **Test:** Unit test verifying click triggers play/pause

### 2e. `viVolumeDecrease/Increase/Mute/Loudest` → Volume button components
- **Source:** `components/Volume.js` (button directives)
- **Target:** `src/app/components/volume/volume-decrease.component.ts`, etc.
- **Downgrade:** `downgradeComponent` for each
- **Test:** Unit tests for volume step changes

### 2f. `viFullScreenOpen/Close/Toggle` → Fullscreen components
- **Source:** `components/FullScreen.js` (121 lines)
- **Target:** `src/app/components/fullscreen/fullscreen-toggle.component.ts`, etc.
- **Downgrade:** `downgradeComponent` for each
- **Test:** Unit test with mocked Fullscreen API

### 2g. `viPlaybackRate/Normalise/Increment/Decrement` → PlaybackRate components
- **Source:** `components/PlaybackRate.js` (120 lines)
- **Target:** `src/app/components/playback-rate/playback-rate.component.ts`, etc.
- **Downgrade:** `downgradeComponent` for each
- **Test:** Unit test for rate changes

### 2h. `viSeekable/Increment/Decrement` → Seekable components
- **Source:** `components/Seekable.js` (89 lines)
- **Target:** `src/app/components/seekable/seekable.component.ts`, etc.
- **Downgrade:** `downgradeComponent` for each
- **Test:** Unit test for seek position changes

### 2i. `viMeta` → `MetaComponent`
- **Source:** `components/Meta.js` (95 lines)
- **Target:** `src/app/components/meta/meta.component.ts`
- **Approach:** Reads video metadata (duration) via `loadedmetadata` event
- **Downgrade:** `downgradeComponent` as `vi-meta`
- **Test:** Unit test with mock video element metadata

---

## Phase 3: Container Directive Migrations

Migrate directives that contain/manage child directives.

### 3a. `viControls` → `ControlsComponent`
- **Source:** `components/Controls.js` (container part)
- **Target:** `src/app/components/controls/controls.component.ts`
- **Approach:** Container using `<ng-content>` for play/pause buttons
- **Downgrade:** `downgradeComponent` as `vi-controls`
- **Test:** Unit test with projected content

### 3b. `viVolume` → `VolumeComponent`
- **Source:** `components/Volume.js` (container part)
- **Target:** `src/app/components/volume/volume.component.ts`
- **Approach:** Container managing volume state, uses `VideoEventBus` for volume changes
- **Downgrade:** `downgradeComponent` as `vi-volume`
- **Test:** Unit test for volume state management

### 3c. `viFeedback` → `FeedbackComponent`
- **Source:** `components/Feedback.js` (226 lines)
- **Target:** `src/app/components/feedback/feedback.component.ts`
- **Approach:** Polls video element for stats (currentTime, duration, buffered, etc.) using RxJS `interval` instead of `$interval`
- **Downgrade:** `downgradeComponent` as `vi-feedback`
- **Test:** Unit test for stat polling with mock video element

### 3d. `viMessages` → `MessagesComponent`
- **Source:** `components/Messages.js` (112 lines)
- **Target:** `src/app/components/messages/messages.component.ts`
- **Approach:** Subscribes to video events and logs messages
- **Downgrade:** `downgradeComponent` as `vi-messages`
- **Test:** Unit test for message accumulation from events

### 3e. `viPlaylist` / `viPlaylistVideo` → `PlaylistComponent` / `PlaylistVideoComponent`
- **Source:** `components/Playlist.js` (173 lines)
- **Target:** `src/app/components/playlist/playlist.component.ts`, `playlist-video.component.ts`
- **Approach:** Uses `PlaylistService` observable, `*ngFor` replaces `ng-repeat`
- **Downgrade:** `downgradeComponent` for both
- **Test:** Unit test for playlist rendering, video selection

---

## Phase 4: Main Directive & App Migration

### 4a. `ngVideo` → `NgVideoComponent`
- **Source:** `components/Bootstrap.js` (398 lines)
- **Target:** `src/app/components/ng-video/ng-video.component.ts`
- **Approach:** Main container component. Manages video element lifecycle, playlist navigation, auto-play on ended. Uses `VideoEventBus` for all cross-component communication. Uses `@ContentChild` / `@ViewChild` to access screen component.
- **Downgrade:** `downgradeComponent` as `ng-video`
- **Test:** Unit test for video lifecycle, playlist advancement, event attachment

### 4b. `VideoController` → `AppComponent`
- **Source:** `example/js/controllers/VideoController.js`
- **Target:** `src/app/app.component.ts`
- **Approach:** Convert to Angular component. Inject `VideoService` instead of AngularJS `video` service.
- **Test:** Unit test for video source loading, playlist management

### 4c. Remove AngularJS bootstrap — full Angular
- Remove `UpgradeModule`, remove all `downgradeComponent`/`downgradeInjectable` calls
- Update `src/main.ts` to pure Angular bootstrap
- Remove AngularJS script includes from index.html
- Remove `angular`, `angular-mocks` from dependencies

---

## Phase 5: Playwright E2E Tests

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

## Key Files to Modify/Create

| Current File | New File(s) |
|---|---|
| `components/Service.js` | `src/app/services/video.service.ts`, `video-options.config.ts`, `playlist.service.ts`, `video-event-bus.service.ts` |
| `components/Bootstrap.js` | `src/app/components/ng-video/ng-video.component.ts` |
| `components/Screen.js` | `src/app/components/screen/screen.component.ts` |
| `components/Buffer.js` | `src/app/components/buffer/buffer.component.ts` |
| `components/Controls.js` | `src/app/components/controls/controls.component.ts`, `play-button.component.ts`, `pause-button.component.ts` |
| `components/FullScreen.js` | `src/app/components/fullscreen/fullscreen-toggle.component.ts`, etc. |
| `components/Feedback.js` | `src/app/components/feedback/feedback.component.ts` |
| `components/Messages.js` | `src/app/components/messages/messages.component.ts`, `video-messages.config.ts` |
| `components/Meta.js` | `src/app/components/meta/meta.component.ts` |
| `components/Timeline.js` | `src/app/components/timeline/timeline.component.ts` |
| `components/Playlist.js` | `src/app/components/playlist/playlist.component.ts`, `playlist-video.component.ts` |
| `components/Volume.js` | `src/app/components/volume/volume.component.ts`, button components |
| `components/PlaybackRate.js` | `src/app/components/playback-rate/` components |
| `components/Seekable.js` | `src/app/components/seekable/` components |
| `example/js/controllers/VideoController.js` | `src/app/app.component.ts` |
| `example/index.html` | `src/index.html` + `src/app/app.component.html` |

---

## Verification

After each phase:
1. Run `npx playwright test` — all e2e tests pass (website still works)
2. Run `ng test` — all unit tests pass for migrated components
3. Manual smoke test: open `http://localhost:3507`, play a video, use controls
