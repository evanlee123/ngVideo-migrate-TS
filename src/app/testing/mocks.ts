import { BehaviorSubject, Subject } from 'rxjs';
import { VideoPlayerContext } from '../services/video-player-context';
import { VideoEventService } from '../services/video-event.service';
import { VideoSource } from '../models/video-source.model';

export function createMockVideoPlayerContext(): jasmine.SpyObj<VideoPlayerContext> & {
  playing$: BehaviorSubject<boolean>;
  loading$: BehaviorSubject<boolean>;
} {
  const spy = jasmine.createSpyObj('VideoPlayerContext', [
    'play', 'pause', 'toggleState', 'openFullScreen', 'closeFullScreen', 'setVolume',
  ]);
  spy.playing$ = new BehaviorSubject<boolean>(false);
  spy.loading$ = new BehaviorSubject<boolean>(true);
  spy.player = null;
  spy.container = null;
  return spy;
}

export function createMockVideoEventService(): {
  videoAdded$: Subject<VideoSource | VideoSource[]>;
  videoReset$: Subject<void>;
  attachEvents$: Subject<HTMLVideoElement>;
  volumeChanged$: Subject<number>;
  feedbackRefresh$: Subject<void>;
  seekableChanged$: Subject<void>;
} {
  return {
    videoAdded$: new Subject<VideoSource | VideoSource[]>(),
    videoReset$: new Subject<void>(),
    attachEvents$: new Subject<HTMLVideoElement>(),
    volumeChanged$: new Subject<number>(),
    feedbackRefresh$: new Subject<void>(),
    seekableChanged$: new Subject<void>(),
  };
}

export function createMockVideoElement(): jasmine.SpyObj<HTMLVideoElement> {
  const el = jasmine.createSpyObj('HTMLVideoElement', [
    'play', 'pause', 'load', 'canPlayType',
  ]);
  el.currentTime = 0;
  el.duration = 100;
  el.volume = 1;
  el.muted = false;
  el.paused = true;
  el.playbackRate = 1;
  el.defaultPlaybackRate = 1;
  el.buffered = {
    length: 1,
    start: jasmine.createSpy('start').and.returnValue(0),
    end: jasmine.createSpy('end').and.returnValue(50),
  } as any;
  return el;
}
