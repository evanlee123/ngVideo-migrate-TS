import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MessagesComponent } from './messages.component';
import { VideoEventService } from '../../services/video-event.service';
import { VIDEO_MESSAGES } from '../../services/video-messages.config';
import { DEFAULT_VIDEO_MESSAGES } from '../../services/video-messages.config';
import { createMockVideoEventService } from '../../testing/mocks';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;
  let mockEvents: ReturnType<typeof createMockVideoEventService>;

  beforeEach(async () => {
    mockEvents = createMockVideoEventService();

    await TestBed.configureTestingModule({
      declarations: [MessagesComponent],
      providers: [
        { provide: VideoEventService, useValue: mockEvents },
        { provide: VIDEO_MESSAGES, useValue: { ...DEFAULT_VIDEO_MESSAGES } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty messages array', () => {
    expect(component.messages).toEqual([]);
  });

  it('should render M0 initially', () => {
    expect(fixture.nativeElement.textContent.trim()).toBe('M0');
  });

  it('should register event listeners when attachEvents$ fires', () => {
    const player = document.createElement('video');
    const addEventSpy = spyOn(player, 'addEventListener').and.callThrough();

    mockEvents.attachEvents$.next(player);

    // Should register listeners for all 21 message types
    expect(addEventSpy).toHaveBeenCalledTimes(Object.keys(DEFAULT_VIDEO_MESSAGES).length);
  });

  it('should accumulate messages when video events fire', () => {
    const player = document.createElement('video');
    mockEvents.attachEvents$.next(player);

    // Simulate a canplay event
    player.dispatchEvent(new Event('canplay'));
    expect(component.messages.length).toBe(1);
    expect(component.messages[0].event).toBe('canplay');
    expect(component.messages[0].date).toBeDefined();
  });

  it('should create copies of messages to avoid duplication', () => {
    const player = document.createElement('video');
    mockEvents.attachEvents$.next(player);

    player.dispatchEvent(new Event('play'));
    player.dispatchEvent(new Event('play'));

    expect(component.messages.length).toBe(2);
    expect(component.messages[0]).not.toBe(component.messages[1]);
  });

  it('should update template with message count', () => {
    const player = document.createElement('video');
    mockEvents.attachEvents$.next(player);

    player.dispatchEvent(new Event('pause'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('M1');
  });
});
