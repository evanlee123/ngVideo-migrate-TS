import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { PlaylistComponent } from './playlist.component';

@Component({
  template: `<vi-playlist>
    <ul>
      <li class="title">Playlist</li>
      <li class="video-item">Video 1</li>
      <li class="video-item">Video 2</li>
    </ul>
  </vi-playlist>`,
})
class TestHostComponent {}

describe('PlaylistComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaylistComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const el = fixture.nativeElement.querySelector('vi-playlist');
    expect(el).toBeTruthy();
  });

  it('should project child content via ng-content', () => {
    const title = fixture.nativeElement.querySelector('.title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Playlist');
  });

  it('should project all list items', () => {
    const items = fixture.nativeElement.querySelectorAll('.video-item');
    expect(items.length).toBe(2);
  });

  it('should render ul inside vi-playlist element', () => {
    const playlist = fixture.nativeElement.querySelector('vi-playlist');
    const ul = playlist.querySelector('ul');
    expect(ul).toBeTruthy();
  });
});
