/**
 * @file アプリのブートローダー。
 */
// FIXME: simple-ng-websocketがJIT Compiler Unavailableを起こすため、回避のために@angular/compilerをインポート。
//        simple-ng-websocket側をAngularの作法に合うように修正する必要有。
import "@angular/compiler";
import { enableProdMode } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeJa from '@angular/common/locales/ja';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localeJa, 'ja');

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
