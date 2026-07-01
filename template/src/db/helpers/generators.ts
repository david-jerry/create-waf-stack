import { nanoid } from "nanoid"

/** URL-safe unique id generator for primary keys. */
export const genId = (size = 21) => nanoid(size)
