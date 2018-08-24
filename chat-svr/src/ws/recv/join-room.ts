/**
 * ルーム参加メソッドのモジュール。
 * @module ./ws/recv/join-room
 */
import { BadRequestError } from '../../core/errors';
import { WebSocketRpcConnection } from '../../core/ws/ws-rpc-connection';
import roomManager from '../../services/room-manager';
import { Room } from '../../services/room';

/**
 * ルーム参加クラス。
 */
export default class {
	/** WebSocket/RPCコネクション */
	connection: WebSocketRpcConnection;
	/** セッション情報 */
	session: { room?: Room };

	/** リクエストパラメータJSONスキーマ定義 */
	schema = {
		type: 'object',
		required: [
			'roomId',
		],
		properties: {
			roomId: { type: 'integer' },
		},
	};

	/**
	 * ルームに参加する。
	 * @param params 参加情報。
	 * @return ルーム情報。
	 */
	invoke(params: { roomId: number }): Room {
		// ルームを取得&存在チェック
		const room = roomManager.getRoom(params.roomId);
		if (!room) {
			throw new BadRequestError(`roomId=${params.roomId} is not found`);
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
