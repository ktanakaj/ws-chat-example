/**
 * JSON-RPC2形式のWebSocketサービスモジュール。
 * @module ./app/shared/jsonrpc2.service
 */
import { Injectable, Inject, Optional } from '@angular/core';
import { JsonRpc2Implementer } from 'json-rpc2-implementer';
import { WebSocketService, CONNECT_URL } from './websocket.service';

/**
 * JSON-RPC2形式のWebSocketサービスモジュールクラス。
 */
@Injectable()
export class JsonRpc2Service extends WebSocketService {
	/** JSON-RPC2実装 */
	private rpc: JsonRpc2Implementer;

	/**
	 * JSON-RPC2形式でデータをやり取りするWebSocket接続を構築する。
	 */
	constructor( @Inject(CONNECT_URL) @Optional() url?: string) {
		super(url);
		this.rpc = new JsonRpc2Implementer();
		this.rpc.sender = (message) => this.send(message, false);
		this.onMessage((ev) => this.rpc.receive(ev.data).catch(console.error));
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
}
