/**
 * システム設定関連サービスモジュール。
 * @module ./app/shared/env.service
 */
import { Injectable } from '@angular/core';
import { Cache } from '../core/cache';
import { JsonRpc2Service } from './jsonrpc2.service';

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
	 * @param rpcService JSON-RPCサービス。
	 */
	constructor(private rpcService: JsonRpc2Service) { }

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
		return this.rpcService.callProcedure('env');
	}

	/**
	 * このインスタンスをJSONに変換する。
	 * @returns JSON用オブジェクト。
	 */
	toJSON(): any {
		// キャッシュ処理でthisが循環参照になるのでその対処
		return { name: 'EnvService' };
	}
}