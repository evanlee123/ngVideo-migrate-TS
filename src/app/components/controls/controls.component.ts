import { Component } from '@angular/core';
import { VideoPlayerContext } from '../../services/video-player-context';

@Component({
  selector: 'vi-controls',
  template: `
    <span title="Play" (click)="play()" class="glyphicon glyphicon-play"></span>
    <span title="Pause" (click)="pause()" class="glyphicon glyphicon-pause"></span>
  `,
  styles: [`
    :host {
      position: absolute;
      top: 15px;
      right: 25px;
      width: 48px;
      z-index: 5;
      text-align: center;
      color: white;
    }
    span {
      margin: 0;
      padding: 0;
      cursor: pointer;
      line-height: 48px;
      padding-left: 2px;
      width: 48px;
      height: 48px;
      font-size: 20px;
      transition: background-color .35s;
      border-radius: 3px;
      margin-bottom: 10px;
    }
    span:hover {
      background-color: rgba(255, 255, 255, .25);
    }
  `],
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
