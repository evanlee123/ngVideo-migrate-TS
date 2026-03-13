import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlsComponent } from './controls.component';
import { VideoPlayerContext } from '../../services/video-player-context';
import { createMockVideoPlayerContext } from '../../testing/mocks';

describe('ControlsComponent', () => {
  let component: ControlsComponent;
  let fixture: ComponentFixture<ControlsComponent>;
  let mockPlayerContext: ReturnType<typeof createMockVideoPlayerContext>;

  beforeEach(async () => {
    mockPlayerContext = createMockVideoPlayerContext();

    await TestBed.configureTestingModule({
      declarations: [ControlsComponent],
      providers: [
        { provide: VideoPlayerContext, useValue: mockPlayerContext },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render play and pause buttons', () => {
    const el = fixture.nativeElement;
    const playBtn = el.querySelector('.glyphicon-play');
    const pauseBtn = el.querySelector('.glyphicon-pause');
    expect(playBtn).toBeTruthy();
    expect(pauseBtn).toBeTruthy();
  });

  it('should call playerContext.play() on play click', () => {
    const playBtn = fixture.nativeElement.querySelector('.glyphicon-play');
    playBtn.click();
    expect(mockPlayerContext.play).toHaveBeenCalled();
  });

  it('should call playerContext.pause() on pause click', () => {
    const pauseBtn = fixture.nativeElement.querySelector('.glyphicon-pause');
    pauseBtn.click();
    expect(mockPlayerContext.pause).toHaveBeenCalled();
  });
});
