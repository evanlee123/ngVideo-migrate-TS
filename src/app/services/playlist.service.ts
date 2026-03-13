import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VideoSource } from '../models/video-source.model';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private readonly playlist$ = new BehaviorSubject<(VideoSource | VideoSource[])[]>([]);

  getAll$(): Observable<(VideoSource | VideoSource[])[]> {
    return this.playlist$.asObservable();
  }

  getAll(): (VideoSource | VideoSource[])[] {
    return this.playlist$.value;
  }

  add(item: VideoSource | VideoSource[]): void {
    const current = this.playlist$.value;
    this.playlist$.next([...current, item]);
  }

  getByIndex(index: number): VideoSource | VideoSource[] | undefined {
    return this.playlist$.value[index];
  }

  indexOf(item: VideoSource | VideoSource[]): number {
    return this.playlist$.value.indexOf(item);
  }

  get length(): number {
    return this.playlist$.value.length;
  }

  clear(): void {
    this.playlist$.next([]);
  }
}
