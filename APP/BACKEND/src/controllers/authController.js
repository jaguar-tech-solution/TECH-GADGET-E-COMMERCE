import { success } from "zod";
import * as authService from "../services/authService.js"
import { registerSchema, loginSchema } from "../validators/authValidator.js"

const isProduction = process.env.NODE_ENV === "production";
const TOKEN_MAX_AGE_MS = 15 * 60 * 1000;

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
}
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}
export const register = asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const user = await authService.registerUser(input)

    res.status(201).json({
        success: true,
        message: "Account registered successfully.",
        data: user,
    });
})
export const login = asyncHandler(async(req, res)=>{
    const credentials = loginSchema.parse(req.body);
    const {token, user} = await authService.loginUser(credentials)

    res.set("Cache-Control", "no-store");
    res.cookie("token", token, {...cookieOptions, maxAge: TOKEN_MAX_AGE_MS});
    //Token only in the cookie for browser clients
    res.json({
        success:true,
        message:"Login Successful."
    })
})
export const logout = asyncHandler(async(req,res) =>{

    res.clearCookie("token", cookieOptions);
    res.json({
        success:true,
        message:"Logged Out"
    })
})

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.sub); // fresh, safe projection
  res.set("Cache-Control", "no-store");
  res.json({ success: true, data: user });
});
