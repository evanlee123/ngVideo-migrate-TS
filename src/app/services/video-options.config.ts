import { InjectionToken } from '@angular/core';
import { VideoOptions } from '../models/video-source.model';

export const DEFAULT_VIDEO_OPTIONS: VideoOptions = {
  RESTRICT: 'CA',
  REFRESH: 50,
  SCREEN_DIRECTIVE: 'vi-screen',
  SCREEN_CHANGE: true,
  TIMELINE_CHANGE: true,
  VOLUME_STEPS: 0.1,
  VOLUME_MINIMUM: 0,
  VOLUME_MAXIMUM: 1,
  BUFFER_COLOUR: '#dd4b39',
  BUFFER_HEIGHT: 1,
  BUFFER_WIDTH: 485,
};

export const VIDEO_OPTIONS = new InjectionToken<VideoOptions>('VideoOptions', {
  providedIn: 'root',
  factory: () => ({ ...DEFAULT_VIDEO_OPTIONS }),
});
