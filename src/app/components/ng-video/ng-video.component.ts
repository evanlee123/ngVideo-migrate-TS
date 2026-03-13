import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, NgZone,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VideoService } from '../../services/video.service';
import { PlaylistService } from '../../services/playlist.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { VideoOptions, VideoSource } from '../../models/video-source.model';

@Component({
  selector: 'ng-video',
  template: `
    <video #videoPlayer (click)="onScreenClick()"></video>
    <ng-content></ng-content>
  `,
})
export class NgVideoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) videoPlayerRef!: ElementRef<HTMLVideoElement>;

  private currentVideo: VideoSource | VideoSource[] | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private playerContext: VideoPlayerContext,
    private events: VideoEventService,
    private videoService: VideoService,
    private playlist: PlaylistService,
    @Inject(VIDEO_OPTIONS) private options: VideoOptions,
    private ngZone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    const player = this.videoPlayerRef.nativeElement;
    const container = this.elementRef.nativeElement;

    this.playerContext.player = player;
    this.playerContext.container = container;

    this.attachEvents(player);
    this.events.attachEvents$.next(player);

    // Open first video if playlist already has items
    const items = this.playlist.getAll();
    if (items.length > 0) {
      this.currentVideo = items[0];
      this.open(this.currentVideo);
    }

    // Open first video when it's the only one added
    this.events.videoAdded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.playlist.length === 1) {
        this.currentVideo = this.playlist.getByIndex(0)!;
        this.open(this.currentVideo);
      }
    });

    // React to forced video changes (immediatelyPlay)
    this.videoService.forceVideo$.pipe(takeUntil(this.destroy$)).subscribe((video) => {
      this.open(video);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onScreenClick(): void {
    if (this.options.SCREEN_CHANGE && !this.playerContext.loading$.value) {
      this.playerContext.toggleState();
    }
  }

  open(videoModel: VideoSource | VideoSource[]): void {
    const player = this.playerContext.player;
    if (!player) return;

    if (Array.isArray(videoModel)) {
      for (const model of videoModel) {
        this.assertValid(model);
        if (player.canPlayType('video/' + model.type)) {
          this.loadVideo(model);
          break;
        }
      }
      return;
    }

    this.assertValid(videoModel);
    this.loadVideo(videoModel);
  }

  private assertValid(videoModel: VideoSource): void {
    if (!('src' in videoModel && 'type' in videoModel)) {
      this.videoService.throwException('Passed an invalid video model to open');
    }
  }

  private loadVideo(videoModel: VideoSource): void {
    const player = this.playerContext.player;
    if (!player) return;
    this.currentVideo = videoModel;
    player.setAttribute('src', videoModel.src);
    player.setAttribute('type', videoModel.type);
    player.load();
  }

  private attachEvents(player: HTMLVideoElement): void {
    player.addEventListener('play', () => {
      this.ngZone.run(() => this.playerContext.playing$.next(true));
    });

    player.addEventListener('pause', () => {
      this.ngZone.run(() => this.playerContext.playing$.next(false));
    });

    player.addEventListener('loadstart', () => {
      this.ngZone.run(() => this.playerContext.loading$.next(true));
    });

    player.addEventListener('loadeddata', () => {
      this.ngZone.run(() => {
        this.playerContext.loading$.next(false);
        this.events.videoReset$.next();

        if (this.playerContext.playing$.value || player.autoplay) {
          player.play();
        }
      });
    });

    player.addEventListener('ended', () => {
      this.ngZone.run(() => this.onVideoEnded(player));
    });
  }

  private onVideoEnded(player: HTMLVideoElement): void {
    const items = this.playlist.getAll();
    const index = items.indexOf(this.currentVideo!);

    const playByIndex = (i: number) => {
      this.currentVideo = items[i];
      this.open(items[i]);
      player.play();
    };

    if (index === -1 || !items[index + 1]) {
      if (player.loop) {
        playByIndex(0);
        return;
      }
      player.pause();
      return;
    }

    playByIndex(index + 1);
  }
}
