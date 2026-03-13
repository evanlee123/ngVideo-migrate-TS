import { TestBed } from '@angular/core/testing';
import { VideoService } from './video.service';
import { PlaylistService } from './playlist.service';
import { VideoEventService } from './video-event.service';
import { VideoSource } from '../models/video-source.model';

describe('VideoService', () => {
  let service: VideoService;
  let playlist: PlaylistService;
  let events: VideoEventService;

  beforeEach(() => {
    service = TestBed.inject(VideoService);
    playlist = TestBed.inject(PlaylistService);
    events = TestBed.inject(VideoEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no forced video', () => {
    expect(service.forceVideo).toBeNull();
  });

  describe('addSource', () => {
    it('should add a source to the playlist', () => {
      service.addSource('mp4', 'test.mp4');
      expect(playlist.length).toBe(1);
      expect(playlist.getByIndex(0)).toEqual({ type: 'mp4', src: 'test.mp4' });
    });

    it('should return the created model', () => {
      const model = service.addSource('mp4', 'test.mp4');
      expect(model).toEqual({ type: 'mp4', src: 'test.mp4' });
    });

    it('should emit videoAdded$ event', (done) => {
      events.videoAdded$.subscribe(value => {
        expect(value).toEqual({ type: 'mp4', src: 'test.mp4' });
        done();
      });
      service.addSource('mp4', 'test.mp4');
    });

    it('should set forceVideo when immediatelyPlay is true', () => {
      service.addSource('mp4', 'test.mp4', true);
      expect(service.forceVideo).toEqual({ type: 'mp4', src: 'test.mp4' });
    });

    it('should not set forceVideo when immediatelyPlay is false', () => {
      service.addSource('mp4', 'test.mp4', false);
      expect(service.forceVideo).toBeNull();
    });
  });

  describe('multiSource', () => {
    it('should create a MultiSource builder', () => {
      const multi = service.multiSource();
      expect(multi).toBeTruthy();
      expect(typeof multi.addSource).toBe('function');
      expect(typeof multi.save).toBe('function');
    });

    it('should add multi-sources to playlist on save', () => {
      const multi = service.multiSource();
      multi.addSource('mp4', 'test.mp4');
      multi.addSource('webm', 'test.webm');
      const result = multi.save();

      expect(playlist.length).toBe(1);
      expect(result).toEqual([
        { type: 'mp4', src: 'test.mp4' },
        { type: 'webm', src: 'test.webm' },
      ]);
    });

    it('should emit videoAdded$ on save', (done) => {
      events.videoAdded$.subscribe(value => {
        expect(Array.isArray(value)).toBe(true);
        done();
      });
      const multi = service.multiSource();
      multi.addSource('mp4', 'test.mp4');
      multi.save();
    });

    it('should set forceVideo on save with immediatelyPlay', () => {
      const multi = service.multiSource();
      multi.addSource('mp4', 'test.mp4');
      multi.save(true);
      expect(service.forceVideo).toBeTruthy();
    });
  });

  describe('resetSource', () => {
    it('should clear the playlist', () => {
      service.addSource('mp4', 'test1.mp4');
      service.addSource('mp4', 'test2.mp4');
      service.resetSource();
      expect(playlist.length).toBe(0);
    });
  });

  describe('throwException', () => {
    it('should throw an error with ngVideo prefix', () => {
      expect(() => service.throwException('test error'))
        .toThrowError('ngVideo: test error.');
    });
  });
});
