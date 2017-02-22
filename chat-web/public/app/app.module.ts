/**
 * @file WebSocketサンプルChatアプリルートモジュール。
 */
import { NgModule, ErrorHandler, Injectable, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from 'ng2-translate';
import browserHelper from './core/browser-helper';
import { SimpleNgWebSocket, CONNECT_URL, LOGGER } from 'simple-ng-websocket';
import { JsonRpc2Service } from './shared/jsonrpc2.service';
import { EnvService } from './shared/env.service';
import { RoomService } from './shared/room.service';
import { AppComponent } from './app.component';
import { TopComponent } from './top/top.component';
import { RoomComponent } from './rooms/room.component';

/** ルート定義 */
const appRoutes: Routes = [
	{ path: '', pathMatch: 'full', component: TopComponent },
	{ path: 'rooms/:id', component: RoomComponent },
	{ path: '**', redirectTo: '/' }
];

/**
 * デフォルトのエラーハンドラー。
 */
@Injectable()
class DefaultErrorHandler implements ErrorHandler {
	/**
	 * サービスをDIしてハンドラーを生成する。
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
		// TODO: エラーの種類ごとに切り替え
		let msgId = 'ERROR.FATAL';
		console.error(error);
		this.translate.get(msgId).subscribe((res: string) => {
			window.alert(res);
		});
	}
}

/**
 * WebSocketサンプルChatアプリルートモジュールクラス。
 */
@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		RouterModule.forRoot(appRoutes),
		NgbModule.forRoot(),
		TranslateModule.forRoot(),
	],
	declarations: [
		AppComponent,
		TopComponent,
		RoomComponent,
	],
	providers: [
		{ provide: LOCALE_ID, useValue: browserHelper.getLocale() },
		{ provide: ErrorHandler, useClass: DefaultErrorHandler },
		{ provide: CONNECT_URL, useValue: 'ws://' + window.location.host + '/ws/' },
		{ provide: LOGGER, useValue: (level, message) => console.log(message) },
		SimpleNgWebSocket,
		JsonRpc2Service,
		EnvService,
		RoomService,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
