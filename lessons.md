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

### 13. Dual-emit beats a separate event bridge

The original plan called for a dedicated `event-bridge.ts` file to bidirectionally sync `$rootScope.$broadcast` ↔ RxJS Subjects. In practice, **dual-emitting at the call site** is simpler and avoids infinite-loop risks:

```javascript
$rootScope.$broadcast('ng-video/volume', player.volume);
videoEventService.volumeChanged$.next(player.volume);
```

Each refactored AngularJS directive emits to both systems inline. No separate file to maintain, no loop guards needed, and the dual-emit is easy to grep for and delete in Phase 4c. The `ajs-downgrade.ts` file that registers `downgradeInjectable`/`downgradeComponent` is the only bridge file — mark it with a TODO for deletion.

### 14. Assets (media, images) need explicit mapping in angular.json

The original app served media files from `example/media/` via Express static file serving. Angular CLI needs explicit asset mappings in `angular.json`:
```json
{ "glob": "**/*", "input": "example/media", "output": "/media" }
```
Without this, video files won't load and the player will appear broken.

### 15. `bootstrap: [AppComponent]` prevents `ngDoBootstrap()` from running

When the `@NgModule` decorator has `bootstrap: [AppComponent]`, Angular handles bootstrapping automatically and **does NOT call `ngDoBootstrap()`**. This means `this.upgrade.bootstrap(document.body, ['videoApp'])` never executes, and AngularJS never compiles the template — all `{{expressions}}` render as raw text, directives don't initialize, and no scopes are created.

**Fix:** Remove `bootstrap: [AppComponent]` from the NgModule decorator. `ngDoBootstrap()` is only called when the `bootstrap` array is empty. In hybrid mode, AngularJS manages the root template, so there's no need to bootstrap an Angular root component.

### 16. Playwright `channel: 'chrome'` avoids browser compatibility issues

The bundled Chromium from Playwright 1.40 (chromium-1091) crashes on macOS Sequoia with "Target page, context or browser has been closed". Using `channel: 'chrome'` in the Playwright config to use the system-installed Chrome avoids this entirely and removes the need to download a separate browser binary.

## Phase 2 Lessons

### 17. Thin wrappers are the right approach for attribute directives

Attribute directives (e.g., `<video vi-screen>`, `<span vi-controls-play>`) can't be converted to Angular components via `downgradeComponent` because downgraded components are always **element** directives. The hybrid-period solution is to keep the AngularJS directive file but refactor the logic body to inject and delegate to Angular services (`videoPlayerContext`, `videoEventService`). This means:

- The AngularJS directive remains the "shell" (handles DOM binding, `element.bind('click', ...)`)
- The Angular service is the "brain" (holds state, executes logic)
- When the parent container is migrated (Phase 3–4), the shell can be deleted and replaced with Angular event bindings in the component template

### 18. Self-contained polling works better than cross-framework scope watchers

The original Buffer and Timeline directives watch `scope.lastUpdate` (set by Feedback's `$interval` polling). When these become Angular components, they can't `$watch` an AngularJS scope property. Rather than building a complex bridge, each Angular component uses its own `interval(REFRESH)` merged with the relevant RxJS event stream:

```typescript
merge(interval(this.options.REFRESH), this.events.feedbackRefresh$)
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => this.drawBuffer());
```

This decouples the component from Feedback's polling lifecycle. The slight overhead of independent polling is negligible at 50ms intervals, and it simplifies the architecture.

### 19. Remove AngularJS scripts from `angular.json` when replacing with Angular components

When an AngularJS directive is fully replaced by a downgraded Angular component with the same directive name (e.g., `viBuffer`), the old `.js` file **must** be removed from the `angular.json` `scripts` array. Otherwise AngularJS registers two directives with the same name, causing double compilation and unpredictable behavior.

### 20. `downgradeComponent` element directives need HTML changes

Downgraded Angular components register as **element** directives in AngularJS. If the original used an attribute (`<section vi-buffer>`), the HTML must change to an element (`<vi-buffer>`). To preserve CSS selectors and e2e tests that use parent class selectors (e.g., `section.buffer canvas`), wrap the new element in the original container:

```html
<!-- Before -->
<section vi-buffer class="buffer"></section>

<!-- After -->
<section class="buffer"><vi-buffer></vi-buffer></section>
```

CSS descendant selectors like `section.buffer canvas` still match because Angular components don't use Shadow DOM by default.

### 21. `ngModel` + `ng-repeat` blocks downgrade during hybrid period

The `viMeta` directive uses `require: 'ngModel'` and is placed inside `ng-repeat`. Both patterns are deeply AngularJS-specific:
- `require: 'ngModel'` expects an AngularJS `ngModelController` on the element
- `ng-repeat` creates AngularJS scopes that downgraded components can't participate in naturally

The Angular `MetaComponent` was created and unit-tested, but left unwired. It will be wired in when its parent (`viPlaylist`) is migrated to Angular (Phase 3e), at which point `ng-repeat` becomes `*ngFor` and `ngModel` becomes `@Input()`.

### 22. AngularJS service injection in directive factories works via closure

When refactoring AngularJS directive factories to inject Angular services, the services are available inside nested controllers and link functions via JavaScript closure — no need to re-inject at the controller level:

```javascript
module.directive('viVolume', ['ngVideoOptions', 'videoPlayerContext', 'videoEventService',
function(ngVideoOptions, videoPlayerContext, videoEventService) {
    return {
        controller: ['$scope', function($scope) {
            // videoPlayerContext is accessible here via closure
            $scope.setVolume = function(volume) {
                videoPlayerContext.player.volume = volume;
            };
        }]
    };
}]);
```

## Phase 3 Lessons

### 23. Container directives with `scope: true` need careful scope chain analysis

When converting a container directive (e.g., `viPlaylist`) from an AngularJS directive with `scope: true` to a downgraded Angular component, the AngularJS child scope disappears. This changes the meaning of `$parent` in projected content:

- **Before:** `$parent` from the directive's child scope points to the parent scope (one level up)
- **After:** Without the child scope, `$parent` from the same DOM position points one level higher than expected

In ngVideo, `$parent.playlistOpen` worked because the playlist directive created a child scope, and `$parent` resolved to the ngVideo scope. After migration, `$parent` from the ngVideo scope resolves to the VideoController scope instead. The fix is to remove `$parent.` prefixes and use the property name directly, since the scope context is now the expected level.

### 24. `<ng-content>` wrappers are the path of least resistance for containers with mixed children

When a container directive has children that use deeply AngularJS-specific patterns (`require: 'ngModel'`, `ng-repeat`, attribute directives), converting the container to a `<ng-content>` wrapper is far simpler than migrating all children simultaneously. The projected content continues to be compiled by AngularJS, so all AngularJS features work. The container directive's logic moves to Angular services.

### 25. Expose shared state on the nearest AngularJS scope for projected content

When an AngularJS directive's controller sets scope properties that its template reads (e.g., `$scope.videos = ngVideoPlaylist`), and the directive is converted to an Angular `<ng-content>` component, the projected content can no longer access those properties (no AngularJS scope). The fix is to set the property on the nearest surviving AngularJS scope. In ngVideo, `Bootstrap.js` sets `scope.playlistItems = ngVideoPlaylist` so that `ng-repeat="video in playlistItems"` works in the projected playlist content.

### 26. Moving template into Angular component eliminates scope property problems

For the `viFeedback` container (which exposes ~10 scope properties like `currentTime`, `duration`, `volume`), moving the entire template into the Angular component is cleaner than `<ng-content>`. Angular bindings (`{{ currentTime | number:'1.2-2' }}`) replace AngularJS expressions. Child Angular components (`vi-timeline`, `vi-buffer`, `vi-messages`) are used directly in the template. Only children still in AngularJS need `<ng-content>`.

### 27. Volume leaf directives must inject services directly after container migration

When `viVolume` (the container) becomes Angular, its AngularJS child scope disappears. Leaf directives (`viVolumeDecrease`, etc.) that called `scope.setVolume()` via scope inheritance must be updated to inject `videoPlayerContext` directly and call `videoPlayerContext.setVolume()`. Adding `setVolume()` to `VideoPlayerContext` centralizes volume management and removes the scope dependency.

## Phase 4 Lessons

### 28. The final AngularJS removal is best done as a single step

Attempting to do Phase 4a (ngVideo → NgVideoComponent) as a hybrid step creates a circular problem: the leaf directives (vi-screen, vi-controls-play, etc.) are AngularJS attribute directives that only work when AngularJS compiles the DOM. If the parent container becomes Angular and projects content via `<ng-content>`, the projected content is no longer AngularJS-compiled. So the leaf directives break.

The solution is to do 4a + 4b + 4c together: convert the main directive, convert the controller, and remove AngularJS simultaneously. This works because all complex logic already lives in Angular services (`VideoPlayerContext`, `VideoEventService`). The remaining AngularJS attribute directives are trivial click handlers that can be replaced with `(click)` event bindings.

### 29. Replace attribute directives with template event bindings, not Angular directives

The 15+ AngularJS attribute directives (`vi-screen`, `vi-controls-play`, `vi-volume-decrease`, etc.) are all click event handlers that delegate to Angular services. Creating Angular attribute directives for each would be over-engineering. Instead, inline the logic:

- `<span vi-controls-play>` → `<span (click)="play()">`
- `<span vi-volume-decrease>` → `<span (click)="decreaseVolume()">`
- `<video vi-screen>` → `<video (click)="onScreenClick()">`

This eliminates ~8 directive files and keeps the logic visible in templates.

### 30. `<ng-content>` wrappers become real components when AngularJS is removed

During the hybrid period, several components (`ControlsComponent`, `VolumeComponent`, `PlaylistComponent`) were `<ng-content>` wrappers because their projected content used AngularJS features. When AngularJS is removed, these components get real templates with Angular bindings. The wrapper pattern was a temporary bridge, not the final architecture.

### 31. `forceVideo` property must become observable for Angular consumption

The AngularJS `$scope.$watch` on `video.forceVideo` worked because AngularJS digest cycles poll all watched expressions. Angular has no equivalent polling mechanism. Converting `forceVideo` from a plain property to a `Subject`-based observable (`forceVideo$`) allows `NgVideoComponent` to react to forced video changes via `subscribe()`.

### 32. CSS selectors must be updated when `<section>` elements become custom elements

When `<section class="video" ng-video>` becomes `<ng-video class="video">`, CSS selectors like `section.video` no longer match. Similarly, `<section vi-volume>` → `<vi-volume>` breaks `section.volume`. The fix is to remove tag-name requirements from selectors: `section.video` → `.video`, `section.controls` → `.controls`. Custom elements also need `display: block` since they default to `inline`.

### 33. Component lifecycle ordering matters for initialization

AppComponent's `ngOnInit` fires before NgVideoComponent's `ngAfterViewInit`. Placing `addSource()` calls in AppComponent's `ngOnInit` ensures playlist items exist when NgVideoComponent initializes and checks the playlist. The `videoAdded$` events are emitted before NgVideoComponent subscribes, but NgVideoComponent's init independently checks `playlist.getAll()` and opens the first video.
