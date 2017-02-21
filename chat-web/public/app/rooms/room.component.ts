/**
 * チャットルームページコンポーネント。
 * @module ./app/room/room.component
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService, Room, Message } from '../shared/room.service';

/**
 * チャットルームページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/rooms/room.html',
})
export class RoomComponent implements OnInit, OnDestroy {
	/** チャットルーム */
	room: Room = <any>{};
	/** メッセージ一覧 */
	messages: Message[] = [];
	/** メッセージフォーム */
	chatForm = { name: '', body: '' };

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 * @param roomService チャットルームサービス。
	 */
	constructor(
		private route: ActivatedRoute,
		private roomService: RoomService) {
		roomService.on('notifyMessage', (message) => {
			this.messages.unshift(message);
			this.room.updatedAt = message.createdAt;
		});
		roomService.on('notifyRoomStatus', (room) => this.room = room);
	}

	/**
	 * コンポーネント起動時の処理。
	 * @return 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		this.room = await this.roomService.join(this.route.snapshot.params['id']);
	}

	/**
	 * コンポーネント終了時の処理。
	 * @return 処理状態。
	 */
	ngOnDestroy(): Promise<void> {
		return this.roomService.leave();
	}

	/**
	 * メッセージを送信する。
	 * @return 処理状態。
	 */
	sendMessage(): Promise<void> {
		return this.roomService.sendMessage(this.chatForm.name, this.chatForm.body);
	}
}
