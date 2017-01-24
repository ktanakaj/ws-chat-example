/**
 * WebSocketサービスモジュール。
 * @module ./app/shared/websocket.service
 */
import { Injectable, Inject, Optional, OpaqueToken } from '@angular/core';
import { $WebSocket, WebSocketSendMode } from 'angular2-websocket/angular2-websocket';

/**
 * 接続先URLのDIキー。
 */
export declare const CONNECT_URL: OpaqueToken;

/**
 * WebSocketサービスモジュールクラス。
 */
@Injectable()
export class WebSocketService {
	// WebSocketコネクション
	ws: $WebSocket;
	// JSON-RPC2用ID採番元
	id = 0;

	/**
	 * 設定をDIしてコンポーネントを生成する。
	 * @param url 接続先URL。
	 */
	constructor( @Inject(CONNECT_URL) @Optional() url?: string) {
		// URLが渡されなかった場合は、自分のサーバーに接続
		if (!url) {
			url = 'ws';
			if (window.location.protocol === 'https:') {
				url += 's';
			}
			url += '://' + window.location.host + '/';
		}
		this.ws = new $WebSocket(url);
		this.ws.onMessage((msg: MessageEvent) => {
			console.log("onMessage ", msg.data);
		});
	}

	/**
	 * JSON-RPC2でリモートプロシージャをコールする。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @returns 戻り値。
	 */
	callProcedure(method: string, params?: any): Promise<any> {
		// TODO: IDに対応する戻り値を返す
		return this.ws.send({ jsonrpc: '2.0', method: method, params: params, id: ++this.id })
			.toPromise();
	}
}
