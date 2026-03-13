import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VIDEO_OPTIONS } from './video-options.config';
import { VideoOptions } from '../models/video-source.model';

@Injectable({ providedIn: 'root' })
export class VideoPlayerContext {
  player: HTMLVideoElement | null = null;
  container: HTMLElement | null = null;

  readonly playing$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = new BehaviorSubject<boolean>(true);

  constructor(@Inject(VIDEO_OPTIONS) private options: VideoOptions) {}

  toggleState(): void {
    if (!this.player) return;
    if (this.playing$.value) {
      this.pause();
    } else {
      this.play();
    }
  }

  play(): void {
    this.player?.play();
  }

  pause(): void {
    this.player?.pause();
  }

  openFullScreen(): void {
    if (!this.container) return;
    if (this.container.requestFullscreen) {
      this.container.requestFullscreen();
    }
  }

  closeFullScreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  setVolume(volume: number): void {
    if (!this.player) return;

    if (this.player.muted && volume > 0) {
      this.player.muted = false;
    }

    volume = Math.max(this.options.VOLUME_MINIMUM, Math.min(this.options.VOLUME_MAXIMUM, volume));
    this.player.volume = +volume.toFixed(2);
  }
}
