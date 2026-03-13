import { TestBed } from '@angular/core/testing';
import { VideoPlayerContext } from './video-player-context';

describe('VideoPlayerContext', () => {
  let context: VideoPlayerContext;

  beforeEach(() => {
    context = TestBed.inject(VideoPlayerContext);
  });

  it('should be created', () => {
    expect(context).toBeTruthy();
  });

  it('should start with null player', () => {
    expect(context.player).toBeNull();
  });

  it('should start with null container', () => {
    expect(context.container).toBeNull();
  });

  it('should start with playing as false', (done) => {
    context.playing$.subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });

  it('should start with loading as true', (done) => {
    context.loading$.subscribe(value => {
      expect(value).toBe(true);
      done();
    });
  });

  describe('with mock player', () => {
    let mockPlayer: jasmine.SpyObj<HTMLVideoElement>;

    beforeEach(() => {
      mockPlayer = jasmine.createSpyObj('HTMLVideoElement', ['play', 'pause']);
      context.player = mockPlayer;
    });

    it('should call play on the player', () => {
      context.play();
      expect(mockPlayer.play).toHaveBeenCalled();
    });

    it('should call pause on the player', () => {
      context.pause();
      expect(mockPlayer.pause).toHaveBeenCalled();
    });

    it('should toggle from paused to playing', () => {
      context.playing$.next(false);
      context.toggleState();
      expect(mockPlayer.play).toHaveBeenCalled();
    });

    it('should toggle from playing to paused', () => {
      context.playing$.next(true);
      context.toggleState();
      expect(mockPlayer.pause).toHaveBeenCalled();
    });
  });

  describe('toggleState without player', () => {
    it('should not throw when player is null', () => {
      expect(() => context.toggleState()).not.toThrow();
    });
  });

  describe('setVolume', () => {
    let mockPlayer: any;

    beforeEach(() => {
      mockPlayer = { volume: 1, muted: false };
      context.player = mockPlayer as HTMLVideoElement;
    });

    it('should set volume on the player', () => {
      context.setVolume(0.5);
      expect(mockPlayer.volume).toBe(0.5);
    });

    it('should clamp volume to minimum', () => {
      context.setVolume(-0.5);
      expect(mockPlayer.volume).toBe(0);
    });

    it('should clamp volume to maximum', () => {
      context.setVolume(1.5);
      expect(mockPlayer.volume).toBe(1);
    });

    it('should unmute player when volume > 0 and player is muted', () => {
      mockPlayer.muted = true;
      context.setVolume(0.5);
      expect(mockPlayer.muted).toBe(false);
    });

    it('should not throw when player is null', () => {
      context.player = null;
      expect(() => context.setVolume(0.5)).not.toThrow();
    });
  });

  describe('fullscreen', () => {
    it('should not throw openFullScreen when container is null', () => {
      expect(() => context.openFullScreen()).not.toThrow();
    });

    it('should call requestFullscreen on container', () => {
      const mockContainer = { requestFullscreen: jasmine.createSpy('requestFullscreen') };
      context.container = mockContainer as unknown as HTMLElement;
      context.openFullScreen();
      expect(mockContainer.requestFullscreen).toHaveBeenCalled();
    });
  });
});
