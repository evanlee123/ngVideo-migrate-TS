import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VideoSource } from '../../models/video-source.model';

@Component({
  selector: 'vi-playlist',
  template: `
    <ul>
      <li class="title">
        <span class="glyphicon glyphicon-facetime-video"></span> &nbsp;
        Playlist
        <div class="close-playlist" title="Close Playlist" (click)="close.emit()">&times;</div>
      </li>
      <li *ngFor="let video of videos" (click)="selectVideo.emit(video)">
        <vi-meta [videoModel]="video" class="meta"></vi-meta>
        {{ videoNameFn(video) }}
      </li>
    </ul>
  `,
  styles: [`
    :host {
      height: 297px;
      position: absolute;
      width: 200px;
      top: 5px;
      left: 5px;
      background-color: rgba(0, 0, 0, .35);
    }
    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }
    ul li {
      height: 32px;
      line-height: 32px;
      cursor: pointer;
      position: relative;
      padding: 0 12px;
      text-shadow: 1px 1px 0 rgba(0, 0, 0, .25);
      color: white;
      font-size: 12px;
    }
    ul li .meta {
      margin-right: 8px;
      padding: 1px 5px;
      border-radius: 2px;
      background-color: rgba(0, 0, 0, .25);
    }
    ul li.title {
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(0, 0, 0, .25);
    }
    ul li:not(.title):hover {
      background: rgba(0, 0, 0, .25);
    }
    ul li.title div.close-playlist {
      position: absolute;
      top: -1px;
      font-size: 20px;
      right: 0;
      cursor: pointer;
      width: 35px;
      text-align: center;
      color: white;
    }
  `],
})
export class PlaylistComponent {
  @Input() videos: (VideoSource | VideoSource[])[] = [];
  @Input() videoNameFn: (video: VideoSource | VideoSource[]) => string = () => 'Unknown';
  @Output() selectVideo = new EventEmitter<VideoSource | VideoSource[]>();
  @Output() close = new EventEmitter<void>();
}
