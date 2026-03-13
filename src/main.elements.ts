import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgVideoElementsModule } from './app/ng-video-elements.module';

platformBrowserDynamic().bootstrapModule(NgVideoElementsModule)
  .catch((err: unknown) => console.error(err));
