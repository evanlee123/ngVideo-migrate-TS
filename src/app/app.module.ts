import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgVideoComponent } from './components/ng-video/ng-video.component';
import { BufferComponent } from './components/buffer/buffer.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ControlsComponent } from './components/controls/controls.component';
import { VolumeComponent } from './components/volume/volume.component';
import { MessagesComponent } from './components/messages/messages.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { MetaComponent } from './components/meta/meta.component';

@NgModule({
  declarations: [
    AppComponent,
    NgVideoComponent,
    BufferComponent,
    TimelineComponent,
    ControlsComponent,
    VolumeComponent,
    MessagesComponent,
    FeedbackComponent,
    PlaylistComponent,
    MetaComponent,
  ],
  imports: [
    BrowserModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
