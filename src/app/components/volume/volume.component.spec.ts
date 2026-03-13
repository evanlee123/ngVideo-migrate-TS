import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { VolumeComponent } from './volume.component';

@Component({
  template: `<vi-volume><div class="scale"><div class="bar"></div></div><span class="decrease">-</span><span class="increase">+</span></vi-volume>`,
})
class TestHostComponent {}

describe('VolumeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolumeComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const el = fixture.nativeElement.querySelector('vi-volume');
    expect(el).toBeTruthy();
  });

  it('should project child content via ng-content', () => {
    const scale = fixture.nativeElement.querySelector('.scale');
    const bar = fixture.nativeElement.querySelector('.bar');
    const decrease = fixture.nativeElement.querySelector('.decrease');
    const increase = fixture.nativeElement.querySelector('.increase');
    expect(scale).toBeTruthy();
    expect(bar).toBeTruthy();
    expect(decrease).toBeTruthy();
    expect(increase).toBeTruthy();
  });

  it('should render all projected children inside vi-volume element', () => {
    const volume = fixture.nativeElement.querySelector('vi-volume');
    expect(volume.children.length).toBe(3);
  });
});
