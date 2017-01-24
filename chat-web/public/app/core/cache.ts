/**
 * 簡易キャッシュモジュール。
 * @module ./app/core/cache
 */

/**
 * キャッシュ。
 */
export class Cache {
	/** キャッシュデータ */
	private caches: Map<string, any> = new Map<string, any>();

	/**
	 * 同期関数を結果のキャッシュ付で実行する。
	 * @param func 実行する関数。
	 * @param thisArg 関数を実行するときのthis。
	 * @param argsArray 関数の引数。
	 * @param force キャッシュを使用しない場合true。
	 */
	doFunc<T>(func: Function, thisArg?: Object, argsArray?: any[], force?: boolean): T {
		const key = this.makeKey(func, thisArg, argsArray);
		if (!force && this.caches.has(key)) {
			return this.caches.get(key);
		}
		const result = func.apply(thisArg, argsArray);
		this.caches.set(key, result);
		return result;
	}

	/**
	 * 非同期関数を結果のキャッシュ付で実行する。
	 * @param func 実行する関数。Promiseを返す必要がある。
	 * @param thisArg 関数を実行するときのthis。
	 * @param argsArray 関数の引数。
	 * @param force キャッシュを使用しない場合true。
	 */
	async doAsyncFunc<T>(func: Function, thisArg?: Object, argsArray?: any[], force?: boolean): Promise<T> {
		const key = this.makeKey(func, thisArg, argsArray);
		if (!force && this.caches.has(key)) {
			return Promise.resolve(this.caches.get(key));
		}
		const result = await func.apply(thisArg, argsArray);
		this.caches.set(key, result);
		return result;
	}

	/**
	 * キャッシュのキー文字列を生成する。
	 * @param params キー文字列のために使用するパラメータ。
	 * @returns キー文字列。
	 */
	makeKey(...params: any[]) {
		// ※ 単純にJSONを作る。さくっと実装したのでいろいろ漏れてるかも
		return JSON.stringify(params);
	}

	/**
	 * キャッシュをリセットする。
	 */
	reset(): void {
		this.caches.clear();
	}
}