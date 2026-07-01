import path from "path"

import winston from "winston"
import "winston-daily-rotate-file"

import { config } from "@/config"

const { combine, timestamp, json, colorize, printf, errors, align } = winston.format

/**
 * Winston singleton. Structured JSON in production, colorized CLI in dev.
 * File rotation is disabled on serverless (read-only FS); Console only there.
 */
class CLoggerManager {
	private static instance: winston.Logger | null = null

	static getInstance(): winston.Logger {
		if (CLoggerManager.instance) return CLoggerManager.instance

		const isDev = process.env.NODE_ENV !== "production"
		const isServerless = process.env.VERCEL === "1" || !!process.env.LAMBDA_TASK_ROOT

		const cliFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
			const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ""
			return `${timestamp} [${level}]: ${stack || message}${metaString}`
		})

		const transports: winston.transport[] = [
			new winston.transports.Console({
				format: isDev
					? combine(colorize(), timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }), errors({ stack: true }), align(), cliFormat)
					: combine(timestamp(), errors({ stack: true }), json()),
			}),
		]

		if (!isServerless) {
			const dir = path.join(process.cwd(), "logs")
			transports.push(
				new winston.transports.DailyRotateFile({
					filename: path.join(dir, "app-%DATE%.log"),
					datePattern: "YYYY-MM-DD",
					zippedArchive: true,
					maxSize: "20m",
					maxFiles: "14d",
					format: combine(timestamp(), errors({ stack: true }), json()),
				}),
				new winston.transports.DailyRotateFile({
					level: "error",
					filename: path.join(dir, "error-%DATE%.log"),
					datePattern: "YYYY-MM-DD",
					zippedArchive: true,
					maxFiles: "30d",
					format: combine(timestamp(), errors({ stack: true }), json()),
				}),
			)
		}

		CLoggerManager.instance = winston.createLogger({
			level: isDev ? "debug" : "info",
			defaultMeta: { service: config.TITLE, platform: isServerless ? "serverless" : "node" },
			transports,
			exitOnError: false,
		})
		return CLoggerManager.instance
	}
}

export const CLogger = CLoggerManager.getInstance()
