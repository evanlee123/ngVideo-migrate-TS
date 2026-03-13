import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgVideoSharedModule } from './ng-video-shared.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NgVideoSharedModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
