# ngVideo

An HTML5 video player library built with Angular 17. Provides modular, reusable components for video playback, playlists, volume control, and more.

## Prerequisites

- Node.js (v18+)
- npm

## Installation

```bash
npm install
```

## Running

**Development server:**

```bash
npm start
```

Opens at [http://localhost:4200](http://localhost:4200).

**Production build:**

```bash
npm run build
```

Output goes to `dist/ng-video-angular/`.

**Watch mode (rebuild on changes):**

```bash
npm run watch
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

### Basic Setup

Import `AppModule` (or the individual components) into your Angular application. The minimum required components are `<ng-video>` (container) and a `<video>` element inside it.

```html
<ng-video>
  <video></video>
</ng-video>
```

### Adding Video Sources

Inject `VideoService` into your component to add videos:

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

All child components are optional and can be mixed and matched:

| Component | Description |
|---|---|
| `<vi-controls>` | Play and pause buttons |
| `<vi-volume>` | Volume control with increase/decrease/mute |
| `<vi-timeline>` | Seekable timeline slider |
| `<vi-buffer>` | Visual buffer progress (canvas) |
| `<vi-feedback>` | Real-time status (current time, duration, loading state) |
| `<vi-messages>` | Video event log |
| `<vi-playlist>` | Playlist management |
| `<vi-meta>` | Video metadata display (e.g. duration) |

### Full Example

```html
<ng-video>
  <video></video>

  <vi-controls></vi-controls>
  <vi-timeline></vi-timeline>
  <vi-volume></vi-volume>
  <vi-feedback></vi-feedback>
  <vi-playlist></vi-playlist>
</ng-video>
```

### Configuration

Inject `ngVideoOptions` to customize behavior:

```typescript
import { ngVideoOptions } from './services/video-options';

// Adjust in your component or service:
ngVideoOptions.REFRESH = 50;            // Property refresh interval (ms)
ngVideoOptions.VOLUME_STEPS = 0.1;      // Volume increment/decrement step
ngVideoOptions.BUFFER_COLOUR = '#00f';  // Buffer bar color
```

## Demo

A demo page is available at `website/index.html`. Build the project first (`npm run build`), then open the file in a browser.

## Previous Version

This project is a migration of the original AngularJS library to Angular with TypeScript. The original repository is at [https://github.com/Wildhoney/ngVideo](https://github.com/Wildhoney/ngVideo).

## License

MIT
