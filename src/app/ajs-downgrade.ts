/**
 * Downgrade Angular services and components for AngularJS consumption.
 * TODO: Delete this file after Phase 4c (remove AngularJS).
 */
import { downgradeInjectable, downgradeComponent } from '@angular/upgrade/static';
import { VideoPlayerContext } from './services/video-player-context';
import { VideoEventService } from './services/video-event.service';
import { BufferComponent } from './components/buffer/buffer.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ControlsComponent } from './components/controls/controls.component';
import { VolumeComponent } from './components/volume/volume.component';
import { MessagesComponent } from './components/messages/messages.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { PlaylistComponent } from './components/playlist/playlist.component';

declare var angular: any;

// Downgrade Angular services for AngularJS directive injection
angular.module('ngVideo')
  .factory('videoPlayerContext', downgradeInjectable(VideoPlayerContext) as any)
  .factory('videoEventService', downgradeInjectable(VideoEventService) as any);

// Downgrade Angular components to replace AngularJS directives
angular.module('ngVideo')
  .directive('viBuffer', downgradeComponent({ component: BufferComponent }) as any)
  .directive('viTimeline', downgradeComponent({ component: TimelineComponent }) as any)
  .directive('viControls', downgradeComponent({ component: ControlsComponent }) as any)
  .directive('viVolume', downgradeComponent({ component: VolumeComponent }) as any)
  .directive('viMessages', downgradeComponent({ component: MessagesComponent }) as any)
  .directive('viFeedback', downgradeComponent({ component: FeedbackComponent }) as any)
  .directive('viPlaylist', downgradeComponent({ component: PlaylistComponent }) as any);
