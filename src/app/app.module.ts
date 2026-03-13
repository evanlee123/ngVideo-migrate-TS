import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import { BufferComponent } from './components/buffer/buffer.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ControlsComponent } from './components/controls/controls.component';
import { VolumeComponent } from './components/volume/volume.component';
import { MessagesComponent } from './components/messages/messages.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { PlaylistComponent } from './components/playlist/playlist.component';

@NgModule({
  declarations: [
    BufferComponent,
    TimelineComponent,
    ControlsComponent,
    VolumeComponent,
    MessagesComponent,
    FeedbackComponent,
    PlaylistComponent,
  ],
  imports: [
    BrowserModule,
    UpgradeModule,
  ],
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['videoApp'], { strictDi: false });
  }
}
