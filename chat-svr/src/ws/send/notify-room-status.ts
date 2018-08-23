/**
 * ルーム更新通知のモジュール。
 * @module ./ws/send/notify-room-status
 */
import * as log4js from 'log4js';
import { WebSocketRpcConnection } from '../../core/ws/ws-rpc-connection';
import { WebSocketConnectionMap } from '../../core/ws/ws-connection-map';
import roomManager from '../../services/room-manager';
const logger = log4js.getLogger('error');

/**
 * ルーム更新通知メソッドクラス。
 */
export default class {
	/** コネクション一覧マップ */
	connections: WebSocketConnectionMap;

	/**
	 * ルーム管理にルーム更新通知イベントの送信処理を登録する。
	 */
	init(): void {
		roomManager.on('notifyRoomStatus', (params, connectionIds) => {
			for (let id of connectionIds) {
				let conn = <WebSocketRpcConnection>this.connections.get(id);
				if (conn) {
					conn.notice('notifyRoomStatus', params)
						.catch((e) => logger.error(e));
				}
			}
		});
	}
}
