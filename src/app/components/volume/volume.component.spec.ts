import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VolumeComponent } from './volume.component';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { DEFAULT_VIDEO_OPTIONS } from '../../services/video-options.config';
import {
  createMockVideoPlayerContext,
  createMockVideoEventService,
  createMockVideoElement,
} from '../../testing/mocks';

describe('VolumeComponent', () => {
  let component: VolumeComponent;
  let fixture: ComponentFixture<VolumeComponent>;
  let mockPlayerContext: ReturnType<typeof createMockVideoPlayerContext>;
  let mockEvents: ReturnType<typeof createMockVideoEventService>;
  let mockPlayer: ReturnType<typeof createMockVideoElement>;

  beforeEach(async () => {
    mockPlayerContext = createMockVideoPlayerContext();
    mockEvents = createMockVideoEventService();
    mockPlayer = createMockVideoElement();

    await TestBed.configureTestingModule({
      declarations: [VolumeComponent],
      providers: [
        { provide: VideoPlayerContext, useValue: mockPlayerContext },
        { provide: VideoEventService, useValue: mockEvents },
        { provide: VIDEO_OPTIONS, useValue: { ...DEFAULT_VIDEO_OPTIONS } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render volume bar, decrease, and increase buttons', () => {
    const el = fixture.nativeElement;
    expect(el.querySelector('.scale')).toBeTruthy();
    expect(el.querySelector('.bar')).toBeTruthy();
    expect(el.querySelector('.decrease')).toBeTruthy();
    expect(el.querySelector('.increase')).toBeTruthy();
  });

  it('should start with volume 1', () => {
    expect(component.volume).toBe(1);
  });

  it('should decrease volume on click', () => {
    mockPlayerContext.player = mockPlayer as any;
    mockPlayer.volume = 0.5;

    const decreaseBtn = fixture.nativeElement.querySelector('.decrease');
    decreaseBtn.click();

    expect(mockPlayerContext.setVolume).toHaveBeenCalledWith(0.4);
  });

  it('should increase volume on click', () => {
    mockPlayerContext.player = mockPlayer as any;
    mockPlayer.volume = 0.5;

    const increaseBtn = fixture.nativeElement.querySelector('.increase');
    increaseBtn.click();

    expect(mockPlayerContext.setVolume).toHaveBeenCalledWith(0.6);
  });

  it('should update volume on volumeChanged$', () => {
    mockPlayerContext.player = mockPlayer as any;
    mockPlayer.volume = 0.7;

    mockEvents.volumeChanged$.next(0.7);
    expect(component.volume).toBe(0.7);
  });

  it('should clean up on destroy', () => {
    component.ngOnDestroy();
    expect(() => {
      mockEvents.volumeChanged$.next(0.5);
    }).not.toThrow();
  });
});
