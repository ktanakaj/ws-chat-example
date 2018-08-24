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
 * ルーム更新通知クラス。
 */
export default class {
	/** コネクション一覧マップ */
	connections: WebSocketConnectionMap<WebSocketRpcConnection>;

	/**
	 * インスタンス生成時に、ルーム管理のイベントに送信処理を登録する。
	 */
	constructor() {
		roomManager.on('notifyRoomStatus', (params, connectionIds) => this.invoke(params, connectionIds).catch(logger.error));
	}

	/**
	 * ルームが更新されたことを通知する。
	 * @param params メッセージ情報。
	 * @param connectionIds 送信対象コネクションID配列。
	 * @returns 処理状態。
	 */
	async invoke(params: any, connectionIds: string[]): Promise<void> {
		for (let id of connectionIds) {
			let conn = this.connections.get(id);
			if (conn) {
				try {
					await conn.notice('notifyRoomStatus', params);
				} catch (e) {
					logger.error(e);
				}
			}
		}
	}
}
