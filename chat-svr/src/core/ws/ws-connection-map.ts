/**
 * WebSocketコネクション管理用クラスのモジュール。
 *
 * 簡易的なWebSocketコネクションの管理用。
 * 1サーバー内のコネクション管理のみ可能。
 * @module ./core/ws/ws-connection
 */
import { WebSocketConnection } from './ws-connection';
import { WebSocketRpcConnection } from './ws-rpc-connection';

/**
 * WebSocketコネクションに他のコネクション取得用の拡張メソッドを追加したインタフェース。
 */
export interface WebSocketConnectionWithMap extends WebSocketConnection {
	/**
	 * 任意のIDのコネクションを取得する。
	 * @param id コネクションID。
	 * @returns 取得したコネクション。取得失敗時はundefined。
	 */
	getConnection(id: string): WebSocketConnection;
}

/**
 * WebSocket+RPCコネクションに他のコネクション取得用の拡張メソッドを追加したインタフェース。
 */
export interface WebSocketRpcConnectionWithMap extends WebSocketRpcConnection {
	/**
	 * 任意のIDのコネクションを取得する。
	 * @param id コネクションID。
	 * @returns 取得したコネクション。取得失敗時はundefined。
	 */
	getConnection(id: string): WebSocketRpcConnection;
}

/**
 * WebSocketコネクション管理用クラス。
 */
export class WebSocketConnectionMap {
	/** WebScoketコネクション保存用のマップ */
	protected map = new Map<string, WebSocketConnection>();

	/**
	 * コネクションを登録する。
	 *
	 * ※ コネクションには自動的にcloseイベントとgetConnectionメソッドが登録される。
	 * @param connection WebSocket接続。
	 */
	push(connection: WebSocketConnection): void {
		connection.once('close', (reason, conn) => {
			this.map.delete(conn.id);
		});
		connection['getConnection'] = (id) => this.get(id);
		this.map.set(connection.id, connection);
	}

	/**
	 * 任意のIDのコネクションを取得する。
	 * @param id コネクションID。
	 * @returns 取得したコネクション。取得失敗時はundefined。
	 */
	get(id: string): WebSocketConnection {
		return this.map.get(id);
	}
}
