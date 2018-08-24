/**
 * ルーム作成メソッドのモジュール。
 * @module ./ws/recv/new-room
 */
import roomManager from '../../services/room-manager';
import { Room } from '../../services/room';

/**
 * ルーム作成クラス。
 */
export default class {
	/** リクエストパラメータJSONスキーマ定義 */
	schema = {
		type: 'object',
		required: [
			'name',
		],
		properties: {
			name: { type: 'string', minLength: 1 },
		},
	};

	/**
	 * ルームを作成する。
	 * @param params ルーム情報。
	 * @return ルーム情報。
	 */
	invoke(params: { name: string }): Room {
		return roomManager.createRoom(params.name);
	}
}
