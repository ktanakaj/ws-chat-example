/**
 * ルーム作成メソッドのモジュール。
 * @module ./ws/new-room
 */
import '../models';

/**
 * ルーム作成メソッドクラス。
 */
module.exports = class NewRoom {
	/**
	 * ルームを作成する。
	 * @param params 参加情報。
	 * @return ルーム情報。
	 */
	invoke(params: { name: string }) {
		// TODO: 未実装
		// ルームをDBに登録する

		// ルームのIDを返す
		return [];
	}
}
