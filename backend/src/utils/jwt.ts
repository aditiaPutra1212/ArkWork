import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) throw new Error("JWT_SECRET tidak ada di .env");
if (SECRET.length < 32) throw new Error("JWT_RESET_SECRET harus diset dan minimal 32 karakter");

export type JWTPayload = { uid: string };

export const signToken = (p: JWTPayload) => jwt.sign(p, SECRET, { expiresIn: "7d" });
export const verifyToken = (t: string) => jwt.verify(t, SECRET) as JWTPayload;