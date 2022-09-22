/**
 * システム設定関連サービスモジュール。
 *
 * @module ./app/shared/env.service
 */
import { Injectable } from '@angular/core';
import { JsonRpc2Service } from './jsonrpc2.service';

export interface EnvResult {
  environment: string;
  version: string;
}

/**
 * システム設定関連サービスクラス。
 */
@Injectable()
export class EnvService {
  /** システム設定情報キャッシュ */
  private envResult: EnvResult | null = null;

  /**
   * モジュールを使用するコンポーネントを生成する。
   *
   * @param rpcService JSON-RPCサービス。
   */
  constructor(private rpcService: JsonRpc2Service) { }

  /**
   * システム設定情報を取得する。
   *
   * @returns システム設定情報。※キャッシュ有
   * @throws 通信エラーの場合。
   */
  async env(): Promise<EnvResult> {
    if (!this.envResult) {
      this.envResult = await this.envImpl();
    }
    return this.envResult;
  }

  /**
   * システム設定情報を取得する。
   *
   * @returns システム設定情報。
   */
  private envImpl(): Promise<EnvResult> {
    return this.rpcService.call('env');
  }
}