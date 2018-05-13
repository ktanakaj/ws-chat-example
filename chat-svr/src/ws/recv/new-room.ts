/**
 * ルーム作成メソッドのモジュール。
 * @module ./ws/recv/new-room
 */
import validationUtils from '../../core/utils/validation-utils';
import roomManager from '../../services/room-manager';
import { Room } from '../../services/room';

/**
 * ルーム作成メソッドクラス。
 */
module.exports = class {
	/**
	 * ルームを作成する。
	 * @param params ルーム情報。
	 * @return ルーム情報。
	 */
	invoke(params: { name: string }): Room {
		return roomManager.createRoom(validationUtils.notFound(params.name));
	}
};
