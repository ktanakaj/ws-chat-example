/**
 * WebSocketコネクション管理用クラスのモジュール。
 *
 * 簡易的なWebSocketコネクションの管理用。
 * 1サーバー内のコネクション管理のみ可能。
 * @module ./core/ws/ws-connection-map
 */
import { WebSocketConnection } from './ws-connection';

/**
 * WebSocketコネクション管理用クラス。
 */
export class WebSocketConnectionMap<T extends WebSocketConnection> {
	/** WebScoketコネクション保存用のマップ */
	protected map = new Map<string, T>();

	/**
	 * コネクションを登録する。
	 *
	 * ※ コネクションには自動的にcloseイベントが登録される。
	 * @param connection WebSocket接続。
	 */
	push(connection: T): void {
		connection.once('close', (reason, conn) => {
			this.map.delete(conn.id);
		});
		this.map.set(connection.id, connection);
	}

	/**
	 * 任意のIDのコネクションを取得する。
	 * @param id コネクションID。
	 * @returns 取得したコネクション。取得失敗時はundefined。
	 */
	get(id: string): T {
		return this.map.get(id);
	}

	/**
	 * 全コネクションを取得する。
	 * @returns 全コネクション。
	 */
	values(): IterableIterator<T> {
		return this.map.values();
	}
}
