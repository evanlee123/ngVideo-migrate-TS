# Lessons Learned: NgVideo Migration

## Architecture & Planning

### 1. Scope inheritance is the hardest part to migrate

The original ngVideo codebase uses **prototypal scope inheritance** (`scope: true`) as its primary inter-component communication mechanism. Every child directive reads `scope.player`, `scope.playing`, `scope.loading`, etc. directly from the parent `ngVideo` directive's scope.

Angular has no equivalent to this pattern. The solution is a **`VideoPlayerContext` injectable service** that acts as the shared state container. This is the single most important architectural decision in the migration — it replaces an implicit coupling mechanism with an explicit one.

### 2. `$rootScope.$broadcast` maps cleanly to RxJS Subjects

The codebase uses 6 event channels via `$rootScope.$broadcast`:
- `ng-video/add`, `ng-video/reset`, `ng-video/attach-events`, `ng-video/volume`, `ng-video/feedback/refresh`, `ng-video/seekable`

Each maps directly to a typed RxJS `Subject` in a `VideoEventService`. This is one of the cleaner parts of the migration. However, during the hybrid period, a **temporary event bridge** is needed to sync `$broadcast` ↔ RxJS so that unmigrated AngularJS directives and migrated Angular components can communicate.

### 3. `downgradeComponent` only works for components, not attribute directives

This was a key discovery. Many ngVideo directives are used as attributes on native elements (e.g., `<video vi-screen>`, `<span vi-controls-play>`). Angular's `downgradeComponent` from `@angular/upgrade/static` only works with Angular **components** — it cannot wrap an Angular attribute directive for use in AngularJS templates.

**Workaround options:**
- Keep attribute directives as thin AngularJS wrappers that delegate to Angular services during the hybrid phase
- Convert them to Angular components with `<ng-content>` and change HTML usage patterns (e.g., `<vi-controls-play><span>...</span></vi-controls-play>`)
- Wait until the parent container is migrated, then convert everything at once

The first option (thin wrappers) creates the least disruption during migration.

### 4. Migration order must follow the dependency graph bottom-up

The dependency direction in ngVideo is:
```
Services (no deps) → Leaf directives → Container directives → ngVideo (parent) → App
```

**Services first** because they have no Angular dependencies and can be downgraded immediately. **Leaf directives next** because they only consume from the parent scope (now `VideoPlayerContext`). **Container directives** after their children. **The main `ngVideo` directive last** because every child depends on it.

Attempting to migrate the parent first would require upgrading all children simultaneously — a big-bang approach that defeats the purpose of NgUpgrade.

### 5. No routing simplifies things enormously

NgVideo has no routing (`ui-router`, `ngRoute`, etc.). This eliminates one of the most complex aspects of NgUpgrade migrations — routing coexistence. The entire app is a single page with a video player component tree.

## Build System

### 6. Use the `browser` builder, not `application` builder

Angular 17 defaults to the new `application` builder (esbuild-based). For NgUpgrade hybrid apps, the older `browser` builder (webpack-based) is more compatible. The `application` builder can have issues with:
- Global scripts injection (needed for AngularJS files)
- CommonJS module handling
- Some NgUpgrade patterns

The `browser` builder in `angular.json` uses `"main"` instead of `"browser"` for the entry point.

### 7. AngularJS files load via `scripts` array in angular.json

The 14 AngularJS component files plus the app module and controller are loaded as global scripts through `angular.json`'s `architect.build.options.scripts` array. **Load order matters** — `Service.js` must come first (defines the `ngVideo` module), then `Bootstrap.js`, then all other components, then `Default.js` and `VideoController.js`.

### 8. AngularJS 1.8.3 from npm (not Bower)

The original project used Bower for AngularJS 1.2.19. For the migration, we install `angular@1.8.3` from npm. AngularJS 1.8.x is the latest release and is required for compatibility with `@angular/upgrade/static` (which officially supports AngularJS 1.5+). The upgrade from 1.2 to 1.8 is non-breaking for this codebase.

Bower is eliminated entirely — no more `.bowerrc` or `bower.json`.

## Testing

### 9. Playwright browser installation may fail in CI/restricted environments

Playwright downloads its own Chromium binary, which requires network access and specific system libraries. In sandboxed or offline environments, this download can fail. Mitigations:
- Use `PLAYWRIGHT_BROWSERS_PATH` to point to a pre-installed browser
- Install system dependencies with `npx playwright install --with-deps`
- Fall back to an already-installed Chrome/Chromium
- Configure `playwright.config.ts` to use `channel: 'chrome'` for system Chrome

### 10. Write e2e tests BEFORE migration, run AFTER each phase

The Playwright e2e tests serve as regression guards. They should verify the app works identically before any migration begins. After each phase, the same tests must pass. This catches:
- Broken component communication during hybrid mode
- Missing event bridge connections
- Change detection timing issues between AngularJS and Angular

### 11. Unit tests should mock `VideoPlayerContext` and `VideoEventService`

Since every migrated component depends on these two services, every unit test needs mock versions. Establish a shared test utilities file (`src/app/testing/mocks.ts`) with:
- `createMockVideoPlayerContext()` — returns a `jasmine.SpyObj` with `BehaviorSubject` properties
- `createMockVideoEventService()` — returns a spy with `Subject` properties

This avoids duplicating mock setup across 15+ spec files.

## Hybrid Period Gotchas

### 12. `$scope.$apply()` is unnecessary in Angular but needed in hybrid mode

When AngularJS code calls into Angular services (or vice versa), change detection may not trigger automatically. During the hybrid period, `UpgradeModule` coordinates the two change detection systems, but some edge cases require manual `$scope.$apply()` or `NgZone.run()`. Watch for:
- Event handlers that update Angular state from AngularJS callbacks
- RxJS subscriptions that modify AngularJS scope properties

### 13. The event bridge is temporary — track it for deletion

The `event-bridge.ts` file syncs `$rootScope.$broadcast` with RxJS Subjects. It's easy to forget about. Mark it clearly as temporary and add a TODO comment with the deletion condition: "Delete this file after Phase 4c (remove AngularJS)."

### 14. Assets (media, images) need explicit mapping in angular.json

The original app served media files from `example/media/` via Express static file serving. Angular CLI needs explicit asset mappings in `angular.json`:
```json
{ "glob": "**/*", "input": "example/media", "output": "/media" }
```
Without this, video files won't load and the player will appear broken.
