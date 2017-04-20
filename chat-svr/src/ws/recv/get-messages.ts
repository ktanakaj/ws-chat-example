/**
 * メッセージ履歴取得メソッドのモジュール。
 * @module ./ws/recv/get-messages
 */
import { AppError } from '../../core/app-error';
import { Room } from '../../services/room';
import { Message } from '../../services/message';

/**
 * メッセージ履歴取得メソッドクラス。
 */
module.exports = class {
	/** セッション情報 */
	session: { room?: Room };

	/**
	 * メッセージ履歴を取得する。
	 * @return メッセージ履歴。
	 */
	invoke(): Message[] {
		// 未参加の場合はエラー
		if (!this.session.room) {
			throw new AppError();
		}
		// 参加中のルームが保持しているメッセージ履歴を返す
		return this.session.room.messages;
	}
}
