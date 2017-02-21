/**
 * JSON-RPC2形式のWebSocketサービスモジュール。
 * @module ./app/shared/jsonrpc2.service
 */
import { Injectable, Inject, Optional } from '@angular/core';
import { JsonRpc2Implementer } from 'json-rpc2-implementer';
import { WebSocketService, CONNECT_URL, LOGGER } from './websocket.service';

/**
 * JSON-RPC2形式のWebSocketサービスモジュールクラス。
 */
@Injectable()
export class JsonRpc2Service extends WebSocketService {
	/** メソッドコールのハンドラー */
	methodHandler: (method: string, params?: any, id?: number | string) => any;

	/** JSON-RPC2実装 */
	private rpc: JsonRpc2Implementer;

	/**
	 * JSON-RPC2形式でデータをやり取りするWebSocket接続を構築する。
	 * @param url 接続先URL。
	 */
	constructor( @Inject(CONNECT_URL) @Optional() url?: string, @Inject(LOGGER) @Optional() logger?: (level, message) => void) {
		super(url, logger);
		this.rpc = new JsonRpc2Implementer();
		this.rpc.sender = (message) => this.send(message, false);
		this.on('message', (ev) => this.rpc.receive(ev.data).catch((err) => this.logger('error', err)));
		this.rpc.methodHandler = (method, params, id) => {
			return this.methodHandler(method, params, id);
		};
	}

	/**
	 * JSON-RPC2でリモートプロシージャをコールする。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @returns 戻り値。
	 */
	call(method: string, params?: any): Promise<any> {
		return this.rpc.call(method, params);
	}

	/**
	 * JSON-RPC2でリモートプロシージャを通知を送る。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @returns 処理状態。
	 */
	notice(method: string, params?: any): Promise<void> {
		return this.rpc.notice(method, params);
	}
}
