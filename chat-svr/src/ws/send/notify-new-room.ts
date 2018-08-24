/**
 * ルーム作成通知のモジュール。
 * @module ./ws/send/notify-new-room
 */
import * as log4js from 'log4js';
import { WebSocketRpcConnection } from '../../core/ws/ws-rpc-connection';
import { WebSocketConnectionMap } from '../../core/ws/ws-connection-map';
import roomManager from '../../services/room-manager';
const logger = log4js.getLogger('error');

/**
 * ルーム作成通知クラス。
 */
export default class {
	/** コネクション一覧マップ */
	connections: WebSocketConnectionMap<WebSocketRpcConnection>;

	/**
	 * インスタンス生成時に、ルーム管理のイベントに送信処理を登録する。
	 */
	constructor() {
		roomManager.on('notifyNewRoom', (params) => this.invoke(params).catch(logger.error));
	}

	/**
	 * ルームが作成されたことを通知する。
	 * @param params メッセージ情報。
	 * @returns 処理状態。
	 */
	async invoke(params: any): Promise<void> {
		// 接続中の全員に送信する
		for (let conn of this.connections.values()) {
			try {
				await conn.notice('notifyNewRoom', params);
			} catch (e) {
				logger.error(e);
			}
		}
	}
}
