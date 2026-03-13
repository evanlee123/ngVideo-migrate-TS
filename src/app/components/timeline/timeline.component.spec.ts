import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineComponent } from './timeline.component';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { DEFAULT_VIDEO_OPTIONS } from '../../services/video-options.config';
import {
  createMockVideoPlayerContext,
  createMockVideoEventService,
  createMockVideoElement,
} from '../../testing/mocks';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let mockContext: ReturnType<typeof createMockVideoPlayerContext>;
  let mockEvents: ReturnType<typeof createMockVideoEventService>;

  beforeEach(async () => {
    mockContext = createMockVideoPlayerContext();
    mockEvents = createMockVideoEventService();

    await TestBed.configureTestingModule({
      declarations: [TimelineComponent],
      providers: [
        { provide: VideoPlayerContext, useValue: mockContext },
        { provide: VideoEventService, useValue: mockEvents },
        { provide: VIDEO_OPTIONS, useValue: { ...DEFAULT_VIDEO_OPTIONS } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a range input', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="range"]');
    expect(input).toBeTruthy();
  });

  it('should start with value 0', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    expect(input.value).toBe('0');
  });

  it('should reset to 0 on videoReset event', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    input.value = '50';

    mockEvents.videoReset$.next();

    expect(input.value).toBe('0');
  });

  it('should pause on mousedown when TIMELINE_CHANGE is true', () => {
    mockContext.playing$.next(true);
    fixture.detectChanges();

    component.onMouseDown();
    expect(mockContext.pause).toHaveBeenCalled();
  });

  it('should resume on mouseup if was playing', () => {
    mockContext.playing$.next(true);
    fixture.detectChanges();

    component.onMouseDown();
    component.onMouseUp();
    expect(mockContext.play).toHaveBeenCalled();
  });

  it('should not resume on mouseup if was not playing', () => {
    mockContext.playing$.next(false);
    fixture.detectChanges();

    component.onMouseDown();
    component.onMouseUp();
    expect(mockContext.play).not.toHaveBeenCalled();
  });

  it('should update player currentTime on change', () => {
    const mockPlayer = createMockVideoElement();
    (mockPlayer as any).duration = 200;
    mockContext.player = mockPlayer as any;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    input.value = '50';
    component.onChange();

    expect(mockPlayer.currentTime).toBe(100);
  });

  it('should update position on seekableChanged event', () => {
    const mockPlayer = createMockVideoElement();
    (mockPlayer as any).currentTime = 25;
    (mockPlayer as any).duration = 100;
    mockContext.player = mockPlayer as any;
    fixture.detectChanges();

    mockEvents.seekableChanged$.next();

    const input = fixture.nativeElement.querySelector('input[type="range"]') as HTMLInputElement;
    expect(input.value).toBe('25');
  });

  it('should clean up on destroy', () => {
    fixture.detectChanges();
    fixture.destroy();
    expect(() => mockEvents.videoReset$.next()).not.toThrow();
  });
});
