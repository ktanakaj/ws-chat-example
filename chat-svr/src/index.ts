/**
 * @file Chatサンプルアプリ起動スクリプト。
 */
import * as config from 'config';
import * as log4js from 'log4js';
import 'source-map-support/register';

// log4jsを初期設定
log4js.configure(config['log4js']);
const logger = log4js.getLogger('error');

// WebSocketサーバを起動、コネクション参照用のインスタンスを取得
import { connections } from './core';

// サービス層にWebSocket層用のイベントを登録
import { WebSocketRpcConnection } from './core/ws/ws-rpc-connection';
import roomManager from './services/room-manager';
roomManager.on('notifyRoomStatus', (params, connectionIds) => {
	for (let id of connectionIds) {
		let conn = <WebSocketRpcConnection>connections.get(id);
		if (conn) {
			conn.notice('notifyRoomStatus', params)
				.catch((e) => logger.error(e));
		}
	}
});
roomManager.on('notifyMessage', (params, connectionIds) => {
	for (let id of connectionIds) {
		let conn = <WebSocketRpcConnection>connections.get(id);
		if (conn) {
			conn.notice('notifyMessage', params)
				.catch((e) => logger.error(e));
		}
	}
});