# Next Steps: NgVideo AngularJS → Angular 17 Migration

## Current Status

- **Phase 0 (Complete):** Angular 17 project scaffolded alongside AngularJS. Hybrid bootstrap with `UpgradeModule`.
- **Phase 5 (Complete):** 23 Playwright e2e regression tests. Uses system Chrome (`channel: 'chrome'`).
- **Phase 1 (Complete):** Core services and constants migrated to Angular TypeScript. 58 unit tests.
- **Phase 2 (Complete):** Leaf directives migrated. 84 unit tests, 23 e2e tests pass.
- **Phase 3 (Complete):** All container directives migrated (3a–3e). 121 unit tests, 23 e2e tests pass.

### Phase 3 Files Created/Modified

| File | What changed |
|------|-------------|
| `src/app/components/controls/controls.component.ts` | NEW — `<ng-content>` wrapper replacing `viControls` directive |
| `src/app/components/volume/volume.component.ts` | NEW — `<ng-content>` wrapper replacing `viVolume` directive |
| `src/app/components/messages/messages.component.ts` | NEW — Self-contained component replacing `viMessages` directive |
| `src/app/components/feedback/feedback.component.ts` | NEW — Full Angular component with polling, replacing `viFeedback` directive |
| `src/app/services/video-player-context.ts` | Added `setVolume()` method with clamping and un-mute logic |
| `components/Controls.js` | Removed `viControls` directive; leaf directives (`viControlsPlay/Pause`) inject `videoPlayerContext` directly |
| `components/Volume.js` | Removed `viVolume` directive; leaf directives inject `videoPlayerContext` and `videoEventService` directly, call `setVolume()` |
| `src/app/ajs-downgrade.ts` | Added `downgradeComponent` for `ControlsComponent`, `VolumeComponent`, `MessagesComponent`, `FeedbackComponent` |
| `src/app/app.module.ts` | Declares all four new components |
| `angular.json` | Removed `Feedback.js`, `Messages.js` from scripts array |
| `src/index.html` | `vi-controls`, `vi-volume`, `vi-feedback`, `vi-messages` now use Angular components |
| `src/app/testing/mocks.ts` | Added `setVolume` to mock `VideoPlayerContext` |
| `e2e/video-player.spec.ts` | Updated selectors: `.controls`, `.volume`, `.feedback`, `.playlist`, `vi-messages` |
| `src/app/components/playlist/playlist.component.ts` | NEW — `<ng-content>` wrapper replacing `viPlaylist` directive |
| `components/Playlist.js` | Removed `viPlaylist` directive; `viPlaylistVideo` remains as AngularJS directive |
| `components/Bootstrap.js` | Added `scope.playlistItems = ngVideoPlaylist` for projected content access |

---

## Immediate Next Steps

### Phase 4: Migrate Main Directive & Remove AngularJS

#### 4a. `ngVideo` → `NgVideoComponent`
The parent container (~400 lines). Most logic already exists in `VideoPlayerContext` and `VideoEventService`. The component wires up the `<video>` element, handles playlist advancement on `ended`, and manages the `open()` method.

#### 4b. `VideoController` → `AppComponent`
Convert the example app controller to an Angular component. Manages `playlistOpen` state and initial video source loading.

#### 4c. Remove AngularJS entirely
- Delete `src/app/ajs-downgrade.ts` and all dual-emit `$rootScope.$broadcast` calls
- Remove `UpgradeModule` from `AppModule`
- Remove AngularJS scripts from `angular.json`
- Remove `angular` package from dependencies
- Pure Angular bootstrap in `main.ts`

### Phase 6: Cleanup
- Delete `Gruntfile.js`, `bower.json`, `.bowerrc`, `.jshintrc`
- Delete `KarmaUnit.js` and `tests/Spec.js`
- Delete all remaining `components/*.js`
- Update `package.json` scripts
- Final `ng build --configuration production`

---

## Verification After Each Phase

1. `npx ng test --no-watch --browsers=ChromeHeadless` — all unit tests pass
2. `npx playwright test` — all 23 e2e tests pass
3. Manual smoke test: `http://localhost:4200`, play a video, use controls
