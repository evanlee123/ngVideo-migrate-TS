import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ControlsComponent } from './controls.component';

@Component({
  template: `<vi-controls><span class="play-btn">Play</span><span class="pause-btn">Pause</span></vi-controls>`,
})
class TestHostComponent {}

describe('ControlsComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ControlsComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const el = fixture.nativeElement.querySelector('vi-controls');
    expect(el).toBeTruthy();
  });

  it('should project child content via ng-content', () => {
    const playBtn = fixture.nativeElement.querySelector('.play-btn');
    const pauseBtn = fixture.nativeElement.querySelector('.pause-btn');
    expect(playBtn).toBeTruthy();
    expect(playBtn.textContent).toBe('Play');
    expect(pauseBtn).toBeTruthy();
    expect(pauseBtn.textContent).toBe('Pause');
  });

  it('should render projected content inside vi-controls element', () => {
    const controls = fixture.nativeElement.querySelector('vi-controls');
    expect(controls.children.length).toBe(2);
  });
});
