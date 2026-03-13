import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { VideoService } from './services/video.service';
import { PlaylistService } from './services/playlist.service';
import { VideoPlayerContext } from './services/video-player-context';
import { VIDEO_OPTIONS } from './services/video-options.config';
import { DEFAULT_VIDEO_OPTIONS } from './services/video-options.config';
import { createMockVideoPlayerContext } from './testing/mocks';
import { Subject, of } from 'rxjs';
import { VideoSource } from './models/video-source.model';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockVideoService: jasmine.SpyObj<VideoService>;
  let mockPlaylist: jasmine.SpyObj<PlaylistService>;
  let mockPlayerContext: ReturnType<typeof createMockVideoPlayerContext>;

  beforeEach(async () => {
    mockVideoService = jasmine.createSpyObj('VideoService', ['addSource', 'setForceVideo']);
    (mockVideoService as any).forceVideo$ = new Subject();
    mockVideoService.addSource.and.callFake((type: string, src: string) => ({ type, src }));

    mockPlaylist = jasmine.createSpyObj('PlaylistService', ['getAll$', 'getAll']);
    mockPlaylist.getAll$.and.returnValue(of([]));

    mockPlayerContext = createMockVideoPlayerContext();

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: VideoService, useValue: mockVideoService },
        { provide: PlaylistService, useValue: mockPlaylist },
        { provide: VideoPlayerContext, useValue: mockPlayerContext },
        { provide: VIDEO_OPTIONS, useValue: { ...DEFAULT_VIDEO_OPTIONS } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should add two video sources on init', () => {
    fixture.detectChanges();
    expect(mockVideoService.addSource).toHaveBeenCalledTimes(2);
    expect(mockVideoService.addSource).toHaveBeenCalledWith('mp4', 'http://www.w3schools.com/html/mov_bbb.mp4');
    expect(mockVideoService.addSource).toHaveBeenCalledWith('mp4', 'http://www.w3schools.com/html/movie.mp4');
  });

  it('should return correct video names', () => {
    expect(component.getVideoName({ type: 'mp4', src: 'http://www.w3schools.com/html/mov_bbb.mp4' }))
      .toBe('Big Buck Bunny');
    expect(component.getVideoName({ type: 'mp4', src: 'http://www.w3schools.com/html/movie.mp4' }))
      .toBe('The Bear');
    expect(component.getVideoName({ type: 'mp4', src: 'unknown.mp4' }))
      .toBe('Unknown Video');
  });

  it('should handle array video model in getVideoName', () => {
    const videos: VideoSource[] = [
      { type: 'mp4', src: 'http://www.w3schools.com/html/mov_bbb.mp4' },
    ];
    expect(component.getVideoName(videos)).toBe('Big Buck Bunny');
  });

  it('should start with playlist closed', () => {
    expect(component.playlistOpen).toBe(false);
  });

  it('should toggle fullscreen', () => {
    fixture.detectChanges();
    component.toggleFullScreen();
    // No fullscreenElement by default, so it should try to open
    expect(mockPlayerContext.openFullScreen).toHaveBeenCalled();
  });
});
