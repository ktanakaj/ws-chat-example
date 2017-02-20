/**
 * トップページコンポーネント。
 * @module ./app/top/top.component
 */
import { Component, OnInit } from '@angular/core';
import { RoomService, Room } from '../shared/room.service';

/**
 * トップページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/top/top.html',
})
export class TopComponent implements OnInit {
	/** チャットルーム一覧 */
	rooms: Room[] = [];
	/** 新規ルーム作成フォーム */
	createForm = { name: '' };

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param roomService チャットルームサービス。
	 */
	constructor(
		private roomService: RoomService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @return 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		this.rooms = await this.roomService.findAll();
	}

	/**
	 * チャットルームを新規作成する。
	 * @return 処理状態。
	 */
	async createRoom(): Promise<void> {
		const room = await this.roomService.create(this.createForm.name);
		this.rooms.unshift(room);
	}
}
