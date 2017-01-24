/**
 * @file cache.tsのテスト。
 */
import * as assert from 'power-assert';
import { Cache } from '../../../public/app/core/cache';

describe('cache', () => {
	describe('#doFunc()', () => {
		it('should cache result of function', () => {
			let i = 0;
			const func = () => ++i;

			// 以下、同じパラメータには同じ結果が返る
			const cache = new Cache();
			let result = cache.doFunc<number>(func);
			assert.equal(cache.doFunc(func), result);
			assert.equal(cache.doFunc(func, this), result + 1);
			assert.equal(cache.doFunc(func, this, ['dummy']), result + 2);
			assert.equal(cache.doFunc(func), result);
			assert.equal(cache.doFunc(func, this), result + 1);
			assert.equal(cache.doFunc(func, this, ['dummy']), result + 2);

			// キャッシュリセット後は、値が更新される
			cache.reset();
			assert.equal(cache.doFunc(func), result + 3);
			assert.equal(cache.doFunc(func, this), result + 4);
			assert.equal(cache.doFunc(func, this, ['dummy']), result + 5);
		});
	});

	describe('#doAsyncFunc()', () => {
		it('should cache result of function', async function () {
			let i = 0;
			const func = () => Promise.resolve(++i);
			const obj = {};

			// 以下、同じパラメータには同じ結果が返る
			// ※ asyncの方はthisを渡すと循環参照だと言われるので、適当なオブジェクトを渡す
			const cache = new Cache();
			let result = await cache.doFunc<number>(func);
			assert.equal(await cache.doFunc(func), result);
			assert.equal(await cache.doFunc(func, obj), result + 1);
			assert.equal(await cache.doFunc(func, obj, ['dummy']), result + 2);
			assert.equal(await cache.doFunc(func), result);
			assert.equal(await cache.doFunc(func, obj), result + 1);
			assert.equal(await cache.doFunc(func, obj, ['dummy']), result + 2);

			// キャッシュリセット後は、値が更新される
			cache.reset();
			assert.equal(await cache.doFunc(func), result + 3);
			assert.equal(await cache.doFunc(func, obj), result + 4);
			assert.equal(await cache.doFunc(func, obj, ['dummy']), result + 5);
		});
	});
});