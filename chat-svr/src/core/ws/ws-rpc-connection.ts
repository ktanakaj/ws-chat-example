/**
 * WebSocket上のJSON-RPC2コネクションクラスのモジュール。
 * @module ./core/ws/ws-rpc-connection
 */
import * as WebSocket from 'ws';
import { JsonRpc2Implementer } from 'json-rpc2-implementer';
import { WebSocketConnection, WebSocketConnectionOptions } from './ws-connection';

/**
 * WebSocket上のJSON-RPC2コネクションのオプション引数。
 */
export interface WebSocketRpcConnectionOptions extends WebSocketConnectionOptions {
	/** メソッドコールのハンドラー */
	methodHandler?: (method: string, params?: any, id?: number | string) => any;
}

/**
 * WebSocket上のJSON-RPC2コネクションクラス。
 */
export class WebSocketRpcConnection extends WebSocketConnection {
	/** JSON-RPC2実装 */
	rpc: JsonRpc2Implementer;

	/** メソッドコールのハンドラー */
	methodHandler: (method: string, params?: any, id?: number | string) => any;

	/**
	 * WebSocket上にJSON-RPC2コネクション用のインスタンスを生成する。
	 * @param ws 生のWebSocket接続。
	 * @param options オプション。
	 */
	constructor(ws: WebSocket, options: WebSocketRpcConnectionOptions = {}) {
		super(ws, options);
		this.rpc = new JsonRpc2Implementer();
		this.rpc.methodHandler = options.methodHandler;
		this.on('message', (message) => this.rpc.receive(message).catch((err) => this.logger('error', this.formatAccessLog('RECEIVE ERROR', err))));
		this.rpc.sender = (message) => {
			// コネクション切断済みで返せない場合はワーニング
			if (this.ws.readyState !== WebSocket.OPEN) {
				this.logger('debug', this.formatAccessLog('SEND ERROR', `Response can't be sent client because this connection was already closed. ${message}`));
			} else {
				this.send(message, false).catch((err) => this.logger('error', this.formatAccessLog('SEND ERROR', err)));
			}
		};
	}

	/**
	 * JSON-RPC2リクエストを送信する。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @return メソッドの処理結果。
	 */
	call<T>(method: string, params: any): Promise<T> {
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

