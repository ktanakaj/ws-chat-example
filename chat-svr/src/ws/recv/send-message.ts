/**
 * メッセージ送信メソッドのモジュール。
 * @module ./ws/recv/send-message
 */
import { BadRequestError } from '../../core/errors';
import validationUtils from '../../core/utils/validation-utils';
import { WebSocketRpcConnection } from '../../core/ws/ws-rpc-connection';
import { Room } from '../../services/room';
import { Message } from '../../services/message';

/**
 * メッセージ送信クラス。
 */
export default class {
	/** WebSocket/RPCコネクション */
	connection: WebSocketRpcConnection;
	/** セッション情報 */
	session: { room?: Room };

	/**
	 * メッセージを送信する。
	 * @param メッセージ情報。
	 */
	invoke(params: { name: string, body: string }): void {
		// 未参加の場合はエラー
		if (!this.session.room) {
			throw new BadRequestError('room session is not found');
		}
		// メッセージを作成して送信
		const msg = new Message();
		msg.name = validationUtils.notFound(params.name);
		msg.body = validationUtils.notFound(params.body);
		this.session.room.sendMessage(msg);
	}
}
