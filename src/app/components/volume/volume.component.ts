import {
  Component, Inject, OnInit, OnDestroy,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { VideoOptions } from '../../models/video-source.model';

@Component({
  selector: 'vi-volume',
  template: `
    <div class="scale">
      <div class="bar" [style.width.%]="volume * 100"></div>
    </div>
    <span (click)="decreaseVolume()" title="Decrease Volume" class="decrease glyphicon glyphicon-minus"></span>
    <span (click)="increaseVolume()" title="Increase Volume" class="increase glyphicon glyphicon-plus"></span>
  `,
  styles: [`
    :host {
      position: absolute;
      top: 145px;
      right: 25px;
      width: 48px;
    }
    div.scale {
      background-color: rgba(0, 0, 0, .15);
      width: 48px;
      height: 5px;
      position: relative;
    }
    div.scale div.bar {
      background-color: rgba(255, 255, 255, .75);
      position: absolute;
      top: 0;
      left: 0;
      height: 5px;
      width: 50%;
      transition: width .25s;
    }
    span {
      color: rgba(0, 0, 0, .25);
      font-size: 15px;
      pointer-events: all;
      cursor: pointer;
      margin-top: 10px;
    }
    span.increase {
      float: right;
    }
  `],
})
export class VolumeComponent implements OnInit, OnDestroy {
  volume = 1;
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(VIDEO_OPTIONS) private options: VideoOptions,
    private playerContext: VideoPlayerContext,
    private events: VideoEventService,
  ) {}

  ngOnInit(): void {
    this.events.volumeChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateVolume();
    });

    this.events.attachEvents$.pipe(takeUntil(this.destroy$)).subscribe((player) => {
      player.addEventListener('volumechange', () => this.updateVolume());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  decreaseVolume(): void {
    const current = this.playerContext.player?.volume ?? 0;
    this.playerContext.setVolume(current - this.options.VOLUME_STEPS);
    this.events.volumeChanged$.next(this.playerContext.player?.volume ?? 0);
  }

  increaseVolume(): void {
    const current = this.playerContext.player?.volume ?? 0;
    this.playerContext.setVolume(current + this.options.VOLUME_STEPS);
    this.events.volumeChanged$.next(this.playerContext.player?.volume ?? 0);
  }

  private updateVolume(): void {
    this.volume = this.playerContext.player?.volume ?? 1;
  }
}
