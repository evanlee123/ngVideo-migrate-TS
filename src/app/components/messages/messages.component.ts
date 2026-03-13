import {
  Component, Inject, OnDestroy, OnInit,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_MESSAGES } from '../../services/video-messages.config';
import { VideoMessage } from '../../models/video-source.model';

interface TimestampedMessage extends VideoMessage {
  date: Date;
}

@Component({
  selector: 'vi-messages',
  template: 'M{{ messages.length }}',
})
export class MessagesComponent implements OnInit, OnDestroy {
  messages: TimestampedMessage[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(VIDEO_MESSAGES) private videoMessages: Record<string, VideoMessage>,
    private events: VideoEventService,
  ) {}

  ngOnInit(): void {
    this.events.attachEvents$.pipe(takeUntil(this.destroy$)).subscribe((player) => {
      this.registerMessageEvents(player);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private registerMessageEvents(player: HTMLVideoElement): void {
    Object.values(this.videoMessages).forEach((messageModel) => {
      player.addEventListener(messageModel.event, () => {
        const copy: TimestampedMessage = {
          ...messageModel,
          date: new Date(),
        };
        this.messages.push(copy);
      });
    });
  }
}
