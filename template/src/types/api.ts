/**
 * Standardized response shapes.
 *
 * Server actions in this project return the lightweight `ActionResult<T>` shape
 * (`{ status, data, error }`). `APIResponse<T>` is the richer envelope for
 * route handlers / external surfaces. Match whichever the file you edit uses.
 */

export type ActionResult<T> =
	| { status: true; data: T; message?: string }
	| { status: false; data: null; error: string | Record<string, string[]> }

export interface APIResponse<T> {
	success: boolean
	message: string
	data?: T
	timestamp: Date
	error_code?: string
}

export interface PaginationMeta {
	nextCursor?: string | null
	hasMore: boolean
	totalCount?: number
}

export interface PaginatedData<T> {
	records: T[]
	pagination: PaginationMeta
}

export type PaginatedAPIResponse<T> = APIResponse<PaginatedData<T>>
