import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pkg from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
const {Prisma} = pkg;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("FATAL CONFIGURATION ERROR: JWT_SECRET missing or too short (min 32 chars)");
}

const JWT_EXPIRES_IN = "3d";
const BCRYPT_ROUNDS = 12;


const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_ROUNDS);

//design the email to lowerCase
const normalizeEmail = (email) => email.trim().toLowerCase();

export const registerUser = async ({ firstName, lastName, email, phone, password }) => {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
        return await prisma.user.create({ // creating user during registration
            data: {
                firstName,
                lastName,
                email: normalizeEmail(email),
                phone,
                passwordHash,
                userRoles: {
                    create: { role: { connectOrCreate:{
                        where: { name: "CUSTOMER" } ,
                        create : {name: "CUSTOMER"}
                    }} },
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
                createdAt: true,
            },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                throw new AppError("There is a unique constraint violation, a new user cannot be created with this email", 409, "CONFLICT");
            }
            if (err.code === "P2025") {
                throw new AppError("An operation failed because it depends on one or more records that were required but not found. ", 500, "CONFIGURATION_ERROR");
            }
        }
        throw err;
    }
};

export const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email: normalizeEmail(email) },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: { rolePermissions: { include: { permission: true } } },
                    },
                },
            },
        },
    });
        console.log("This is the user ", user)
    // Always run one bcrypt compare so timing is the same for unknown emails
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash ?? DUMMY_HASH);
     
    if (!user || !isPasswordValid) {
        throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    if (user.status !== "ACTIVE") { 
        throw new AppError(`This account is ${user.status === "ACTIVE" ? "": `${user.status}`} .`, 403, `ACCOUNT_${user.status}`);
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
        ...new Set(
            user.userRoles.flatMap((ur) =>
                ur.role.rolePermissions.map((rp) => rp.permission.key)
            )
        ),
    ];

    const token = jwt.sign({ email: user.email, roles, permissions }, JWT_SECRET, {
        subject: String(user.id), // readable as req.user.sub
        expiresIn: JWT_EXPIRES_IN,
        algorithm: "HS256",
    });

    return {
        token,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roles,
            permissions,
        },
    };
};

// Used by getMe in the controller
export const getUserById = (id) =>
    prisma.user.findUnique({
        where: { id },
        select: { id: true, firstName: true, lastName: true, email: true, status: true },
    });