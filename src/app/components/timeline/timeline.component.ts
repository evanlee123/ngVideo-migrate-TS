import {
  Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild,
} from '@angular/core';
import { Subject, interval, merge, takeUntil } from 'rxjs';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { VideoOptions } from '../../models/video-source.model';

@Component({
  selector: 'vi-timeline',
  template: '<input #rangeInput type="range" value="0" (mousedown)="onMouseDown()" (mouseup)="onMouseUp()" (change)="onChange()" />',
  styles: [`
    :host {
      position: absolute;
      width: calc(100% - 60px);
      left: 30px;
      bottom: 32px;
    }
    input {
      width: 100%;
      pointer-events: all;
      appearance: none;
      -o-appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      background-color: transparent;
      outline: none;
      height: 12px;
      border-bottom: 3px solid rgba(0, 0, 0, .25);
    }
    input::-webkit-slider-thumb {
      -webkit-appearance: none;
      background-color: white;
      margin-bottom: 20px;
      border-radius: 2px;
      outline: none;
      height: 15px;
      width: 45px;
    }
    input::-moz-range-thumb {
      -webkit-appearance: none;
      background-color: white;
      margin-bottom: 20px;
      border-radius: 2px;
      outline: none;
      height: 15px;
      width: 45px;
    }
  `],
})
export class TimelineComponent implements OnInit, OnDestroy {
  @ViewChild('rangeInput', { static: true }) inputRef!: ElementRef<HTMLInputElement>;

  private wasPlaying = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(VIDEO_OPTIONS) private options: VideoOptions,
    private playerContext: VideoPlayerContext,
    private events: VideoEventService,
  ) {}

  ngOnInit(): void {
    // Reset range when video resets
    this.events.videoReset$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.inputRef.nativeElement.value = '0';
    });

    // Poll to update position
    merge(
      interval(this.options.REFRESH),
      this.events.seekableChanged$,
    ).pipe(takeUntil(this.destroy$)).subscribe(() => this.updatePosition());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMouseDown(): void {
    if (!this.options.TIMELINE_CHANGE) return;
    this.wasPlaying = this.playerContext.playing$.value;
    this.playerContext.pause();
  }

  onMouseUp(): void {
    if (!this.options.TIMELINE_CHANGE) return;
    if (this.wasPlaying) {
      this.playerContext.play();
    }
  }

  onChange(): void {
    if (!this.options.TIMELINE_CHANGE) return;
    const player = this.playerContext.player;
    if (!player) return;
    const val = +this.inputRef.nativeElement.value;
    player.currentTime = (val / 100) * player.duration;
  }

  private updatePosition(): void {
    const player = this.playerContext.player;
    if (!player || !player.duration) return;
    const percentage = (player.currentTime / player.duration) * 100;
    this.inputRef.nativeElement.value = String(percentage);
  }
}
