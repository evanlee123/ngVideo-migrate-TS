import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VideoPlayerContext {
  player: HTMLVideoElement | null = null;
  container: HTMLElement | null = null;

  readonly playing$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = new BehaviorSubject<boolean>(true);

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
}
