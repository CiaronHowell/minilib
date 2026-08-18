import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpiringTokenBucket, RefillingTokenBucket, Throttler } from './rate-limit';

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('RefillingTokenBucket', () => {
	it('allows consumption up to max for an unseen key', () => {
		const bucket = new RefillingTokenBucket<string>(5, 60);
		expect(bucket.consume('a', 5)).toBe(true);
	});

	it('rejects a first consumption costing more than max', () => {
		const bucket = new RefillingTokenBucket<string>(5, 60);
		expect(bucket.consume('a', 6)).toBe(false);
	});

	it('depletes with repeated consumption and rejects once empty', () => {
		const bucket = new RefillingTokenBucket<string>(3, 60);
		expect(bucket.consume('a', 1)).toBe(true);
		expect(bucket.consume('a', 1)).toBe(true);
		expect(bucket.consume('a', 1)).toBe(true);
		expect(bucket.consume('a', 1)).toBe(false);
	});

	it('refills over time, capped at max', () => {
		const bucket = new RefillingTokenBucket<string>(3, 10);
		bucket.consume('a', 3);
		expect(bucket.consume('a', 1)).toBe(false);

		vi.advanceTimersByTime(10_000);
		expect(bucket.consume('a', 1)).toBe(true);

		// only 1 refilled, 2 consumed by the check above leaves 0 -> immediate re-check fails
		expect(bucket.consume('a', 1)).toBe(false);

		vi.advanceTimersByTime(100_000);
		expect(bucket.consume('a', 3)).toBe(true);
	});

	it('keeps separate buckets per key', () => {
		const bucket = new RefillingTokenBucket<string>(1, 60);
		expect(bucket.consume('a', 1)).toBe(true);
		expect(bucket.consume('a', 1)).toBe(false);
		expect(bucket.consume('b', 1)).toBe(true);
	});

	it('check() reflects consumability without mutating state', () => {
		const bucket = new RefillingTokenBucket<string>(2, 60);
		bucket.consume('a', 2);
		expect(bucket.check('a', 1)).toBe(false);
		expect(bucket.check('a', 1)).toBe(false);
		expect(bucket.consume('a', 1)).toBe(false);
	});
});

describe('Throttler', () => {
	it('allows the first consumption for a new key', () => {
		const throttler = new Throttler<string>([1, 2, 4]);
		expect(throttler.consume('a')).toBe(true);
	});

	it('blocks a second consumption before the first timeout elapses', () => {
		const throttler = new Throttler<string>([1, 2, 4]);
		throttler.consume('a');
		expect(throttler.consume('a')).toBe(false);
	});

	it('allows the next consumption once the escalating timeout elapses', () => {
		const throttler = new Throttler<string>([1, 2, 4]);
		throttler.consume('a'); // bootstraps at timeout index 0 (1s), no wait required yet
		vi.advanceTimersByTime(1_000);
		expect(throttler.consume('a')).toBe(true); // index -> 1 (2s wait now required)
		vi.advanceTimersByTime(1_000);
		expect(throttler.consume('a')).toBe(false); // only 1s elapsed, needs 2s
		vi.advanceTimersByTime(1_000);
		expect(throttler.consume('a')).toBe(true); // 2s elapsed -> index -> 2 (4s)
	});

	it('caps the timeout index at the last entry', () => {
		const throttler = new Throttler<string>([1, 2]);
		throttler.consume('a'); // index 0
		vi.advanceTimersByTime(1_000);
		throttler.consume('a'); // index -> 1 (max)
		vi.advanceTimersByTime(2_000);
		expect(throttler.consume('a')).toBe(true); // index stays at 1 (capped)
		vi.advanceTimersByTime(2_000);
		expect(throttler.consume('a')).toBe(true);
	});

	it('reset() clears the key so it behaves like new again', () => {
		const throttler = new Throttler<string>([1, 2, 4]);
		throttler.consume('a');
		expect(throttler.consume('a')).toBe(false);
		throttler.reset('a');
		expect(throttler.consume('a')).toBe(true);
	});
});

describe('ExpiringTokenBucket', () => {
	it('allows consumption up to max for an unseen key', () => {
		const bucket = new ExpiringTokenBucket<string>(3, 60);
		expect(bucket.consume('a', 3)).toBe(true);
	});

	it('rejects consumption once exhausted before expiry', () => {
		const bucket = new ExpiringTokenBucket<string>(2, 60);
		bucket.consume('a', 2);
		expect(bucket.consume('a', 1)).toBe(false);
	});

	it('resets to max once the bucket expires', () => {
		const bucket = new ExpiringTokenBucket<string>(2, 10);
		bucket.consume('a', 2);
		expect(bucket.consume('a', 1)).toBe(false);
		vi.advanceTimersByTime(10_000);
		expect(bucket.consume('a', 2)).toBe(true);
	});

	it('check() treats an expired bucket as fully available without mutating it', () => {
		const bucket = new ExpiringTokenBucket<string>(2, 10);
		bucket.consume('a', 2);
		vi.advanceTimersByTime(10_000);
		expect(bucket.check('a', 2)).toBe(true);
		expect(bucket.check('a', 2)).toBe(true);
	});

	it('reset() clears the key', () => {
		const bucket = new ExpiringTokenBucket<string>(1, 60);
		bucket.consume('a', 1);
		expect(bucket.consume('a', 1)).toBe(false);
		bucket.reset('a');
		expect(bucket.consume('a', 1)).toBe(true);
	});
});
