import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { VideoSource } from '../models/video-source.model';
import { PlaylistService } from './playlist.service';
import { VideoEventService } from './video-event.service';

@Injectable({ providedIn: 'root' })
export class VideoService {
  forceVideo: VideoSource | VideoSource[] | null = null;

  private readonly _forceVideo$ = new Subject<VideoSource | VideoSource[]>();
  readonly forceVideo$: Observable<VideoSource | VideoSource[]> = this._forceVideo$.asObservable();

  constructor(
    private playlist: PlaylistService,
    private events: VideoEventService,
  ) {}

  addSource(type: string, src: string, immediatelyPlay = false): VideoSource {
    const model: VideoSource = { type, src };
    this.playlist.add(model);
    this.events.videoAdded$.next(model);

    if (immediatelyPlay) {
      this.setForceVideo(model);
    }

    return model;
  }

  multiSource(): MultiSource {
    return new MultiSource(this.playlist, this.events, this);
  }

  resetSource(): void {
    this.playlist.clear();
  }

  setForceVideo(video: VideoSource | VideoSource[]): void {
    this.forceVideo = video;
    this._forceVideo$.next(video);
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
      this.videoService.setForceVideo(this.sources);
    }

    return this.sources;
  }
}
