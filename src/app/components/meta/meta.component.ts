import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { VideoSource } from '../../models/video-source.model';

@Component({
  selector: 'vi-meta',
  template: '{{ formattedDuration }}',
})
export class MetaComponent implements OnInit, OnDestroy {
  @Input() videoModel: VideoSource | VideoSource[] | null = null;

  formattedDuration = '';
  duration = 0;

  private videoEl: HTMLVideoElement | null = null;

  ngOnInit(): void {
    this.loadMetadata();
  }

  ngOnDestroy(): void {
    if (this.videoEl) {
      this.videoEl.removeAttribute('src');
      this.videoEl.load();
      this.videoEl = null;
    }
  }

  private loadMetadata(): void {
    if (!this.videoModel) return;

    this.videoEl = document.createElement('video');
    this.videoEl.preload = 'metadata';

    this.videoEl.addEventListener('loadedmetadata', () => {
      if (this.videoEl) {
        this.duration = this.videoEl.duration;
        this.formattedDuration = this.duration.toFixed(2) + 's';
        this.videoEl = null;
      }
    });

    const src = Array.isArray(this.videoModel) ? this.videoModel[0]?.src : this.videoModel.src;
    if (src) {
      this.videoEl.src = src;
      this.videoEl.load();
    }
  }
}
