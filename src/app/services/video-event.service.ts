import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { VideoSource } from '../models/video-source.model';

@Injectable({ providedIn: 'root' })
export class VideoEventService {
  readonly videoAdded$ = new Subject<VideoSource | VideoSource[]>();
  readonly videoReset$ = new Subject<void>();
  readonly attachEvents$ = new Subject<HTMLVideoElement>();
  readonly volumeChanged$ = new Subject<number>();
  readonly feedbackRefresh$ = new Subject<void>();
  readonly seekableChanged$ = new Subject<void>();
}
