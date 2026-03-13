import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BufferComponent } from './buffer.component';
import { VideoPlayerContext } from '../../services/video-player-context';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_OPTIONS } from '../../services/video-options.config';
import { DEFAULT_VIDEO_OPTIONS } from '../../services/video-options.config';
import {
  createMockVideoPlayerContext,
  createMockVideoEventService,
  createMockVideoElement,
} from '../../testing/mocks';

describe('BufferComponent', () => {
  let component: BufferComponent;
  let fixture: ComponentFixture<BufferComponent>;
  let mockContext: ReturnType<typeof createMockVideoPlayerContext>;
  let mockEvents: ReturnType<typeof createMockVideoEventService>;

  beforeEach(async () => {
    mockContext = createMockVideoPlayerContext();
    mockEvents = createMockVideoEventService();

    await TestBed.configureTestingModule({
      declarations: [BufferComponent],
      providers: [
        { provide: VideoPlayerContext, useValue: mockContext },
        { provide: VideoEventService, useValue: mockEvents },
        { provide: VIDEO_OPTIONS, useValue: { ...DEFAULT_VIDEO_OPTIONS } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BufferComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a canvas element', () => {
    fixture.detectChanges();
    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should set canvas dimensions from options', () => {
    fixture.detectChanges();
    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.height).toBe(DEFAULT_VIDEO_OPTIONS.BUFFER_HEIGHT);
    expect(canvas.width).toBe(DEFAULT_VIDEO_OPTIONS.BUFFER_WIDTH);
  });

  it('should draw buffer on feedbackRefresh event', () => {
    const mockPlayer = createMockVideoElement();
    mockContext.player = mockPlayer as any;
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    spyOn(ctx, 'fillRect');

    mockEvents.feedbackRefresh$.next();

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('should not throw when player is null', () => {
    mockContext.player = null;
    fixture.detectChanges();
    expect(() => mockEvents.feedbackRefresh$.next()).not.toThrow();
  });

  it('should use buffer colour from options', () => {
    const mockPlayer = createMockVideoElement();
    mockContext.player = mockPlayer as any;
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    spyOn(ctx, 'fillRect');

    mockEvents.feedbackRefresh$.next();

    expect(ctx.fillStyle).toBe(DEFAULT_VIDEO_OPTIONS.BUFFER_COLOUR);
  });

  it('should draw correct buffer region', () => {
    const mockPlayer = createMockVideoElement();
    (mockPlayer as any).duration = 100;
    (mockPlayer.buffered.start as jasmine.Spy).and.returnValue(0);
    (mockPlayer.buffered.end as jasmine.Spy).and.returnValue(50);
    mockContext.player = mockPlayer as any;
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    spyOn(ctx, 'fillRect');

    mockEvents.feedbackRefresh$.next();

    const expectedX = 0;
    const expectedWidth = (50 / 100) * canvas.width;
    expect(ctx.fillRect).toHaveBeenCalledWith(expectedX, 0, expectedWidth, canvas.height);
  });

  it('should clean up on destroy', fakeAsync(() => {
    fixture.detectChanges();
    fixture.destroy();
    // Should not throw after destroy
    expect(() => mockEvents.feedbackRefresh$.next()).not.toThrow();
  }));
});
