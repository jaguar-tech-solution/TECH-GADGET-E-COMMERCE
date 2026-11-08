import { success, ZodError } from "zod";
import pkg from "@prisma/client";
import { logger } from "../config/logger.js";
const {Prisma} = pkg

const isProduction = process.env.NODE_ENV === "production";
const GENERIC_MESSAGE = "An unexpected error occurred on the server.";
const DB_MESSAGE = "A database error occurred while processing your request.";


export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err)

    let statusCode = 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = GENERIC_MESSAGE;
    let extra = {};
    //Z Zod Input validatio erro
    if (err instanceof ZodError) {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        message = "Invalide input data provided";
        extra = {
            errors: err.issues.map((i) => ({
                field: i.path.join("."),
                message: i.message
            })),
        };
    } else if (err instanceof Prisma.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002": // unique constraint: don't reveal which field
                statusCode = 409;
                code = "CONFLICT";
                message = "A record with these details already exists.";
                break;
            case "P2003": // foreign key
                statusCode = 400;
                code = "FOREIGN_KEY_VIOLATION";
                message = "Referenced record does not exist.";
                break;
            case "P2025": // record not found
                statusCode = 404;
                code = "RECORD_NOT_FOUND";
                message = "The requested record could not be found.";
                break;
            default:
                code = "DATABASE_ERROR";
                message = DB_MESSAGE;
        }
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        statusCode = 503;
        code = "SERVER_UNAVAILABLE";
        message = "Service temporarily unavailable. Please try again shortly.";


    } else if (err instanceof Prisma.PrismaClientValidationError ||
        err instanceof Prisma.PrismaClientUnknownRequestError) {
        code = " DATABASE_ERROR";
        message = DB_MESSAGE;
    } else if (err.type === "entity.parse.failed") {
        statusCode = 400;
        code = "INVALID_JSON";
        message = "Request body contains invalid JSON.";

    } else if (err.type === "entity.too.large") {
        statusCode = 413;
        code = "PAYLOAD_TOO_LARGE";
        message = "Request body is too large.";

    } else if (err.statusCode >= 400 && err.statusCode < 500) {
        // Operational errors we threw ourselves (AppError, CORS block, 404...)
        statusCode = err.statusCode;
        code = err.code || "APP_ERROR";
        message = err.message;
    } else if (err.statusCode >= 500) {
        statusCode = err.statusCode;
        code = err.code || "APP_ERROR";
        message = isProduction ? GENERIC_MESSAGE : err.message;
    }


    const logPayload = {
        err: { message: err.message, stack: err.stack, code: err.code, meta: err.meta },
        req: {
            id: req.id,
            method: req.method,
            path: req.originalUrl.split("?")[0], // no query string: it can hold tokens
            ip: req.ip,
            userId: req.user?.sub,
        },

    }

    if (statusCode >= 500) {
        logger.error(logPayload, "Unexpected server error");
    } else {
        logger.warn({ ...logPayload, err: { message: err.message, code } }, "Request failed")
    }
    return res.status(statusCode).json({
        success: false,
        code,
        message,
        ...extra,
        ...(req.id && { requestId: req.id }),
        ...(!isProduction && statusCode >= 500 && { stack: err.stack })
    });
}