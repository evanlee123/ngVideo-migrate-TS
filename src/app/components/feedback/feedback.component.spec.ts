import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';
import { FeedbackComponent } from './feedback.component';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { DEFAULT_VIDEO_OPTIONS } from '../../services/video-options.config';
import { BufferComponent } from '../buffer/buffer.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { MessagesComponent } from '../messages/messages.component';
import { VolumeComponent } from '../volume/volume.component';
import { VIDEO_MESSAGES } from '../../services/video-messages.config';
import { DEFAULT_VIDEO_MESSAGES } from '../../services/video-messages.config';
import {
  createMockVideoPlayerContext,
  createMockVideoEventService,
  createMockVideoElement,
} from '../../testing/mocks';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  let mockPlayerContext: ReturnType<typeof createMockVideoPlayerContext>;
  let mockEvents: ReturnType<typeof createMockVideoEventService>;
  let mockPlayer: ReturnType<typeof createMockVideoElement>;

  beforeEach(async () => {
    mockPlayerContext = createMockVideoPlayerContext();
    mockEvents = createMockVideoEventService();
    mockPlayer = createMockVideoElement();
    // Player starts null; tests that need it assign mockPlayer explicitly

    await TestBed.configureTestingModule({
      declarations: [FeedbackComponent, BufferComponent, TimelineComponent, MessagesComponent, VolumeComponent],
      providers: [
        { provide: VideoPlayerContext, useValue: mockPlayerContext },
        { provide: VideoEventService, useValue: mockEvents },
        { provide: VIDEO_OPTIONS, useValue: { ...DEFAULT_VIDEO_OPTIONS } },
        { provide: VIDEO_MESSAGES, useValue: { ...DEFAULT_VIDEO_MESSAGES } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with default property values', () => {
    expect(component.duration).toBe(0);
    expect(component.currentTime).toBe(0);
    expect(component.volume).toBe(1);
    expect(component.playbackRate).toBe(1);
    expect(component.percentagePlayed).toBe(0);
    expect(component.buffered).toBe(0);
    expect(component.buffering).toBe(false);
  });

  it('should show loading state initially', () => {
    expect(component.loading).toBe(true);
  });

  it('should update loading when loading$ changes', () => {
    mockPlayerContext.loading$.next(false);
    expect(component.loading).toBe(false);
  });

  it('should update playing when playing$ changes', () => {
    mockPlayerContext.playing$.next(true);
    expect(component.playing).toBe(true);
  });

  it('should grab statistics from the player', () => {
    mockPlayerContext.player = mockPlayer as any;
    (mockPlayer as any).currentTime = 25;
    (mockPlayer as any).duration = 100;
    (mockPlayer as any).volume = 0.8;
    (mockPlayer as any).playbackRate = 1.5;
    (mockPlayer as any).paused = false;

    // Trigger stats refresh
    mockEvents.feedbackRefresh$.next();
    fixture.detectChanges();

    expect(component.currentTime).toBe(25);
    expect(component.duration).toBe(100);
    expect(component.volume).toBe(0.8);
    expect(component.playbackRate).toBe(1.5);
    expect(component.percentagePlayed).toBe(25);
  });

  it('should detect buffering when currentTime does not advance', () => {
    mockPlayerContext.player = mockPlayer as any;
    (mockPlayer as any).currentTime = 10;
    (mockPlayer as any).paused = false;

    // First call sets lastTime
    mockEvents.feedbackRefresh$.next();
    expect(component.buffering).toBe(false);

    // Second call with same currentTime = buffering
    mockEvents.feedbackRefresh$.next();
    expect(component.buffering).toBe(true);
  });

  it('should update volume on volumeChanged$', () => {
    mockPlayerContext.player = mockPlayer as any;
    mockPlayer.volume = 0.5;
    mockEvents.volumeChanged$.next(0.5);
    expect(component.volume).toBe(0.5);
  });

  it('should reset player currentTime on videoReset$', () => {
    mockPlayerContext.player = mockPlayer as any;
    mockPlayer.currentTime = 50;
    mockEvents.videoReset$.next();
    expect(mockPlayer.currentTime).toBe(0);
  });

  it('should show volume 0 when player is muted', () => {
    mockPlayerContext.player = mockPlayer as any;
    (mockPlayer as any).muted = true;
    (mockPlayer as any).volume = 0.8;
    mockEvents.feedbackRefresh$.next();
    expect(component.volume).toBe(0);
  });

  it('should render duration section', () => {
    const durationSection = fixture.nativeElement.querySelector('.duration');
    expect(durationSection).toBeTruthy();
  });

  it('should render generic section', () => {
    const generic = fixture.nativeElement.querySelector('.generic');
    expect(generic).toBeTruthy();
  });

  it('should render timeline and buffer sections', () => {
    const timeline = fixture.nativeElement.querySelector('.timeline vi-timeline');
    const buffer = fixture.nativeElement.querySelector('.buffer vi-buffer');
    expect(timeline).toBeTruthy();
    expect(buffer).toBeTruthy();
  });

  it('should render messages component', () => {
    const messages = fixture.nativeElement.querySelector('vi-messages');
    expect(messages).toBeTruthy();
  });

  it('should clean up subscriptions on destroy', () => {
    component.ngOnDestroy();
    // Should not throw when events fire after destroy
    expect(() => {
      mockEvents.feedbackRefresh$.next();
      mockEvents.volumeChanged$.next(0.5);
      mockEvents.videoReset$.next();
    }).not.toThrow();
  });
});
