import jwt from "jsonwebtoken";
import asyncHanlder from "../utils/asyncHandler.js";
import { pool } from "../config/db.js";
import ApiError from "../utils/ApiError.js";

export const verifyJWt = asyncHanlder(async (req, res, next) => {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(404, "Unauthorized access");
    }
    const decodedToken = await jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );
   const Query = `
    SELECT id, username,email,role
    FROM users
    WHERE id = $1
  `;
    const { rows } = await pool.query(Query, [decodedToken.id]);
    const user = rows[0];

    if(!user){
         throw new ApiError(404 , "Invalid access token")
    }
    req.user = user;
    next()
  } catch (error) {
     throw new ApiError(401, error?.message|| "Invalid")
  }
});
