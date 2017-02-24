/**
 * デバッグ関連ユーティリティモジュール。
 * @module ./core/utils/debug-utils
 */
import * as util from 'util';

/**
 * dumpをコンソール出力する。
 * @param value 出力する値。
 */
function dump(value: any): void {
	console.log(util.inspect(value));
}

/**
 * 全dumpをコンソール出力する。
 * @param value 出力する値。
 */
function dumpAll(value: any): void {
	const option = { showHidden: true, depth: null, maxArrayLength: null };
	console.log(util.inspect(value, option));
}

/**
 * オブジェクトのプロパティの一覧を出力する。
 * @param obj 出力するオブジェクト。
 */
function printProperties(obj: Object): void {
	let log = "";
	for (let key in obj) {
		log += key + "\n";
	}
	console.log(log);
}

/**
 * 関数を開始/終了ログ付きで実行する。
 *
 * Promiseの場合は、非同期処理の終了時にログを出力する。
 * @param func 実行する関数。
 * @param name ログ名。
 * @param start 開始タグ名。
 * @param end 終了タグ名。
 * @returns 関数の戻り値。
 */
function doFunctionWithLog(func: Function, name: string, start: string = "開始", end: string = "終了"): any {
	let endLog = name + end;
	console.time(endLog);
	console.log(name + start);
	let result = func();
	if (result instanceof Promise) {
		result.then((value) => {
			console.timeEnd(endLog);
			return value;
		});
	} else {
		console.timeEnd(endLog);
	}
	return result;
}

export default {
	dump: dump,
	dumpAll: dumpAll,
	printProperties: printProperties,
	doFunctionWithLog: doFunctionWithLog,
};
