import { InjectionToken } from '@angular/core';
import { VideoMessage, MESSAGE_TYPE } from '../models/video-source.model';

export const DEFAULT_VIDEO_MESSAGES: Record<string, VideoMessage> = {
  CAN_PLAY:         { ref: 1, text: 'Can Play', type: MESSAGE_TYPE.INFORMATION, event: 'canplay' },
  CAN_PLAY_THROUGH: { ref: 2, text: 'Can Play Through', type: MESSAGE_TYPE.INFORMATION, event: 'canplaythrough' },
  DURATION_CHANGE:  { ref: 3, text: 'Duration Change', type: MESSAGE_TYPE.GENERAL, event: 'durationchange' },
  EMPTIED:          { ref: 4, text: 'Emptied', type: MESSAGE_TYPE.INFORMATION, event: 'emptied' },
  ENDED:            { ref: 5, text: 'Ended', type: MESSAGE_TYPE.INFORMATION, event: 'ended' },
  ERROR:            { ref: 6, text: 'Error', type: MESSAGE_TYPE.ERROR, event: 'error' },
  LOADED_DATA:      { ref: 7, text: 'Loaded Data', type: MESSAGE_TYPE.INFORMATION, event: 'loadeddata' },
  LOADED_META_DATA: { ref: 8, text: 'Loaded Meta Data', type: MESSAGE_TYPE.INFORMATION, event: 'loadedmetadata' },
  LOAD_START:       { ref: 9, text: 'Looking', type: MESSAGE_TYPE.INFORMATION, event: 'loadstart' },
  PAUSE:            { ref: 10, text: 'Pause', type: MESSAGE_TYPE.GENERAL, event: 'pause' },
  PLAY:             { ref: 11, text: 'Play', type: MESSAGE_TYPE.GENERAL, event: 'play' },
  PLAYING:          { ref: 12, text: 'Playing', type: MESSAGE_TYPE.GENERAL, event: 'playing' },
  PROGRESS:         { ref: 13, text: 'Progress', type: MESSAGE_TYPE.INFORMATION, event: 'progress' },
  RATE_CHANGE:      { ref: 14, text: 'Rate Change', type: MESSAGE_TYPE.INFORMATION, event: 'ratechange' },
  SEEKED:           { ref: 15, text: 'Seeked', type: MESSAGE_TYPE.INFORMATION, event: 'seeked' },
  SEEKING:          { ref: 16, text: 'Seeking', type: MESSAGE_TYPE.INFORMATION, event: 'seeking' },
  STALLED:          { ref: 17, text: 'Stalled', type: MESSAGE_TYPE.ERROR, event: 'stalled' },
  SUSPEND:          { ref: 18, text: 'Suspended', type: MESSAGE_TYPE.ERROR, event: 'suspend' },
  TIME_UPDATE:      { ref: 19, text: 'Time Update', type: MESSAGE_TYPE.GENERAL, event: 'timeupdate' },
  VOLUME_CHANGE:    { ref: 19, text: 'Volume Change', type: MESSAGE_TYPE.GENERAL, event: 'volumechange' },
  WAITING:          { ref: 20, text: 'Waiting', type: MESSAGE_TYPE.INFORMATION, event: 'waiting' },
};

export const VIDEO_MESSAGES = new InjectionToken<Record<string, VideoMessage>>('VideoMessages', {
  providedIn: 'root',
  factory: () => ({ ...DEFAULT_VIDEO_MESSAGES }),
});
