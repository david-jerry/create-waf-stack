import { Redis } from "@upstash/redis"

import { config } from "@/config"

/**
 * App-level cache with tag-based invalidation, built on Upstash Redis (HTTP/REST
 * — serverless-safe). Separate from Next's data cache.
 *
 * Resilience: when UPSTASH_REDIS_REST_URL/TOKEN are unset (e.g. local dev before
 * Redis is provisioned), every method degrades to a no-op passthrough so the app
 * still works — reads just always hit the source.
 *
 * Tags: a tag is a Redis set of keys. `wrap`/`set` register the key under each
 * tag; `invalidateByTag` deletes every key in the set, then the set itself.
 */
export class CacheManager {
	private static instances = new Map<string, CacheManager>()
	private redis: Redis | null
	private ns: string

	private constructor(namespace: string) {
		this.ns = namespace
		this.redis = config.UPSTASH_REDIS_REST_URL && config.UPSTASH_REDIS_REST_TOKEN
			? new Redis({ url: config.UPSTASH_REDIS_REST_URL, token: config.UPSTASH_REDIS_REST_TOKEN })
			: null
	}

	static getInstance(namespace = "app"): CacheManager {
		if (!CacheManager.instances.has(namespace)) {
			CacheManager.instances.set(namespace, new CacheManager(namespace))
		}
		return CacheManager.instances.get(namespace)!
	}

	get enabled() {
		return this.redis !== null
	}

	private k(key: string) {
		return `${this.ns}:${key}`
	}
	private tagKey(tag: string) {
		return `${this.ns}:tag:${tag}`
	}

	async get<T>(key: string): Promise<T | null> {
		if (!this.redis) return null
		try {
			return (await this.redis.get<T>(this.k(key))) ?? null
		} catch {
			return null
		}
	}

	async set<T>(key: string, value: T, ttlSeconds: number, tags: string[] = []): Promise<void> {
		if (!this.redis) return
		try {
			await this.redis.set(this.k(key), value, { ex: ttlSeconds })
			for (const tag of tags) {
				await this.redis.sadd(this.tagKey(tag), this.k(key))
			}
		} catch {
			/* ignore cache write failures */
		}
	}

	async del(key: string): Promise<void> {
		if (!this.redis) return
		try {
			await this.redis.del(this.k(key))
		} catch {
			/* ignore */
		}
	}

	async invalidateByTag(tag: string): Promise<void> {
		if (!this.redis) return
		try {
			const members = await this.redis.smembers(this.tagKey(tag))
			if (members.length) await this.redis.del(...members)
			await this.redis.del(this.tagKey(tag))
		} catch {
			/* ignore */
		}
	}

	/** Cache-aside: return cached value or run `loader`, cache it, and return it. */
	async wrap<T>(key: string, loader: () => Promise<T>, ttlSeconds: number, tags: string[] = []): Promise<T> {
		const cached = await this.get<T>(key)
		if (cached !== null) return cached
		const fresh = await loader()
		await this.set(key, fresh, ttlSeconds, tags)
		return fresh
	}
}
