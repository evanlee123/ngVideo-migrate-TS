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
})
export class PlaylistComponent {
  @Input() videos: (VideoSource | VideoSource[])[] = [];
  @Input() videoNameFn: (video: VideoSource | VideoSource[]) => string = () => 'Unknown';
  @Output() selectVideo = new EventEmitter<VideoSource | VideoSource[]>();
  @Output() close = new EventEmitter<void>();
}
