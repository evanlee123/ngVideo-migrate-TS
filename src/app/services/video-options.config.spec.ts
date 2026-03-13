import { TestBed } from '@angular/core/testing';
import { VIDEO_OPTIONS, DEFAULT_VIDEO_OPTIONS } from './video-options.config';

describe('VideoOptionsConfig', () => {
  it('should provide default options via injection token', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options).toBeTruthy();
  });

  it('should have RESTRICT set to CA', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options.RESTRICT).toBe('CA');
  });

  it('should have REFRESH set to 50', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options.REFRESH).toBe(50);
  });

  it('should have SCREEN_DIRECTIVE set to vi-screen', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options.SCREEN_DIRECTIVE).toBe('vi-screen');
  });

  it('should have SCREEN_CHANGE enabled', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options.SCREEN_CHANGE).toBe(true);
  });

  it('should have TIMELINE_CHANGE enabled', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options.TIMELINE_CHANGE).toBe(true);
  });

  it('should have correct volume settings', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options.VOLUME_STEPS).toBe(0.1);
    expect(options.VOLUME_MINIMUM).toBe(0);
    expect(options.VOLUME_MAXIMUM).toBe(1);
  });

  it('should have correct buffer settings', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options.BUFFER_COLOUR).toBe('#dd4b39');
    expect(options.BUFFER_HEIGHT).toBe(1);
    expect(options.BUFFER_WIDTH).toBe(485);
  });

  it('should match all default values from the AngularJS constant', () => {
    const options = TestBed.inject(VIDEO_OPTIONS);
    expect(options).toEqual(DEFAULT_VIDEO_OPTIONS);
  });
});
