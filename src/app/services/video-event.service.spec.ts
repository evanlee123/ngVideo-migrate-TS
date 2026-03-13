import { TestBed } from '@angular/core/testing';
import { VideoEventService } from './video-event.service';
import { VideoSource } from '../models/video-source.model';

describe('VideoEventService', () => {
  let service: VideoEventService;

  beforeEach(() => {
    service = TestBed.inject(VideoEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit on videoAdded$', (done) => {
    const source: VideoSource = { type: 'mp4', src: 'test.mp4' };
    service.videoAdded$.subscribe(value => {
      expect(value).toEqual(source);
      done();
    });
    service.videoAdded$.next(source);
  });

  it('should emit on videoReset$', (done) => {
    service.videoReset$.subscribe(() => {
      expect(true).toBe(true);
      done();
    });
    service.videoReset$.next();
  });

  it('should emit on attachEvents$', (done) => {
    const mockVideo = document.createElement('video');
    service.attachEvents$.subscribe(value => {
      expect(value).toBe(mockVideo);
      done();
    });
    service.attachEvents$.next(mockVideo);
  });

  it('should emit on volumeChanged$', (done) => {
    service.volumeChanged$.subscribe(value => {
      expect(value).toBe(0.5);
      done();
    });
    service.volumeChanged$.next(0.5);
  });

  it('should emit on feedbackRefresh$', (done) => {
    service.feedbackRefresh$.subscribe(() => {
      expect(true).toBe(true);
      done();
    });
    service.feedbackRefresh$.next();
  });

  it('should emit on seekableChanged$', (done) => {
    service.seekableChanged$.subscribe(() => {
      expect(true).toBe(true);
      done();
    });
    service.seekableChanged$.next();
  });
});
