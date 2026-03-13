import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetaComponent } from './meta.component';

describe('MetaComponent', () => {
  let component: MetaComponent;
  let fixture: ComponentFixture<MetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty formatted duration', () => {
    expect(component.formattedDuration).toBe('');
  });

  it('should start with duration 0', () => {
    expect(component.duration).toBe(0);
  });

  it('should not create video element when videoModel is null', () => {
    component.videoModel = null;
    fixture.detectChanges();
    // The internal videoEl should remain null
    expect(component.duration).toBe(0);
    expect(component.formattedDuration).toBe('');
  });

  it('should set src from single videoModel', () => {
    const mockVideo = jasmine.createSpyObj<HTMLVideoElement>(
      'video', ['load', 'addEventListener', 'removeAttribute'],
      { preload: '' }
    );
    spyOn(document, 'createElement').and.returnValue(mockVideo as any);

    component.videoModel = { type: 'mp4', src: 'test.mp4' };
    fixture.detectChanges();

    expect(document.createElement).toHaveBeenCalledWith('video');
    expect(mockVideo.src).toBe('test.mp4');
    expect(mockVideo.load).toHaveBeenCalled();
  });

  it('should set src from first item when videoModel is an array', () => {
    const mockVideo = jasmine.createSpyObj<HTMLVideoElement>(
      'video', ['load', 'addEventListener', 'removeAttribute'],
      { preload: '' }
    );
    spyOn(document, 'createElement').and.returnValue(mockVideo as any);

    component.videoModel = [
      { type: 'mp4', src: 'first.mp4' },
      { type: 'webm', src: 'second.webm' },
    ];
    fixture.detectChanges();

    expect(mockVideo.src).toBe('first.mp4');
  });

  it('should update duration on loadedmetadata event', () => {
    let metadataCallback: (() => void) | undefined;
    const mockVideo = jasmine.createSpyObj<HTMLVideoElement>(
      'video', ['load', 'removeAttribute'],
    );
    mockVideo.addEventListener = jasmine.createSpy('addEventListener')
      .and.callFake((event: string, cb: () => void) => {
        if (event === 'loadedmetadata') metadataCallback = cb;
      });
    Object.defineProperty(mockVideo, 'duration', { value: 125.678, writable: true });
    spyOn(document, 'createElement').and.returnValue(mockVideo as any);

    component.videoModel = { type: 'mp4', src: 'test.mp4' };
    fixture.detectChanges();

    expect(metadataCallback).toBeDefined();
    metadataCallback!();

    expect(component.duration).toBe(125.678);
    expect(component.formattedDuration).toBe('125.68s');
  });

  it('should clean up video element on destroy', () => {
    const mockVideo = jasmine.createSpyObj<HTMLVideoElement>(
      'video', ['load', 'addEventListener', 'removeAttribute'],
      { preload: '' }
    );
    spyOn(document, 'createElement').and.returnValue(mockVideo as any);

    component.videoModel = { type: 'mp4', src: 'test.mp4' };
    fixture.detectChanges();
    fixture.destroy();

    expect(mockVideo.removeAttribute).toHaveBeenCalledWith('src');
    expect(mockVideo.load).toHaveBeenCalledTimes(2); // once in init, once in cleanup
  });
});
