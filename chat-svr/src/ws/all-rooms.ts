/**
 * ルーム一覧取得メソッドのモジュール。
 * @module ./ws/all-rooms
 */
import roomManager from '../services/room-manager';
import { Room } from '../services/room';

/**
 * ルーム一覧を取得する。
 * @return ルーム一覧。
 */
module.exports = function (): Room[] {
	return roomManager.getRooms();
}
