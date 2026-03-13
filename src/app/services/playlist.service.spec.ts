import { TestBed } from '@angular/core/testing';
import { PlaylistService } from './playlist.service';
import { VideoSource } from '../models/video-source.model';

describe('PlaylistService', () => {
  let service: PlaylistService;

  beforeEach(() => {
    service = TestBed.inject(PlaylistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty playlist', () => {
    expect(service.getAll()).toEqual([]);
    expect(service.length).toBe(0);
  });

  it('should add a single video source', () => {
    const source: VideoSource = { type: 'mp4', src: 'test.mp4' };
    service.add(source);
    expect(service.length).toBe(1);
    expect(service.getAll()[0]).toEqual(source);
  });

  it('should add multiple video sources', () => {
    const source1: VideoSource = { type: 'mp4', src: 'test1.mp4' };
    const source2: VideoSource = { type: 'mp4', src: 'test2.mp4' };
    service.add(source1);
    service.add(source2);
    expect(service.length).toBe(2);
  });

  it('should add a multi-source array', () => {
    const sources: VideoSource[] = [
      { type: 'mp4', src: 'test.mp4' },
      { type: 'webm', src: 'test.webm' },
    ];
    service.add(sources);
    expect(service.length).toBe(1);
    expect(service.getAll()[0]).toEqual(sources);
  });

  it('should get item by index', () => {
    const source: VideoSource = { type: 'mp4', src: 'test.mp4' };
    service.add(source);
    expect(service.getByIndex(0)).toEqual(source);
    expect(service.getByIndex(1)).toBeUndefined();
  });

  it('should find index of item', () => {
    const source1: VideoSource = { type: 'mp4', src: 'test1.mp4' };
    const source2: VideoSource = { type: 'mp4', src: 'test2.mp4' };
    service.add(source1);
    service.add(source2);
    expect(service.indexOf(source1)).toBe(0);
    expect(service.indexOf(source2)).toBe(1);
  });

  it('should return -1 for items not in playlist', () => {
    const source: VideoSource = { type: 'mp4', src: 'nonexistent.mp4' };
    expect(service.indexOf(source)).toBe(-1);
  });

  it('should clear the playlist', () => {
    service.add({ type: 'mp4', src: 'test1.mp4' });
    service.add({ type: 'mp4', src: 'test2.mp4' });
    service.clear();
    expect(service.length).toBe(0);
    expect(service.getAll()).toEqual([]);
  });

  it('should emit updates via observable', (done) => {
    const source: VideoSource = { type: 'mp4', src: 'test.mp4' };
    let emissionCount = 0;

    service.getAll$().subscribe(playlist => {
      emissionCount++;
      if (emissionCount === 1) {
        // Initial empty value
        expect(playlist).toEqual([]);
      } else if (emissionCount === 2) {
        expect(playlist).toEqual([source]);
        done();
      }
    });

    service.add(source);
  });
});
