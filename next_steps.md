# Next Steps: NgVideo AngularJS → Angular 17 Migration

## Current Status

- **Phase 0 (Complete):** Angular 17 project scaffolded alongside AngularJS. Hybrid bootstrap with `UpgradeModule`.
- **Phase 5 (Complete):** 23 Playwright e2e regression tests. Uses system Chrome (`channel: 'chrome'`).
- **Phase 1 (Complete):** Core services and constants migrated to Angular TypeScript. 58 unit tests.
- **Phase 2 (Complete):** Leaf directives migrated. 84 unit tests, 23 e2e tests pass.
- **Phase 3 (Complete):** All container directives migrated (3a–3e). 121 unit tests, 23 e2e tests pass.
- **Phase 4 (Complete):** Main directive & app migrated, AngularJS removed entirely. 147 unit tests, 23 e2e tests pass.

### Phase 4 Files Created/Modified

| File | What changed |
|------|-------------|
| `src/app/components/ng-video/ng-video.component.ts` | NEW — Main video component replacing `ngVideo` directive |
| `src/app/app.component.ts` | REWRITTEN — Root app component replacing `VideoController` |
| `src/app/app.module.ts` | Removed `UpgradeModule`, added `bootstrap: [AppComponent]`, declared `NgVideoComponent` and `MetaComponent` |
| `src/main.ts` | Removed `ajs-downgrade` import — pure Angular bootstrap |
| `src/index.html` | Simplified to just `<app-root>` |
| `src/app/components/controls/controls.component.ts` | Real template with play/pause buttons, injects `VideoPlayerContext` |
| `src/app/components/volume/volume.component.ts` | Real template with volume bar and decrease/increase buttons |
| `src/app/components/feedback/feedback.component.ts` | Replaced `<ng-content>` with `<vi-volume>` directly in template |
| `src/app/components/playlist/playlist.component.ts` | Real template with `*ngFor`, inputs/outputs for videos and events |
| `src/app/services/video.service.ts` | Added `forceVideo$` Subject and `setForceVideo()` method |
| `src/styles.css` | Updated CSS selectors: `section.video` → `.video`, `section.controls` → `.controls`, etc. |
| `angular.json` | Removed all AngularJS scripts from build |
| `src/app/ajs-downgrade.ts` | DELETED — no longer needed |
| `e2e/video-player.spec.ts` | Updated selectors for pure Angular DOM structure |

---

## Immediate Next Steps

### Phase 6: Cleanup

- Delete `Gruntfile.js`, `bower.json`, `.bowerrc`, `.jshintrc`
- Delete `KarmaUnit.js` and `tests/Spec.js`
- Delete all `components/*.js` files (no longer loaded or used)
- Delete `example/js/Default.js` and `example/js/controllers/VideoController.js`
- Update `package.json` scripts — remove grunt/bower references
- Remove `angular` (AngularJS 1.x) and `@angular/upgrade` from dependencies
- Final `ng build --configuration production`

---

## Verification After Each Phase

1. `npx ng test --no-watch --browsers=ChromeHeadless` — all unit tests pass
2. `npx playwright test` — all 23 e2e tests pass
3. Manual smoke test: `http://localhost:4200`, play a video, use controls
