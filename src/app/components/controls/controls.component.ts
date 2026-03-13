import { Component } from '@angular/core';
import { VideoPlayerContext } from '../../services/video-player-context';

@Component({
  selector: 'vi-controls',
  template: `
    <span title="Play" (click)="play()" class="glyphicon glyphicon-play"></span>
    <span title="Pause" (click)="pause()" class="glyphicon glyphicon-pause"></span>
  `,
})
export class ControlsComponent {
  constructor(private playerContext: VideoPlayerContext) {}

  play(): void {
    this.playerContext.play();
  }

  pause(): void {
    this.playerContext.pause();
  }
}
