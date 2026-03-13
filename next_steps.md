# Next Steps: NgVideo AngularJS → Angular 17 Migration

## Current Status

- **Phase 0 (Complete):** Angular 17 project scaffolded alongside AngularJS. Hybrid bootstrap configured with `UpgradeModule`. Fixed critical bug where `bootstrap: [AppComponent]` prevented `ngDoBootstrap()` from running — AngularJS now compiles fully.
- **Phase 5 - Playwright (Complete):** 23 e2e regression tests covering all UI components. Uses system Chrome (`channel: 'chrome'`).
- **Phase 1 (Complete):** All core services and constants migrated to Angular TypeScript. 58 unit tests pass.

### Phase 1 Files Created

| File | Purpose |
|------|---------|
| `src/app/models/video-source.model.ts` | `VideoSource`, `VideoOptions`, `VideoMessage` interfaces, `MESSAGE_TYPE` |
| `src/app/services/video-options.config.ts` | `InjectionToken<VideoOptions>` with defaults matching `components/Service.js:20-32` |
| `src/app/services/video-messages.config.ts` | `InjectionToken` with all 21 message types matching `components/Messages.js` |
| `src/app/services/video-event.service.ts` | RxJS Subject-based event bus (6 channels) replacing `$rootScope.$broadcast` |
| `src/app/services/playlist.service.ts` | `BehaviorSubject` playlist management replacing `ngVideoPlaylist` value |
| `src/app/services/video.service.ts` | `@Injectable()` replacing AngularJS `video` service |
| `src/app/services/video-player-context.ts` | Shared state container replacing scope inheritance |

---

## Immediate Next Steps

### 1. Phase 2: Migrate Leaf Directives

Migrate simple directives with no children. Each gets:
- Angular component/directive in `src/app/components/<name>/`
- `downgradeComponent` registration for AngularJS template compatibility
- Unit test file

**Important architectural note:** Attribute directives (`viScreen`, `viControlsPlay`, etc.) can't use `downgradeComponent` (which only works with components). Use Option A: keep as AngularJS thin wrappers that delegate to Angular services during hybrid phase.

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

### 2. Phase 3: Migrate Container Directives

| Order | Directive | Key challenge |
|-------|----------|---------------|
| 3a | `viControls` | Content projection via `<ng-content>` |
| 3b | `viVolume` | Manages volume state, broadcasts events |
| 3c | `viFeedback` | Most complex child — polling with RxJS `interval`, 4 event subscriptions |
| 3d | `viMessages` | Subscribes to `attachEvents$`, binds native video events |
| 3e | `viPlaylist` + `viPlaylistVideo` | Uses `PlaylistService` observable, `*ngFor` replaces `ng-repeat` |

### 3. Phase 4: Migrate Main Directive & Remove AngularJS

#### 4a. `ngVideo` → `NgVideoComponent`
The parent container (398 lines). Manages video element lifecycle, playlist navigation, auto-play.

#### 4b. `VideoController` → `AppComponent`
Convert the example app controller to an Angular component.

#### 4c. Remove AngularJS entirely
- Remove `UpgradeModule` and all `downgradeComponent`/`downgradeInjectable` calls
- Remove event bridge
- Remove AngularJS script includes from `angular.json`
- Remove `angular` package from dependencies
- Pure Angular bootstrap in `main.ts`

### 4. Phase 6: Cleanup

- Delete `Gruntfile.js`, `bower.json`, `.bowerrc`, `.jshintrc`
- Delete `KarmaUnit.js` and `tests/Spec.js`
- Delete `components/*.js` (all migrated to `src/app/`)
- Update `package.json` scripts
- Final `ng build --configuration production`

---

## Verification After Each Phase

1. Run `npx ng test --no-watch --browsers=ChromeHeadless` — all unit tests pass
2. Run `npx playwright test` — all 23 e2e tests pass
3. Manual smoke test: open `http://localhost:4200`, play a video, use controls
