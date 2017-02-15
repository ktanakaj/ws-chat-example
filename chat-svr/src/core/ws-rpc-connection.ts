/**
 * WebSocket上のJSON-RPC2コネクションクラスのモジュール。
 * @module ./core/ws-rpc-connection
 */
import * as WebSocket from 'ws';
import { JsonRpc2Implementer } from 'json-rpc2-implementer';
import { WebSocketConnection } from './ws-connection';

/**
 * WebSocket上のJSON-RPC2コネクションクラス。
 */
export class WebSocketRpcConnection extends WebSocketConnection {
	/** JSON-RPC2実装 */
	rpc: JsonRpc2Implementer;

	/** メソッドコールイベントのハンドラー */
	methodHandler: (method: string, params: any, id: number | string, connection: WebSocketRpcConnection) => any;

	/**
	 * WebSocket上にJSON-RPC2コネクション用のインスタンスを生成する。
	 * @param ws 生のWebSocket接続。
	 */
	constructor(ws: WebSocket) {
		super(ws);
		this.rpc = new JsonRpc2Implementer();
		this.messageHandlers.push((message) => this.rpc.receive(message).catch(console.error));
		this.rpc.sender = (message) => this.send(message, false);
		this.rpc.methodHandler = (method, params, id) => {
			return this.methodHandler(method, params, id, this);
		};
	}

	/**
	 * JSON-RPC2リクエストを送信する。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @return メソッドの処理結果。
	 */
	call(method: string, params: any): Promise<any> {
		return this.rpc.call(method, params);
	}


	/**
	 * JSON-RPC2通知リクエストを送信する。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @return 処理状態。
	 */
	notice(method: string, params: any): Promise<void> {
		return this.rpc.notice(method, params);
	}
}

