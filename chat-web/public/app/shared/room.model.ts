/**
 * ルーム情報モデルモジュール。
 * @module ./app/shared/room.model
 */

/**
 * ルーム情報。
 */
export interface Room {
	/** ルームID */
	id: number;
	/** ルーム名 */
	name: string;
	/** ルーム参加者数 */
	members: number;
	/** ルーム累計参加者数 */
	totalMembers: number;
	/** ルーム作成日時 */
	createdAt: Date;
	/** ルーム更新日時 */
	updatedAt: Date;
}