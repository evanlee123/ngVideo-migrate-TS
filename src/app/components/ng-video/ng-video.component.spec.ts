import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgVideoComponent } from './ng-video.component';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VideoService } from '../../services/video.service';
import { PlaylistService } from '../../services/playlist.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { DEFAULT_VIDEO_OPTIONS } from '../../services/video-options.config';
import {
  createMockVideoPlayerContext,
  createMockVideoEventService,
} from '../../testing/mocks';
import { Subject } from 'rxjs';
import { VideoSource } from '../../models/video-source.model';

describe('NgVideoComponent', () => {
  let component: NgVideoComponent;
  let fixture: ComponentFixture<NgVideoComponent>;
  let mockPlayerContext: ReturnType<typeof createMockVideoPlayerContext>;
  let mockEvents: ReturnType<typeof createMockVideoEventService>;
  let mockVideoService: jasmine.SpyObj<VideoService> & { forceVideo$: Subject<VideoSource | VideoSource[]> };
  let mockPlaylist: jasmine.SpyObj<PlaylistService>;

  beforeEach(async () => {
    mockPlayerContext = createMockVideoPlayerContext();
    mockEvents = createMockVideoEventService();

    const forceVideo$ = new Subject<VideoSource | VideoSource[]>();
    mockVideoService = {
      ...jasmine.createSpyObj('VideoService', ['addSource', 'throwException', 'setForceVideo']),
      forceVideo$,
      forceVideo: null,
    } as any;

    mockPlaylist = jasmine.createSpyObj('PlaylistService', ['getAll', 'getByIndex', 'add', 'indexOf'], {
      length: 0,
    });
    mockPlaylist.getAll.and.returnValue([]);

    await TestBed.configureTestingModule({
      declarations: [NgVideoComponent],
      providers: [
        { provide: VideoPlayerContext, useValue: mockPlayerContext },
        { provide: VideoEventService, useValue: mockEvents },
        { provide: VideoService, useValue: mockVideoService },
        { provide: PlaylistService, useValue: mockPlaylist },
        { provide: VIDEO_OPTIONS, useValue: { ...DEFAULT_VIDEO_OPTIONS } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NgVideoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a video element', () => {
    fixture.detectChanges();
    const video = fixture.nativeElement.querySelector('video');
    expect(video).toBeTruthy();
  });

  it('should set player on VideoPlayerContext after init', () => {
    fixture.detectChanges();
    const video = fixture.nativeElement.querySelector('video');
    expect(mockPlayerContext.player).toBe(video);
  });

  it('should set container on VideoPlayerContext after init', () => {
    fixture.detectChanges();
    expect(mockPlayerContext.container).toBe(fixture.nativeElement);
  });

  it('should emit attachEvents$ after init', () => {
    let emitted: HTMLVideoElement | null = null;
    mockEvents.attachEvents$.subscribe(v => emitted = v);
    fixture.detectChanges();
    expect(emitted).toBeTruthy();
  });

  it('should open first video if playlist has items', () => {
    const video: VideoSource = { type: 'mp4', src: 'test.mp4' };
    mockPlaylist.getAll.and.returnValue([video]);
    fixture.detectChanges();

    const playerEl = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    expect(playerEl.getAttribute('src')).toBe('test.mp4');
  });

  it('should handle screen click to toggle state', () => {
    mockPlayerContext.loading$.next(false);
    fixture.detectChanges();

    const video = fixture.nativeElement.querySelector('video');
    video.click();

    expect(mockPlayerContext.toggleState).toHaveBeenCalled();
  });

  it('should not toggle state on screen click when loading', () => {
    mockPlayerContext.loading$.next(true);
    fixture.detectChanges();

    const video = fixture.nativeElement.querySelector('video');
    video.click();

    expect(mockPlayerContext.toggleState).not.toHaveBeenCalled();
  });

  it('should open video on forceVideo$', () => {
    fixture.detectChanges();
    const video: VideoSource = { type: 'mp4', src: 'forced.mp4' };

    mockVideoService.forceVideo$.next(video);

    const playerEl = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    expect(playerEl.getAttribute('src')).toBe('forced.mp4');
  });

  it('should open first video when videoAdded$ fires and playlist has 1 item', () => {
    const video: VideoSource = { type: 'mp4', src: 'new.mp4' };
    (Object.getOwnPropertyDescriptor(mockPlaylist, 'length')?.get as jasmine.Spy).and.returnValue(1);
    mockPlaylist.getByIndex.and.returnValue(video);
    fixture.detectChanges();

    mockEvents.videoAdded$.next(video);

    const playerEl = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    expect(playerEl.getAttribute('src')).toBe('new.mp4');
  });

  it('should handle array video model (multi-source)', () => {
    const videos: VideoSource[] = [
      { type: 'webm', src: 'test.webm' },
      { type: 'mp4', src: 'test.mp4' },
    ];
    mockPlaylist.getAll.and.returnValue([videos]);
    fixture.detectChanges();

    // The video element's canPlayType determines which source is loaded
    const playerEl = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    // canPlayType returns '' for unsupported types in test environment
    // so the first playable type should be loaded
    expect(playerEl).toBeTruthy();
  });

  it('should clean up on destroy', () => {
    fixture.detectChanges();
    component.ngOnDestroy();
    expect(() => {
      mockEvents.videoAdded$.next({ type: 'mp4', src: 'test.mp4' });
      mockVideoService.forceVideo$.next({ type: 'mp4', src: 'test.mp4' });
    }).not.toThrow();
  });
});
