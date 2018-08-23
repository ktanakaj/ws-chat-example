/**
 * バリデーションユーティリティモジュール。
 * @module ./core/utils/validation-utils
 */

/**
 * バリデーションNGを示す例外クラス。
 */
export class ValidationError extends Error {
	/**
	 * 例外を生成する。
	 * @param message 例外メッセージ。
	 */
	constructor(message) {
		super(message);
		this.name = "ValidationError";
	}
}

/**
 * バリデートエラーのメッセージを生成する。
 * @param value エラーになった値。
 * @param name 名前を通知する値の名前。
 * @param suffix エラーの文。
 * @returns エラーメッセージ。
 */
function makeMessage(value: any, name?: string, suffix?: string): string {
	let message = '';
	if (name !== undefined) {
		message += name + '=';
	}
	if (value !== undefined) {
		message += value + ' ';
	}
	return message + suffix;
}

/**
 * 渡された値が空か検証する。
 * @param value 空かチェックする値。
 * @param name NG時に通知する値の名前。
 * @returns valueの値。
 * @throws 検証NG。
 */
function notFound<T>(value: T, name?: string): T {
	// ifでfalseと判定される値の場合、空として例外を投げる
	if (!value) {
		throw new ValidationError(name ? makeMessage(undefined, name, "is not found") : undefined);
	}
	return value;
}

/**
 * 渡された値が数値か検証する。
 * @param value 数値かチェックする値。
 * @param name NG時に通知する値の名前。
 * @returns valueの値。
 * @throws 検証NG。
 */
function toNumber(value: any, name?: string): number {
	// 変換に失敗する値の場合、数値以外として例外を投げる
	value = Number(value);
	if (isNaN(value)) {
		throw new ValidationError(makeMessage(value, name, "is not number"));
	}
	return value;
}

/**
 * 渡された数値が最小値未満か検証する。
 * @param value 数値かチェックする値。
 * @param min 最小値。
 * @param name NG時に通知する値の名前。
 * @returns valueの値。
 * @throws 検証NG。
 */
function min(value: any, min: number, name?: string): number {
	value = toNumber(value);
	if (value < min) {
		throw new ValidationError(makeMessage(value, name, " < " + min));
	}
	return value;
}

/**
 * 渡された数値が最大値を超えるか検証する。
 * @param value 数値かチェックする値。
 * @param max 最大値。
 * @param name NG時に通知する値の名前。
 * @returns valueの値。
 * @throws 検証NG。
 */
function max(value: any, max: number, name?: string): number {
	value = toNumber(value);
	if (value > max) {
		throw new ValidationError(makeMessage(value, name, " > " + max));
	}
	return value;
}

/**
 * 渡された数値が範囲内か検証する。
 * @param value 数値かチェックする値。
 * @param min 最小値。
 * @param max 最大値。
 * @param name NG時に通知する値の名前。
 * @returns valueの値。
 * @throws 検証NG。
 */
function range(value: any, minValue: number, maxValue: number, name?: string): number {
	return max(min(value, minValue, name), maxValue, name);
}

export default {
	ValidationError,
	notFound,
	toNumber,
	min,
	max,
	range,
};