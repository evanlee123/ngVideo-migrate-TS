import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Register downgraded Angular services/components before AngularJS bootstrap
import './app/ajs-downgrade';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((err: unknown) => console.error(err));
