/**
 * メッセージ情報モデルモジュール。
 * @module ./app/shared/message.service
 */

/**
 * メッセージ情報。
 */
export interface Message {
	/** 送信者名 */
	name: string;
	/** メッセージ本体 */
	body: string;
	/** 送信日時 */
	createdAt: Date;
}