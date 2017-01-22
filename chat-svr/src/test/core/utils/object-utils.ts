/**
 * @file object-utils.tsのテスト。
 */
import * as assert from 'power-assert';
import objectUtils from '../../../core/utils/object-utils';

describe('object-utils', () => {
	describe('#get()', () => {
		it('should get recursive value', () => {
			let obj = { info: { data: { id: 10 }, data2: null } };
			assert.strictEqual(objectUtils.get(obj, "info.data.id"), 10);
			assert.strictEqual(objectUtils.get(obj, "info.data.invalid"), undefined);
			assert.strictEqual(objectUtils.get(obj, "info.data2.id"), undefined);
			assert.strictEqual(objectUtils.get(obj, "info.invalid"), undefined);
			assert.strictEqual(objectUtils.get(obj, "info.invalid.id"), undefined);
			assert.strictEqual(objectUtils.get(obj, "info.data2"), null);
			assert.deepStrictEqual(objectUtils.get(obj, "info.data"), { id: 10 });
			assert.deepStrictEqual(objectUtils.get(obj, "info"), { data: { id: 10 }, data2: null });
			assert.strictEqual(objectUtils.get(obj, "."), undefined);
		});
	});

	describe('#set()', () => {
		it('should set recursive value', () => {
			let obj = { info: { data: { id: 10 }, data2: null } };
			objectUtils.set(obj, "info.data.id", 11);
			assert.strictEqual(obj.info['data']['id'], 11);
			objectUtils.set(obj, "info.data.value", "test");
			assert.strictEqual(obj.info['data']['value'], "test");
			objectUtils.set(obj, "info.data2.id", 25);
			assert.strictEqual(obj.info['data2']['id'], 25);
			objectUtils.set(obj, "info.data3.value", 1500);
			assert.strictEqual(obj.info['data3']['value'], 1500);
			objectUtils.set(obj, "info.comment", "test comment");
			assert.strictEqual(obj.info['comment'], "test comment");
			assert.deepStrictEqual(obj, { info: { data: { id: 11, value: "test" }, data2: { id: 25 }, data3: { value: 1500 }, comment: "test comment" } });
		});
	});

	describe('#copy()', () => {
		it('should copy specfied value', () => {
			let target = {};
			let source = { a: "avalue", b: 15, c: { c1: "c1value" }, d: [1, 2, 3] };
			objectUtils.copy(target, source);
			assert.deepStrictEqual(target, source);

			target = {};
			objectUtils.copy(target, source, ["b"]);
			assert.deepStrictEqual(target, { b: 15 });

			target = {};
			objectUtils.copy(target, source, ["b", "d"]);
			assert.deepStrictEqual(target, { b: 15, d: [1, 2, 3] });

			target = {};
			objectUtils.copy(target, source, ["b", "d", "e"]);
			assert.deepStrictEqual(target, { b: 15, d: [1, 2, 3] });

			target = { a: "olda" };
			objectUtils.copy(target, source, ["b"]);
			assert.deepStrictEqual(target, { a: "olda", b: 15 });

			target = { a: "olda" };
			objectUtils.copy(target, source, ["a", "b"]);
			assert.deepStrictEqual(target, { a: "avalue", b: 15 });

			target = { a: "olda", e: "olde" };
			objectUtils.copy(target, source, ["a", "b", "e"]);
			assert.deepStrictEqual(target, { a: "avalue", e: "olde", b: 15 });
		});
	});

	describe('#mergeArray()', () => {
		it('should merge two object arrays', () => {
			let objs1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
			let objs2 = [{ uid: 3 }, { uid: 5 }, { uid: 1 }];
			objectUtils.mergeArray(objs1, objs2, "id", "uid", "sub");
			assert.deepStrictEqual(objs1, [{ id: 1, sub: { uid: 1 } }, { id: 2 }, { id: 3, sub: { uid: 3 } }, { id: 4 }]);

			objs1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
			let objs3 = [{ uid: 2, data: { value: 30 } }, { uid: 3 }, { uid: 1, data: { value: 10 } }];
			objectUtils.mergeArray(objs1, objs3, "id", "uid", "value", "data.value");
			assert.deepStrictEqual(objs1, [{ id: 1, value: 10 }, { id: 2, value: 30 }, { id: 3, value: undefined }, { id: 4 }]);
		});
	});

	describe('#mergePushArray()', () => {
		it('should merge two object arrays', () => {
			let objs1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
			let objs2 = [{ uid: 3 }, { uid: 5 }, { uid: 1 }, { uid: 1, hoge: "" }];
			objectUtils.mergePushArray(objs1, objs2, "id", "uid", "sub");
			assert.deepStrictEqual(objs1, [{ id: 1, sub: [{ uid: 1 }, { uid: 1, hoge: "" }] }, { id: 2 }, { id: 3, sub: [{ uid: 3 }] }, { id: 4 }]);

			let objs3 = [{ id: 1 }, { id: 2, values: [15] }, { id: 3 }, { id: 4 }];
			let objs4 = [{ uid: 2, data: { value: 30 } }, { uid: 3 }, { uid: 1, data: { value: 10 } }];
			objectUtils.mergePushArray(objs3, objs4, "id", "uid", "values", "data.value");
			assert.deepStrictEqual(objs3, [{ id: 1, values: [10] }, { id: 2, values: [15, 30] }, { id: 3, values: [undefined] }, { id: 4 }]);
		});
	});
});