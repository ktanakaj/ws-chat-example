/**
 * システム設定関連サービスモジュール。
 * @module ./app/shared/env.service
 */
import { Injectable } from '@angular/core';
import { Cache } from '../core/cache';
import { WebSocketService } from './websocket.service';

export interface EnvResult {
	environment?: string;
	version?: string;
}

/**
 * システム設定関連サービスクラス。
 */
@Injectable()
export class EnvService {
	/** キャッシュ */
	private cache = new Cache();

	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param wsService WebSocketサービス。
	 */
	constructor(private wsService: WebSocketService) { }

	/**
	 * システム設定情報を取得する。
	 * @returns システム設定情報。
	 * @throws HTTPエラーの場合。※キャッシュ有
	 */
	env(): Promise<EnvResult> {
		return this.cache.doAsyncFunc(this.envImpl, this);
	}

	/**
	 * システム設定情報を取得する。
	 * @returns システム設定情報。
	 */
	private envImpl(): Promise<EnvResult> {
		return this.wsService.callProcedure('env');
	}
}