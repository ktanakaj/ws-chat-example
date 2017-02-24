/**
 * オブジェクト関連ユーティリティモジュール。
 * @module ./core/utils/object-utils
 */

/**
 * 入れ子オブジェクトのプロパティを考慮して取得する。
 * @param obj プロパティを取得するオブジェクト。
 * @param key プロパティのキー。"info.id" のように階層的に指定可能。
 * @returns プロパティの値。プロパティが見つからない場合undefined。
 */
function get(obj: Object, key: string): any {
	let v;
	for (let k of key.split(".")) {
		v = obj ? obj[k] : undefined;
		obj = v;
	}
	return v;
}

/**
 * 入れ子オブジェクトのプロパティを考慮して設定する。
 * @param obj プロパティを設定するオブジェクト。
 * @param key プロパティのキー。"info.id" のように階層的に指定可能。
 * @param value 設定する値。
 */
function set(obj: Object, key: string, value: any): void {
	const keys = key.split(".");
	for (let i = 0; i < keys.length - 1; i++) {
		// 途中の階層がない場合、空のオブジェクトを詰める
		if (!obj[keys[i]]) {
			obj[keys[i]] = {};
		}
		// 参照を一つ下に移動
		obj = obj[keys[i]];
	}
	obj[keys[keys.length - 1]] = value;
}

/**
 * オブジェクトのプロパティをコピーする。
 * @param target コピーされるオブジェクト。
 * @param source コピー元のオブジェクト。
 * @param includes 指定されたプロパティのみをコピーする。
 */
function copy(target: Object, source: Object, includes?: Array<string>): void {
	if (includes === undefined) {
		Object.assign(target, source);
		return;
	}
	for (let key of includes) {
		// 存在するプロパティのみをコピーする
		let value = source[key];
		if (value !== undefined) {
			target[key] = value;
		}
	}
}

/**
 * オブジェクト配列同士をキーでマージする。
 * @param objs1 マージ先のオブジェクト配列。※更新される
 * @param objs2 マージ元のオブジェクト配列。
 * @param idKey1 objs1でキーが入っているプロパティ名。
 * @param idKey2 objs2でキーが入っているプロパティ名。
 * @param objKey マージ結果を登録するプロパティ名。set()の形式が使用可。
 * @param valueKey objs2の特定のプロパティのみを登録する場合そのプロパティ名。get()の形式が使用可。
 * @returns マージ結果。
 */
function mergeArray(objs1: Array<Object>, objs2: Array<Object>, idKey1: string, idKey2: string, objKey: string, valueKey?: string): Array<Object> {
	// 結合用にマップ作成
	const map = {};
	for (let obj1 of objs1) {
		map[obj1[idKey1]] = obj1;
	}

	for (let obj2 of objs2) {
		let obj1 = map[obj2[idKey2]];
		if (obj1) {
			set(obj1, objKey, valueKey ? get(obj2, valueKey) : obj2);
		}
	}
	return objs1;
}

/**
 * オブジェクト配列同士をキーでマージし、片方のオブジェクトの配列プロパティに追加する。
 * @param objs1 マージ先のオブジェクト配列。※更新される
 * @param objs2 マージ元のオブジェクト配列。
 * @param idKey1 objs1でキーが入っているプロパティ名。
 * @param idKey2 objs2でキーが入っているプロパティ名。
 * @param arrayKey マージ結果を登録する配列プロパティ名。set()の形式が使用可。
 * @param valueKey objs2の特定のプロパティのみを登録する場合そのプロパティ名。get()の形式が使用可。
 * @returns マージ結果。
 */
function mergePushArray(objs1: Array<Object>, objs2: Array<Object>, idKey1: string, idKey2: string, arrayKey: string, valueKey?: string): Array<Object> {
	// 結合用にマップ作成
	const map = {};
	for (let obj1 of objs1) {
		map[obj1[idKey1]] = obj1;
	}

	for (let obj2 of objs2) {
		let obj1 = map[obj2[idKey2]];
		if (obj1) {
			// getで配列を取り出し、その後setで詰め直す
			let array = get(obj1, arrayKey) || [];
			if (!Array.isArray(array)) {
				throw new Error(`'${arrayKey}' is not array. : ` + obj1);
			}
			array.push(valueKey ? get(obj2, valueKey) : obj2);
			set(obj1, arrayKey, array);
		}
	}
	return objs1;
}

/**
 * オブジェクトはPromiseか？
 * @param obj チェックするオブジェクト。
 * @returns Promiseの場合true。
 */
function isPromise(obj: any): boolean {
	// bluebirdなどが有効な環境だと、instanceofだけでは正しく判定できないためその対処
	// http://stackoverflow.com/questions/27746304/how-do-i-tell-if-an-object-is-a-promise
	return obj instanceof Promise || (obj && typeof obj.then === 'function');
}

export default {
	get: get,
	set: set,
	copy: copy,
	mergeArray: mergeArray,
	mergePushArray: mergePushArray,
	isPromise: isPromise,
};
