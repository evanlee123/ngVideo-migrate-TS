import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  declarations: [
    NgVideoComponent,
    ControlsComponent,
    FeedbackComponent,
    PlaylistComponent,
    VolumeComponent,
    TimelineComponent,
    BufferComponent,
    MessagesComponent,
    MetaComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    NgVideoComponent,
    ControlsComponent,
    FeedbackComponent,
    PlaylistComponent,
    VolumeComponent,
    TimelineComponent,
    BufferComponent,
    MessagesComponent,
    MetaComponent,
  ],
})
export class NgVideoSharedModule {}
