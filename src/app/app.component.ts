import { Component, OnInit, ViewChild } from '@angular/core';
import { VideoService } from './services/video.service';
import { PlaylistService } from './services/playlist.service';
import { VideoPlayerContext } from './services/video-player-context';
import { NgVideoComponent } from './components/ng-video/ng-video.component';
import { VideoSource } from './models/video-source.model';

@Component({
  selector: 'app-root',
  template: `
    <section class="ng-video-container">
      <ng-video class="video">

        <vi-controls class="controls"></vi-controls>

        <section class="full-screen">
          <span title="Full Screen" (click)="toggleFullScreen()" class="glyphicon glyphicon-fullscreen"></span>
        </section>

        <vi-feedback class="feedback"></vi-feedback>

        <vi-playlist class="playlist"
                     [hidden]="!playlistOpen"
                     [videos]="playlistItems"
                     [videoNameFn]="getVideoName"
                     (selectVideo)="onPlaylistVideoClick($event)"
                     (close)="playlistOpen = false">
        </vi-playlist>

        <span title="Open Playlist"
              *ngIf="!playlistOpen"
              (click)="playlistOpen = true"
              class="open-playlist glyphicon glyphicon-facetime-video">
        </span>

      </ng-video>
    </section>
  `,
})
export class AppComponent implements OnInit {
  playlistOpen = false;
  playlistItems: (VideoSource | VideoSource[])[] = [];

  @ViewChild(NgVideoComponent) ngVideoComponent!: NgVideoComponent;

  private videos = {
    first: 'http://www.w3schools.com/html/mov_bbb.mp4',
    second: 'http://www.w3schools.com/html/movie.mp4',
  };

  constructor(
    private videoService: VideoService,
    private playlist: PlaylistService,
    private playerContext: VideoPlayerContext,
  ) {}

  ngOnInit(): void {
    this.videoService.addSource('mp4', this.videos.first);
    this.videoService.addSource('mp4', this.videos.second);

    this.playlist.getAll$().subscribe(items => {
      this.playlistItems = items;
    });
  }

  getVideoName = (videoModel: VideoSource | VideoSource[]): string => {
    const src = Array.isArray(videoModel) ? videoModel[0]?.src : videoModel.src;
    switch (src) {
      case this.videos.first: return 'Big Buck Bunny';
      case this.videos.second: return 'The Bear';
      default: return 'Unknown Video';
    }
  };

  onPlaylistVideoClick(video: VideoSource | VideoSource[]): void {
    this.ngVideoComponent.open(video);
  }

  toggleFullScreen(): void {
    if (document.fullscreenElement) {
      this.playerContext.closeFullScreen();
    } else {
      this.playerContext.openFullScreen();
    }
  }
}
