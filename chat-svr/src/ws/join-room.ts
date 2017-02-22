/**
 * ルーム参加メソッドのモジュール。
 * @module ./ws/join-room
 */
import { ErrorCode } from 'json-rpc2-implementer';
import { AppError } from '../core/app-error';
import validationUtils from '../core/utils/validation-utils';
import { WebSocketRpcConnection } from '../core/ws/ws-rpc-connection';
import roomManager from '../services/room-manager';
import { Room } from '../services/room';

/**
 * ルーム参加メソッドクラス。
 */
module.exports = class {
	/** WebSocket/RPCコネクション */
	connection: WebSocketRpcConnection;
	/** セッション情報 */
	session: { room?: Room };

	/**
	 * ルームに参加する。
	 * @param params 参加情報。
	 * @return ルーム情報。
	 */
	invoke(params: { roomId: number }): Room {
		// ルームを取得&存在チェック
		const room = roomManager.getRoom(validationUtils.toNumber(params.roomId));
		if (!room) {
			throw new AppError(ErrorCode.InvalidParams);
		}

		// 既に参加中の場合は退出
		if (this.session.room) {
			this.session.room.leave(this.connection.id);
		}

		// ルームに参加してその情報をセッションにも登録
		room.join(this.connection.id);
		this.session.room = room;

		// コネクション切断時にルームを自動退出するよう設定
		// ※ 既に抜けていても問題ない処理
		this.connection.once('close', (code, c) => {
			room.leave(c.id);
		});

		return room;
	}
}
