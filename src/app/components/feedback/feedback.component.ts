import {
  Component, Inject, OnDestroy, OnInit,
} from '@angular/core';
import { Subject, interval, merge, takeUntil } from 'rxjs';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { VideoOptions } from '../../models/video-source.model';

@Component({
  selector: 'vi-feedback',
  template: `
    <span class="buffering" *ngIf="buffering">Buffering...</span>

    <section class="loading" *ngIf="loading">
      Loading...
    </section>

    <vi-volume class="volume"></vi-volume>

    <section class="duration">
      {{ currentTime | number:'1.2-2' }}s of {{ duration | number:'1.2-2' }}s
      [{{ percentagePlayed | number:'1.0-0' }}%]
    </section>

    <section class="title">ngVideo</section>

    <section class="timeline">
      <vi-timeline></vi-timeline>
    </section>

    <section class="buffer">
      <vi-buffer></vi-buffer>
    </section>

    <section class="generic">
      V{{ volume }}
      <vi-messages></vi-messages>
      R{{ playbackRate }}
      P{{ playing ? 1 : 0 }}
      L{{ loading ? 1 : 0 }}
      B{{ buffered }}%
      <a href="https://github.com/Wildhoney/ngVideo" target="_blank">
        GitHub.com/Wildhoney/ngVideo
      </a>
    </section>
  `,
  styles: [`
    :host {
      top: 0;
      left: 0;
      position: absolute;
      pointer-events: none;
      z-index: 4;
      width: 100%;
      height: 100%;
    }
    span.buffering {
      color: white;
      font-size: 12px;
      position: absolute;
      top: 0;
      left: 0;
      padding: 18px 0 0 45px;
    }
    section.loading {
      position: absolute;
      top: 39px;
      left: 5px;
      width: 538px;
      height: 260px;
      color: white;
      text-shadow: 1px 1px 0 rgba(0, 0, 0, .25);
      font-size: 12px;
      pointer-events: all;
      z-index: 201;
      padding: 13px 0 0 40px;
      background-color: rgba(0, 0, 0, .25);
    }
    section.generic {
      position: absolute;
      bottom: 11px;
      right: 10px;
      z-index: 90;
      width: 100%;
      text-align: center;
      text-transform: uppercase;
      font-size: 10px;
      color: rgba(255, 255, 255, .5);
    }
    section.generic a {
      text-transform: none;
      color: rgba(255, 255, 255, .75);
      pointer-events: all;
    }
    section.generic a:hover {
      text-decoration: none;
    }
    section.duration {
      background-color: rgba(0, 0, 0, .15);
      color: rgba(255, 255, 255, .5);
      padding: 2px 5px;
      border-radius: 3px 0 0 3px;
      position: absolute;
      font-size: 11px;
      bottom: 62px;
      right: 83px;
    }
    section.title {
      background-color: #dd4b39;
      font-size: 11px;
      position: absolute;
      color: white;
      opacity: .8;
      padding: 2px 5px;
      border-radius: 0 3px 3px 0;
      bottom: 62px;
      right: 33px;
    }
  `],
})
export class FeedbackComponent implements OnInit, OnDestroy {
  duration = 0;
  currentTime = 0;
  volume = 1;
  playbackRate = 1;
  percentagePlayed = 0;
  buffered = 0;
  buffering = false;
  playing = false;
  loading = true;

  private lastTime = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(VIDEO_OPTIONS) private options: VideoOptions,
    private playerContext: VideoPlayerContext,
    private events: VideoEventService,
  ) {}

  ngOnInit(): void {
    // Subscribe to playing/loading state
    this.playerContext.playing$.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.playing = val;
      this.grabStatistics();
      if (val) {
        this.startPolling();
      } else {
        this.stopPolling();
      }
    });

    this.playerContext.loading$.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.loading = val;
    });

    // Force reset
    this.events.videoReset$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const player = this.playerContext.player;
      if (player) {
        player.currentTime = 0;
      }
      this.grabStatistics();
    });

    // Force volume refresh
    this.events.volumeChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateVolume();
    });

    // Force stats refresh
    this.events.feedbackRefresh$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.grabStatistics();
    });

    // Register native event listeners when player is attached
    this.events.attachEvents$.pipe(takeUntil(this.destroy$)).subscribe((player) => {
      player.addEventListener('timeupdate', () => this.grabStatistics());
      player.addEventListener('volumechange', () => this.updateVolume());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private pollingDestroy$ = new Subject<void>();

  private startPolling(): void {
    this.pollingDestroy$.next();
    interval(this.options.REFRESH)
      .pipe(takeUntil(this.pollingDestroy$), takeUntil(this.destroy$))
      .subscribe(() => this.grabStatistics());
  }

  private stopPolling(): void {
    this.pollingDestroy$.next();
  }

  private grabStatistics(): void {
    const player = this.playerContext.player;
    if (!player) return;

    // Determine if we're currently buffering
    if (this.lastTime === player.currentTime && !player.paused) {
      this.buffering = true;
      return;
    }

    this.lastTime = player.currentTime;
    this.buffering = false;

    // Update properties from player
    this.duration = isNaN(player.duration) ? this.duration : player.duration;
    this.currentTime = isNaN(player.currentTime) ? this.currentTime : player.currentTime;
    this.volume = isNaN(player.volume) ? this.volume : player.volume;
    this.playbackRate = isNaN(player.playbackRate) ? this.playbackRate : player.playbackRate;

    if (player.buffered.length !== 0) {
      this.buffered = Math.round(player.buffered.end(0) / player.duration) * 100;
    }

    if (player.muted) {
      this.volume = 0;
    }

    this.percentagePlayed = (this.currentTime / this.duration) * 100;
  }

  private updateVolume(): void {
    const player = this.playerContext.player;
    if (player) {
      this.volume = player.volume;
    }
  }
}
