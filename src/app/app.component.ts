import { Component, OnInit, ViewChild } from '@angular/core';
import { VideoService } from './services/video.service';
import { PlaylistService } from './services/playlist.service';
import { NgVideoComponent } from './components/ng-video/ng-video.component';
import { VideoSource } from './models/video-source.model';

@Component({
  selector: 'app-root',
  template: `
    <section class="ng-video-container">
      <ng-video class="video" #ngVideo>

        <vi-controls class="controls"></vi-controls>

        <vi-feedback class="feedback"></vi-feedback>

        <vi-playlist class="playlist"
                     [hidden]="!ngVideo.playlistOpen"
                     [videos]="playlistItems"
                     [videoNameFn]="getVideoName"
                     (selectVideo)="onPlaylistVideoClick($event)"
                     (close)="ngVideo.playlistOpen = false">
        </vi-playlist>

      </ng-video>
    </section>
  `,
})
export class AppComponent implements OnInit {
  playlistItems: (VideoSource | VideoSource[])[] = [];

  @ViewChild(NgVideoComponent) ngVideoComponent!: NgVideoComponent;

  private videos = {
    first: 'http://www.w3schools.com/html/mov_bbb.mp4',
    second: 'http://www.w3schools.com/html/movie.mp4',
  };

  constructor(
    private videoService: VideoService,
    private playlist: PlaylistService,
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
}
