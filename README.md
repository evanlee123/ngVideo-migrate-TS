# ngVideo

An HTML5 video player library built with Angular 17 with **Web Components library** (via Angular Elements) — use `<ng-video>` in any HTML page with a single script tag.

Demo available by building the app.

## Prerequisites

- Node.js (v18+)
- npm

## Installation

```bash
npm install
```

**Web Components build:**

```bash
npm run build:elements
```
Produces `dist/ng-video-elements/ng-video-bundle.js` — a single script that registers all components as custom elements.

## Demo
### Angular server demo
**Development server:**

```bash
npm start
```

Opens at [http://localhost:4200](http://localhost:4200).

### Running Web Components site
A demo page is available at `website/index.html`. Build the elements bundle first, then open the file in a browser:

```bash
npm run build:elements
open website/index.html
```

## Testing

**Unit tests (Karma/Jasmine):**

```bash
npm test
```

**End-to-end tests (Playwright):**

```bash
npm run test:e2e
```

## Usage

### Web Components (standalone)

Include the bundle and use the custom element tags in any HTML page:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css">
<script src="ng-video-bundle.js"></script>

<ng-video id="player">
  <vi-controls></vi-controls>
  <vi-feedback></vi-feedback>
  <vi-playlist></vi-playlist>
</ng-video>

<script>
  customElements.whenDefined('ng-video').then(() => {
    const player = document.getElementById('player');
    player.addSource('mp4', 'https://example.com/video.mp4');
    player.addSource('mp4', 'https://example.com/video2.mp4');
  });
</script>
```

Full-screen and playlist toggle buttons are built into `<ng-video>`.

**Global configuration** — set options before loading the script:

```html
<script>
  window.ngVideoConfig = { REFRESH: 100, VOLUME_STEPS: 0.2 };
</script>
<script src="ng-video-bundle.js"></script>
```

### Angular Module

Import `NgVideoSharedModule` into your Angular application:

```typescript
import { NgVideoSharedModule } from './ng-video-shared.module';

@NgModule({
  imports: [NgVideoSharedModule],
  // ...
})
export class AppModule {}
```

Then use the components in your templates:

```html
<ng-video>
  <vi-controls></vi-controls>
  <vi-feedback></vi-feedback>
  <vi-playlist [videos]="items" (selectVideo)="onSelect($event)"></vi-playlist>
</ng-video>
```

Add videos via `VideoService`:

```typescript
import { VideoService } from './services/video.service';

constructor(private video: VideoService) {}

ngOnInit() {
  this.video.addSource('mp4', 'https://example.com/video.mp4');
}
```

### Multi-Source (Fallback)

Provide multiple formats so the browser can pick a supported one:

```typescript
const source = this.video.multiSource();
source.addSource('mp4', 'https://example.com/video.mp4');
source.addSource('ogg', 'https://example.com/video.ogg');
source.save();
```

### Available Components

| Component | Description |
|---|---|
| `<ng-video>` | Container: hosts `<video>` element, manages playback, fullscreen, playlist toggle |
| `<vi-controls>` | Play and pause buttons |
| `<vi-volume>` | Volume control with increase/decrease |
| `<vi-timeline>` | Seekable timeline slider |
| `<vi-buffer>` | Visual buffer progress (canvas) |
| `<vi-feedback>` | Real-time status (current time, duration, loading state) |
| `<vi-messages>` | Video event log |
| `<vi-playlist>` | Playlist management |
| `<vi-meta>` | Video metadata display (e.g. duration) |

### Configuration Options

| Option | Default | Description |
|---|---|---|
| `REFRESH` | `50` | Property refresh interval (ms) |
| `VOLUME_STEPS` | `0.1` | Volume increment/decrement step |
| `VOLUME_MINIMUM` | `0` | Minimum volume |
| `VOLUME_MAXIMUM` | `1` | Maximum volume |
| `SCREEN_CHANGE` | `true` | Toggle play/pause on video click |
| `TIMELINE_CHANGE` | `true` | Allow seeking via timeline |
| `BUFFER_COLOUR` | `#dd4b39` | Buffer bar color |
| `BUFFER_HEIGHT` | `1` | Buffer canvas height |
| `BUFFER_WIDTH` | `485` | Buffer canvas width |



## Known Limitations

- **Single instance only**: Services are singletons, so multiple `<ng-video>` elements on the same page share state.
- **Bootstrap CSS**: Consumers must include Bootstrap 3 CSS for glyphicon icons.
- **Zone.js**: The bundle includes `zone.js`, which patches global APIs and may conflict with other frameworks.

## Previous Version

This project is a migration of the original AngularJS library to Angular with TypeScript. The original repository is at [https://github.com/Wildhoney/ngVideo](https://github.com/Wildhoney/ngVideo).

## License

MIT
