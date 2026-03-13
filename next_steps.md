# Next Steps: NgVideo AngularJS → Angular 17 Migration

## Current Status

- **Phase 0 (Complete):** Angular 17 project scaffolded alongside AngularJS. Hybrid bootstrap configured with `UpgradeModule`. The app builds and serves via `ng serve` with all AngularJS directives loaded as scripts.
- **Phase 5 - Playwright (In Progress):** Config file written, e2e test directory created. Browser download fails in current environment — tests are ready to run once a Chromium binary is available.

---

## Immediate Next Steps

### 1. Finish Playwright E2E Test Suite

Write `e2e/video-player.spec.ts` with these regression tests:

| Test | What it verifies |
|------|-----------------|
| Page loads | Title is "ngVideo", `.ng-video-container` is visible |
| Video element present | `<video>` tag exists inside the player |
| Play/Pause | Click play → video plays; click pause → video pauses |
| Volume controls | Click increase/decrease → volume bar width changes |
| Playlist | Open playlist → video items listed; click item → source changes |
| Timeline | Range input exists and value updates during playback |
| Buffer | Canvas element renders inside `.buffer` |
| Fullscreen toggle | Fullscreen button is clickable |
| Playback rate | Rate display updates when changed |
| Messages | Message count increments on video events |
| Meta | Duration displays in playlist items |

### 2. Phase 1: Migrate Core Services & Constants

This is the foundation — all directives depend on these.

#### 1a. TypeScript Interfaces (`src/app/models/video-source.model.ts`)
```
VideoSource { type: string; src: string }
VideoOptions { RESTRICT, REFRESH, SCREEN_DIRECTIVE, ... }
VideoMessage { name: string; event: string }
```

#### 1b. `VideoEventService` (`src/app/services/video-event.service.ts`)
RxJS replacement for `$rootScope.$broadcast`. Six event channels:
- `videoAdded$` — replaces `ng-video/add`
- `videoReset$` — replaces `ng-video/reset`
- `attachEvents$` — replaces `ng-video/attach-events`
- `volumeChanged$` — replaces `ng-video/volume`
- `feedbackRefresh$` — replaces `ng-video/feedback/refresh`
- `seekableChanged$` — replaces `ng-video/seekable`

#### 1c. `VideoOptionsConfig` (`src/app/services/video-options.config.ts`)
`InjectionToken<VideoOptions>` with default values matching `components/Service.js:20-32`.

#### 1d. `PlaylistService` (`src/app/services/playlist.service.ts`)
`BehaviorSubject<VideoSource[]>` wrapping the shared array. Methods: `add()`, `clear()`, `getAll$()`.

#### 1e. `VideoService` (`src/app/services/video.service.ts`)
Angular `@Injectable()` replacing the AngularJS `video` service. Methods: `addSource()`, `multiSource()`, `resetSource()`. Uses `VideoEventService` instead of `$rootScope.$broadcast`.

#### 1f. `VideoPlayerContext` (`src/app/services/video-player-context.ts`)
**Key insight from planning:** This new service replaces AngularJS scope inheritance. It holds the shared state that all child directives currently access via `scope`:
- `player: HTMLVideoElement | null`
- `playing$: BehaviorSubject<boolean>`
- `loading$: BehaviorSubject<boolean>`
- `container: HTMLElement | null`
- Methods: `open()`, `toggleState()`, `play()`, `pause()`, `openFullScreen()`, `closeFullScreen()`

#### 1g. Event Bridge (`src/app/services/event-bridge.ts`)
Temporary adapter that syncs RxJS subjects ↔ `$rootScope.$broadcast` during the hybrid period. Deleted after full migration.

#### 1h. Downgrade all Angular services for AngularJS consumption
```typescript
angular.module('ngVideo')
  .factory('videoService', downgradeInjectable(VideoService))
  .factory('videoEventService', downgradeInjectable(VideoEventService))
  .factory('videoPlayerContext', downgradeInjectable(VideoPlayerContext));
```

#### 1i. Modify `Bootstrap.js` to populate `VideoPlayerContext`
Small non-breaking change: after `scope.player = player[0]`, also set `videoPlayerContext.player = player[0]` and sync `playing`/`loading` state. This allows migrated Angular child components to access the player.

**Unit tests for Phase 1:** One `.spec.ts` per service, testing all public methods and observable emissions.

### 3. Phase 2: Migrate Leaf Directives

Migrate simple directives with no children. Each gets:
- Angular component/directive in `src/app/components/<name>/`
- `downgradeComponent` registration for AngularJS template compatibility
- Unit test file

**Important architectural note:** Attribute directives (`viScreen`, `viControlsPlay`, etc.) can't use `downgradeComponent` (which only works with components). Two options:
- **Option A:** Keep as AngularJS thin wrappers that delegate to Angular services during hybrid phase
- **Option B:** Convert to Angular components with `<ng-content>` and change HTML usage

**Migration order (simplest first):**

| Order | Directive(s) | Lines | Approach |
|-------|-------------|-------|----------|
| 2a | `viScreen` | 49 | Refactor to delegate to `VideoPlayerContext.toggleState()` |
| 2b | `viControlsPlay`, `viControlsPause` | ~40 | Delegate to `VideoPlayerContext.play()`/`pause()` |
| 2c | `viFullScreenOpen/Close/Toggle` | 121 | Delegate to `VideoPlayerContext.openFullScreen()`/`closeFullScreen()` |
| 2d | `viVolumeDecrease/Increase/Mute/Loudest` | ~80 | Delegate to `VideoPlayerContext`, emit via `VideoEventService.volumeChanged$` |
| 2e | `viPlaybackRate` + variants | 120 | Delegate to context, emit `feedbackRefresh$` |
| 2f | `viSeekable` + variants | 89 | Delegate to context, emit `feedbackRefresh$` |
| 2g | `viBuffer` | 79 | Angular component with `<canvas>`, subscribe to `feedbackRefresh$` |
| 2h | `viTimeline` | 111 | Angular component with `<input type="range">`, subscribe to `videoReset$` |
| 2i | `viMeta` | 95 | Angular component, creates own `<video>` for metadata |

### 4. Phase 3: Migrate Container Directives

These have controllers and manage child content:

| Order | Directive | Key challenge |
|-------|----------|---------------|
| 3a | `viControls` | Content projection via `<ng-content>` |
| 3b | `viVolume` | Manages volume state, broadcasts events |
| 3c | `viFeedback` | Most complex child — polling with RxJS `interval`, 4 event subscriptions |
| 3d | `viMessages` | Subscribes to `attachEvents$`, binds native video events |
| 3e | `viPlaylist` + `viPlaylistVideo` | Uses `PlaylistService` observable, `*ngFor` replaces `ng-repeat` |

### 5. Phase 4: Migrate Main Directive & Remove AngularJS

#### 4a. `ngVideo` → `NgVideoComponent`
The parent container (398 lines). Manages video element lifecycle, playlist navigation, auto-play. This is the last directive migrated because all children must be Angular components first.

#### 4b. `VideoController` → `AppComponent`
Convert the example app controller to an Angular component.

#### 4c. Remove AngularJS entirely
- Remove `UpgradeModule` and all `downgradeComponent`/`downgradeInjectable` calls
- Remove event bridge
- Remove AngularJS script includes from `angular.json`
- Remove `angular` package from dependencies
- Pure Angular bootstrap in `main.ts`

### 6. Phase 6: Cleanup

- Delete `Gruntfile.js`, `bower.json`, `.bowerrc`, `.jshintrc`
- Delete `KarmaUnit.js` and `tests/Spec.js` (replaced by Angular TestBed tests)
- Delete `components/*.js` (all migrated to `src/app/`)
- Update `package.json` scripts
- Update or replace `.travis.yml`
- Final `ng build --configuration production` to verify clean build
