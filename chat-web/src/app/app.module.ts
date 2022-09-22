/**
 * アプリのルートモジュール。
 *
 * @module ./app/app.module
 */
import { NgModule, ErrorHandler, Injectable, LOCALE_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import browserHelper from './core/browser-helper';
import { SimpleNgWebSocket, CONNECT_URL, LOGGER } from 'simple-ng-websocket';

import { AppRoutingModule } from './app-routing.module';
import { JsonRpc2Service } from './shared/jsonrpc2.service';
import { EnvService } from './shared/env.service';
import { RoomService } from './shared/room.service';
import { AppComponent } from './app.component';
import { TopComponent } from './top/top.component';
import { RoomComponent } from './rooms/room.component';

/**
 * デフォルトのエラーハンドラー。
 */
@Injectable()
class DefaultErrorHandler implements ErrorHandler {
  /**
   * サービスを使用してハンドラーを生成する。
   * @param translate 国際化サービス。
   */
  constructor(private translate?: TranslateService) { }

  /**
   * エラーを受け取る。
   * @param error エラー情報。
   */
  handleError(error: Error | any): void {
    // ※ Promiseの中で発生したエラーの場合、ラップされてくるので、元の奴を取り出す
    if (error && error.rejection) {
      error = error.rejection;
    }
    let msgId = 'ERROR.FATAL';
    console.error(error);
    this.translate?.get(msgId).subscribe((res: string) => {
      window.alert(res);
    });
  }
}

/**
 * アプリのルートモジュールクラス。
 */
@NgModule({
  declarations: [
    AppComponent,
    TopComponent,
    RoomComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/'),
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: browserHelper.getLocale() },
    { provide: ErrorHandler, useClass: DefaultErrorHandler },
    { provide: CONNECT_URL, useValue: 'ws://' + window.location.host + '/ws/' },
    { provide: LOGGER, useValue: (_: string, message: string) => console.log(message) },
    SimpleNgWebSocket,
    JsonRpc2Service,
    EnvService,
    RoomService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
