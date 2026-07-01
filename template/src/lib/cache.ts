import { CacheManager } from "./redis"

/**
 * Project-wide cache conventions. Cache only raw data (never error envelopes)
 * in read actions, and invalidate the matching tag in every mutation:
 *
 *   const data = await cache.wrap(cacheKeys.posts.all, () => db.query..., cacheTTL.medium, [cacheTags.posts])
 *   ...
 *   await cache.invalidateByTag(cacheTags.posts)
 *
 * Add a tag family + key group per domain as you build them.
 */
export const cache = CacheManager.getInstance("{{APP_SLUG}}")

/** TTLs in seconds. */
export const cacheTTL = {
	short: 60,
	medium: 600,
	long: 60 * 60 * 3,
} as const

/** Tag families for invalidation. Example:
 *   posts: "posts",
 *   post: (id: string) => `post:${id}`,
 */
export const cacheTags = {} as const

/** Stable cache keys. Example:
 *   posts: { all: "posts:all", one: (id: string) => `posts:one:${id}` },
 */
export const cacheKeys = {} as const
