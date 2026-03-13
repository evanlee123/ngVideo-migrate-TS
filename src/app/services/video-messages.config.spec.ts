import { TestBed } from '@angular/core/testing';
import { VIDEO_MESSAGES, DEFAULT_VIDEO_MESSAGES } from './video-messages.config';
import { MESSAGE_TYPE } from '../models/video-source.model';

describe('VideoMessagesConfig', () => {
  it('should provide messages via injection token', () => {
    const messages = TestBed.inject(VIDEO_MESSAGES);
    expect(messages).toBeTruthy();
  });

  it('should have 21 message types', () => {
    const messages = TestBed.inject(VIDEO_MESSAGES);
    expect(Object.keys(messages).length).toBe(21);
  });

  it('should have all expected message keys', () => {
    const messages = TestBed.inject(VIDEO_MESSAGES);
    const expectedKeys = [
      'CAN_PLAY', 'CAN_PLAY_THROUGH', 'DURATION_CHANGE', 'EMPTIED', 'ENDED',
      'ERROR', 'LOADED_DATA', 'LOADED_META_DATA', 'LOAD_START', 'PAUSE',
      'PLAY', 'PLAYING', 'PROGRESS', 'RATE_CHANGE', 'SEEKED', 'SEEKING',
      'STALLED', 'SUSPEND', 'TIME_UPDATE', 'VOLUME_CHANGE', 'WAITING',
    ];
    expectedKeys.forEach(key => {
      expect(messages[key]).toBeDefined(`Missing key: ${key}`);
    });
  });

  it('should have valid event names for all messages', () => {
    const messages = TestBed.inject(VIDEO_MESSAGES);
    Object.values(messages).forEach(msg => {
      expect(msg.event).toBeTruthy();
      expect(typeof msg.event).toBe('string');
    });
  });

  it('should use correct message types', () => {
    const messages = TestBed.inject(VIDEO_MESSAGES);
    expect(messages['ERROR'].type).toBe(MESSAGE_TYPE.ERROR);
    expect(messages['PLAY'].type).toBe(MESSAGE_TYPE.GENERAL);
    expect(messages['CAN_PLAY'].type).toBe(MESSAGE_TYPE.INFORMATION);
  });

  it('should have unique ref numbers (except TIME_UPDATE/VOLUME_CHANGE)', () => {
    const messages = TestBed.inject(VIDEO_MESSAGES);
    const refs = Object.entries(messages)
      .filter(([key]) => key !== 'VOLUME_CHANGE')
      .map(([, msg]) => msg.ref);
    const uniqueRefs = new Set(refs);
    expect(uniqueRefs.size).toBe(refs.length);
  });

  it('should match default values', () => {
    const messages = TestBed.inject(VIDEO_MESSAGES);
    expect(messages).toEqual(DEFAULT_VIDEO_MESSAGES);
  });
});
