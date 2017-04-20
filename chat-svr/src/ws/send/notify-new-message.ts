/**
 * メッセージ投稿通知のモジュール。
 * @module ./ws/send/notify-message
 */
import * as log4js from 'log4js';
import { WebSocketRpcConnection } from '../../core/ws/ws-rpc-connection';
import { WebSocketConnectionMap } from '../../core/ws/ws-connection-map';
import roomManager from '../../services/room-manager';
const logger = log4js.getLogger('error');

/**
 * メッセージ投稿通知メソッドクラス。
 */
module.exports = class {
	/** コネクション一覧マップ */
	connections: WebSocketConnectionMap;

	/**
	 * ルーム管理にメッセージ投稿通知イベントの送信処理を登録する。
	 */
	init(): void {
		roomManager.on('notifyNewMessage', (params, connectionIds) => {
			for (let id of connectionIds) {
				let conn = <WebSocketRpcConnection>this.connections.get(id);
				if (conn) {
					conn.notice('notifyNewMessage', params)
						.catch((e) => logger.error(e));
				}
			}
		});
	}
}
