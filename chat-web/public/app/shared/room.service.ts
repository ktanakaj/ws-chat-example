/**
 * チャットルーム関連サービスモジュール。
 * @module ./app/shared/room.service
 */
import { Injectable } from '@angular/core';
import { JsonRpc2Service } from './jsonrpc2.service';

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

/**
 * チャットルーム関連サービスクラス。
 */
@Injectable()
export class RoomService {
	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param rpcService JSON-RPCサービス。
	 */
	constructor(private rpcService: JsonRpc2Service) { }

	/**
	 * チャットルーム一覧を取得する。
	 * @returns チャットルーム一覧。
	 * @throws 通信エラーの場合。
	 */
	findAll(): Promise<Room[]> {
		return this.rpcService.call('allRooms');
	}

	/**
	 * チャットルームを新規作成する。
	 * @param name ルーム名。
	 * @returns チャットルーム。
	 * @throws 通信エラーの場合。
	 */
	create(name: string): Promise<Room> {
		return this.rpcService.call('newRoom', { name: name });
	}

	/**
	 * チャットルームに参加する。
	 * @param roomId ルームID。
	 * @returns チャットルーム。
	 * @throws 通信エラーの場合。
	 */
	join(roomId: number): Promise<Room> {
		return this.rpcService.call('joinRoom', { roomId: roomId });
	}

	/**
	 * チャットルームを離脱する。
	 * @returns 処理状態。
	 * @throws 通信エラーの場合。
	 */
	leave(): Promise<void> {
		return this.rpcService.call('leaveRoom');
	}

	/**
	 * チャットメッセージを送信する。
	 * @throws 通信エラーの場合。
	 */
	sendMessage(name: string, body: string): Promise<void> {
		return this.rpcService.call('sendMessage', { name: name, body: body });
	}
}