/**
 * ルームクラスのモジュール。
 * @module ./services/room
 */
import { EventEmitter } from 'events';
import { Message } from './message';

/**
 * ルームクラス。
 */
export class Room extends EventEmitter {
	/** ルームID */
	id: number;
	/** ルーム名 */
	name: string;
	/** ルーム累計参加者数 */
	totalMembers: number = 0;
	/** ルーム作成日時 */
	createdAt: Date = new Date();
	/** ルーム更新日時 */
	updatedAt: Date = new Date();

	/** メッセージ履歴 */
	messages: Message[] = [];

	/** ルームの参加者のコネクション。 */
	protected connections = new Set<string>();

	/**
	 * ルームを作成する。
	 * @param id ルームID。
	 * @param name ルーム名。
	 */
	constructor(id: number, name: string) {
		super();
		this.id = id;
		this.name = name;
	}

	/**
	 * ルームに参加する。
	 * @param connectionId 参加するユーザーのコネクションID。
	 */
	join(connectionId: string): void {
		// ルームにコネクションを登録、セッションにルームを登録
		this.connections.add(connectionId);
		// ルーム累計参加者数を増やす
		++this.totalMembers;
		// 入室を他の参加者に通知
		this.notifyRoomStatus(connectionId);
	}

	/**
	 * ルームを離脱する。
	 * @param connectionId 参加中のユーザーのコネクションID。
	 */
	leave(connectionId: string): void {
		// 未参加の場合何もしない
		if (this.connections.delete(connectionId)) {
			// 他の参加者に退室を通知（ログインが無いので人数増減だけ）
			this.notifyRoomStatus(connectionId);
		}
	}

	/**
	 * メッセージを送信する。
	 * @param message メッセージ。
	 */
	sendMessage(message: Message): void {
		this.updatedAt = message.createdAt;
		this.messages.unshift(message);
		this.notifyNewMessage(message);
	}

	/**
	 * メッセージを通知する。
	 * @param message メッセージ。
	 */
	protected notifyNewMessage(message: Message): void {
		this.noticeAll('notifyNewMessage', message);
	}

	/**
	 * ルーム情報更新を通知する。
	 * @param senderId 送信者の接続ID。
	 */
	protected notifyRoomStatus(senderId: string): void {
		this.noticeAll('notifyRoomStatus', this, senderId);
	}

	/**
	 * ルーム内の全員に通知を送信する。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @param ignoreId 送信者の接続ID。
	 * @returns 処理状態。
	 */
	protected noticeAll(method: string, params: any, ignoreId?: string): void {
		const ids = Array.from(this.connections).filter((id) => id !== ignoreId);
		if (ids.length > 0) {
			this.emit(<any>method, params, ids);
		}
	}

	/**
	 * JSON用のオブジェクトを取得する。
	 * @returns JSONオブジェクト。
	 */
	toJSON(): Object {
		return {
			id: this.id,
			name: this.name,
			members: this.connections.size,
			totalMembers: this.totalMembers,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	// イベント定義
	on(event: 'notifyNewMessage', listener: (params: any, connectionIds: string[]) => void): this;
	on(event: 'notifyRoomStatus', listener: (params: any, connectionIds: string[]) => void): this;
	on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}
}