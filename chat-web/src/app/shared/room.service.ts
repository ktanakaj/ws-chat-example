/**
 * チャットルーム関連サービスモジュール。
 *
 * @module ./app/shared/room.service
 */
import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { JsonRpc2Service, MethodNotFoundError } from './jsonrpc2.service';
import { Room } from './room.model';
import { Message } from './message.model';

/**
 * チャットルーム関連サービスクラス。
 */
@Injectable()
export class RoomService extends EventEmitter {
  /**
   * モジュールを使用するコンポーネントを生成する。
   *
   * @param rpcService JSON-RPCサービス。
   */
  constructor(private rpcService: JsonRpc2Service) {
    super();
    rpcService.methodHandlers.push((method, params) => {
      switch (method) {
        case 'notifyNewMessage':
        case 'notifyRoomStatus':
        case 'notifyNewRoom':
          this.emit(method, params);
          return;
        default:
          throw new MethodNotFoundError(method);
      }
    });
  }

  /**
   * チャットルーム一覧を取得する。
   *
   * @returns チャットルーム一覧。
   * @throws 通信エラーの場合。
   */
  findAll(): Promise<Room[]> {
    return this.rpcService.call('allRooms');
  }

  /**
   * チャットルームを新規作成する。
   *
   * @param name ルーム名。
   * @returns チャットルーム。
   * @throws 通信エラーの場合。
   */
  create(name: string): Promise<Room> {
    return this.rpcService.call('newRoom', { name });
  }

  /**
   * チャットルームに参加する。
   *
   * @param roomId ルームID。
   * @returns チャットルーム。
   * @throws 通信エラーの場合。
   */
  join(roomId: number): Promise<Room> {
    return this.rpcService.call('joinRoom', { roomId });
  }

  /**
   * チャットルームを離脱する。
   *
   * @returns 処理状態。
   * @throws 通信エラーの場合。
   */
  leave(): Promise<void> {
    return this.rpcService.call('leaveRoom');
  }

  /**
   * チャットメッセージ一覧を取得する。
   *
   * @returns チャットメッセージ一覧。
   * @throws 通信エラーの場合。
   */
  getMessages(): Promise<Message[]> {
    return this.rpcService.call('getMessages');
  }

  /**
   * チャットメッセージを送信する。
   *
   * @throws 通信エラーの場合。
   */
  sendMessage(name: string, body: string): Promise<void> {
    return this.rpcService.call('sendMessage', { name: name, body: body });
  }

  // イベント定義
  override on(event: 'notifyNewMessage', listener: (message: Message) => void): this;
  override on(event: 'notifyRoomStatus', listener: (room: Room) => void): this;
  override on(event: 'notifyNewRoom', listener: (room: Room) => void): this;
  override on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
  override removeListener(event: 'notifyNewMessage', listener: (message: Message) => void): this;
  override removeListener(event: 'notifyRoomStatus', listener: (room: Room) => void): this;
  override removeListener(event: 'notifyNewRoom', listener: (room: Room) => void): this;
  override removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.removeListener(event, listener);
  }
}