import {
  Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild,
} from '@angular/core';
import { Subject, interval, merge, takeUntil } from 'rxjs';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { VideoOptions } from '../../models/video-source.model';

@Component({
  selector: 'vi-buffer',
  template: '<canvas #bufferCanvas></canvas>',
})
export class BufferComponent implements OnInit, OnDestroy {
  @ViewChild('bufferCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(VIDEO_OPTIONS) private options: VideoOptions,
    private playerContext: VideoPlayerContext,
    private events: VideoEventService,
  ) {}

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.height = this.options.BUFFER_HEIGHT;
    canvas.width = this.options.BUFFER_WIDTH;

    merge(
      interval(this.options.REFRESH),
      this.events.feedbackRefresh$,
    ).pipe(takeUntil(this.destroy$)).subscribe(() => this.drawBuffer());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private drawBuffer(): void {
    const player = this.playerContext.player;
    if (!player) return;

    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    const buffered = player.buffered;
    const duration = player.duration;
    if (!duration || isNaN(duration)) return;

    context.fillStyle = this.options.BUFFER_COLOUR;

    let count = buffered.length;
    while (count--) {
      const x = buffered.start(count) / duration * canvas.width;
      const y = buffered.end(count) / duration * canvas.width;
      context.fillRect(x, 0, y - x, canvas.height);
    }
  }
}
