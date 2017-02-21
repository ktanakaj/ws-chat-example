/**
 * ルームクラスのモジュール。
 * @module ./services/room
 */
import * as log4js from 'log4js';
import { WebSocketRpcConnection } from '../core/ws/ws-rpc-connection';
import { Message } from './message';
const logger = log4js.getLogger('error');

/**
 * ルームクラス。
 */
export class Room {
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

	/** ルームの参加者のコネクション。 */
	protected connections = new Map<string, WebSocketRpcConnection>();

	/**
	 * ルームを作成する。
	 * @param id ルームID。
	 * @param name ルーム名。
	 */
	constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
	}

	/**
	 * ルームに参加する。
	 * @param connection 参加するユーザーのコネクション。
	 */
	join(connection: WebSocketRpcConnection): void {
		// ルームにコネクションを登録、セッションにルームを登録
		this.connections.set(connection.id, connection);
		connection.session['room'] = this;
		// コネクション切断時にルームを自動退出
		// ※ 繰り返し呼ばれても問題ないので登録しっぱなし
		connection.on('close', (code, c) => {
			this.leave(<WebSocketRpcConnection>c);
		});
		// ルーム累計参加者数を増やす
		++this.totalMembers;
		// 入室を他の参加者に通知
		this.notifyRoomStatus(connection.id);
	}

	/**
	 * ルームを離脱する。
	 * @param connection 参加中のユーザーのコネクション。
	 */
	leave(connection: WebSocketRpcConnection): void {
		// 未参加の場合何もしない
		if (this.connections.delete(connection.id)) {
			// 他の参加者に退室を通知（ログインが無いので人数増減だけ）
			connection.session['room'] = null;
			this.notifyRoomStatus(connection.id);
		}
	}

	/**
	 * メッセージを送信する。
	 * @param senderId 送信者の接続ID。
	 * @param message メッセージ。
	 */
	sendMessage(connection: WebSocketRpcConnection, message: Message): void {
		this.updatedAt = message.createdAt;
		this.notifyMessage(message);
	}

	/**
	 * メッセージを通知する。
	 * @param message メッセージ。
	 */
	protected notifyMessage(message: Message): void {
		// バックグランドで送信
		this.noticeAll('notifyMessage', message)
			.catch((e) => logger.error(e));
	}

	/**
	 * ルーム情報更新を通知する。
	 * @param senderId 送信者の接続ID。
	 */
	protected notifyRoomStatus(senderId: string): void {
		// バックグランドで送信
		this.noticeAll('notifyRoomStatus', this, senderId)
			.catch((e) => logger.error(e));
	}

	/**
	 * ルーム内の全員に通知を送信する。
	 * @param method メソッド名。
	 * @param params 引数。
	 * @param ignoreId 送信者の接続ID。
	 * @returns 処理状態。
	 */
	protected noticeAll(method: string, params: any, ignoreId?: string): Promise<void[]> {
		const promises: Promise<void>[] = [];
		for (let conn of this.connections.values()) {
			if (conn.id !== ignoreId) {
				promises.push(conn.notice(method, params));
			}
		}
		return Promise.all(promises);
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
}