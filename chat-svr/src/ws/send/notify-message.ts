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
 * ルーム管理にメッセージ投稿通知イベントの送信処理を登録する。
 * @param connections コネクション一覧マップ。
 */
export default function (connections: WebSocketConnectionMap): void {
	roomManager.on('notifyMessage', (params, connectionIds) => {
		for (let id of connectionIds) {
			let conn = <WebSocketRpcConnection>connections.get(id);
			if (conn) {
				conn.notice('notifyMessage', params)
					.catch((e) => logger.error(e));
			}
		}
	});
}
