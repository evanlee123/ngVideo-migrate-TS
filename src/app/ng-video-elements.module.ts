import { NgModule, DoBootstrap, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { NgVideoSharedModule } from './ng-video-shared.module';
import { NgVideoComponent } from './components/ng-video/ng-video.component';
import { ControlsComponent } from './components/controls/controls.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { VolumeComponent } from './components/volume/volume.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { BufferComponent } from './components/buffer/buffer.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MetaComponent } from './components/meta/meta.component';

@NgModule({
  imports: [
    BrowserModule,
    NgVideoSharedModule,
  ],
})
export class NgVideoElementsModule implements DoBootstrap {
  constructor(private injector: Injector) {}

  ngDoBootstrap(): void {
    const elements: [any, string][] = [
      [NgVideoComponent, 'ng-video'],
      [ControlsComponent, 'vi-controls'],
      [FeedbackComponent, 'vi-feedback'],
      [PlaylistComponent, 'vi-playlist'],
      [VolumeComponent, 'vi-volume'],
      [TimelineComponent, 'vi-timeline'],
      [BufferComponent, 'vi-buffer'],
      [MessagesComponent, 'vi-messages'],
      [MetaComponent, 'vi-meta'],
    ];

    for (const [component, tag] of elements) {
      if (!customElements.get(tag)) {
        const el = createCustomElement(component, { injector: this.injector });
        customElements.define(tag, el);
      }
    }
  }
}
