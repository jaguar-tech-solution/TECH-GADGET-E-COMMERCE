import {Router} from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/authController.js"
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { registerSchema,loginSchema } from "../validators/authValidator.js";
import { success } from "zod";

const router = Router()

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders:false,
    message:{
        success:false,
        code:"TOO_MANY_REQUESRS",
        message:"Too many login attempts"
    }
});

const registerLimit = rateLimit({
    windowMs:60 * 60 * 1000,
    limit: 5,
    standardHeaders:true,
    legacyHeaders:false,
      message:{
        success:false,
        code:"TOO_MANY_REQUESRS",
        message:"Too many registration attempts"
    }
});

//prevent caching authentication response
 router.use((req, res, next)=>{
    res.set("Cache-Control", "no-store");
    next();
 });

 router.post("/register", registerLimit, validate(registerSchema), authController.register)
 router.post("/login", loginLimiter, validate(loginSchema), authController.login);
 router.post("logout", authController.logout)
 router.post("/me", authenticate, authController.getMe)

 export default router