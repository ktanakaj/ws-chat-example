/**
 * メッセージクラスのモジュール。
 * @module ./services/message
 */
export class Message {
	/** 送信者名 */
	name: string;
	/** メッセージ本体 */
	body: string;
	/** 送信日時 */
	createdAt: Date = new Date();
}