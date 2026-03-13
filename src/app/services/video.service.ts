import { Injectable } from '@angular/core';
import { VideoSource } from '../models/video-source.model';
import { PlaylistService } from './playlist.service';
import { VideoEventService } from './video-event.service';

@Injectable({ providedIn: 'root' })
export class VideoService {
  forceVideo: VideoSource | VideoSource[] | null = null;

  constructor(
    private playlist: PlaylistService,
    private events: VideoEventService,
  ) {}

  addSource(type: string, src: string, immediatelyPlay = false): VideoSource {
    const model: VideoSource = { type, src };
    this.playlist.add(model);
    this.events.videoAdded$.next(model);

    if (immediatelyPlay) {
      this.forceVideo = model;
    }

    return model;
  }

  multiSource(): MultiSource {
    return new MultiSource(this.playlist, this.events, this);
  }

  resetSource(): void {
    this.playlist.clear();
  }

  throwException(message: string): never {
    throw new Error('ngVideo: ' + message + '.');
  }
}

class MultiSource {
  private sources: VideoSource[] = [];

  constructor(
    private playlist: PlaylistService,
    private events: VideoEventService,
    private videoService: VideoService,
  ) {}

  addSource(type: string, src: string): void {
    this.sources.push({ type, src });
  }

  save(immediatelyPlay = false): VideoSource[] {
    this.playlist.add(this.sources);
    this.events.videoAdded$.next(this.sources);

    if (immediatelyPlay) {
      this.videoService.forceVideo = this.sources;
    }

    return this.sources;
  }
}
