import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { PlaylistComponent } from './playlist.component';
import { MetaComponent } from '../meta/meta.component';
import { VideoSource } from '../../models/video-source.model';

describe('PlaylistComponent', () => {
  let component: PlaylistComponent;
  let fixture: ComponentFixture<PlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaylistComponent, MetaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render playlist title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Playlist');
  });

  it('should render video items when videos input is set', () => {
    component.videos = [
      { type: 'mp4', src: 'test1.mp4' },
      { type: 'mp4', src: 'test2.mp4' },
    ];
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('ul li:not(.title)');
    expect(items.length).toBe(2);
  });

  it('should use videoNameFn to display video names', () => {
    component.videos = [{ type: 'mp4', src: 'test1.mp4' }];
    component.videoNameFn = () => 'Test Video';
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector('ul li:not(.title)');
    expect(item.textContent).toContain('Test Video');
  });

  it('should emit selectVideo when a video item is clicked', () => {
    const video: VideoSource = { type: 'mp4', src: 'test1.mp4' };
    component.videos = [video];
    fixture.detectChanges();

    spyOn(component.selectVideo, 'emit');
    const item = fixture.nativeElement.querySelector('ul li:not(.title)');
    item.click();

    expect(component.selectVideo.emit).toHaveBeenCalledWith(video);
  });

  it('should emit close when close button is clicked', () => {
    fixture.detectChanges();

    spyOn(component.close, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('.close-playlist');
    closeBtn.click();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should render vi-meta for each video', () => {
    component.videos = [
      { type: 'mp4', src: 'test1.mp4' },
      { type: 'mp4', src: 'test2.mp4' },
    ];
    fixture.detectChanges();

    const metas = fixture.nativeElement.querySelectorAll('vi-meta');
    expect(metas.length).toBe(2);
  });
});
