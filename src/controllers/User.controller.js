import ApiResponse from "../utils/ApiResponse.js";
import asyncHanlder from "../utils/asyncHandler.js";
import { pool } from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"



function generateTokens(user){
   const accesstoken = jwt.sign({
    id : user.id,
    email:user.email
   },
   process.env.ACCESS_TOKEN_SECRET,
   {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
   }
);

const refreshToken = jwt.sign({
    id:user.id,
    email:user.email
} ,
process.env.REFRESH_TOKEN_SECRET,
{

    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
}
)

return {accesstoken , refreshToken}

}


export const regiseterstudent = asyncHanlder(async (req, res) => {
  const {first_name , last_name , email, password , course_id } = req.body;
  if (!first_name || !last_name){
         throw new ApiError(401, "First name and Last name are required");
  } 
  if(!password || !email) {
    throw new ApiError(401, "Password and username and email  are required");
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const Query = `INSERT INTO students (first_name ,last_name,email, password ,course_id) VALUES($1, $2,$3 ,$4,$5)`;
  const user = await pool.query(Query, [first_name , last_name,email,hashPassword , course_id]);

  res.status(200).json(new ApiResponse(201, user, "Student is registerd"));
});


export const  studnetLogin = asyncHanlder(async(req, res)=>{

    const {email , password} = req.body;

    if(!email || !password){
        throw new ApiError(401 , "Please provide the username and password")
    }

    const Query = "SELECT * FROM students WHERE email = $1";
    

    const {rows} = await pool.query(Query ,[email])
    console.log(rows)

    const user = rows[0];

    if(!user){
        throw new ApiError(401, "bad request");
    }

    const isMatch = await bcrypt.compare(password , user.password);
   

    if(!isMatch){
        throw new ApiError(404 , "Wrong password please enter correct password")
    }

    // remove the password from response 

    const {accesstoken, refreshToken} = generateTokens(user)

    delete user.password
    
    res.cookie("accesstoken" , accesstoken,{
         httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 min
    })
    .cookie('refreshToken',refreshToken , {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .json(new ApiResponse(200, user, "user is logged in and jwt cookies are set "));

})


export const userProfile = asyncHanlder(async(req ,res)=>{

    res.send("welcome to profile page ")
})

export const  logoutUser = asyncHanlder(async(req ,res)=>{
      res.clearCookie("accesstoken" , {
         httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
   
    })
    .clearCookie("refreshToken" ,{
         httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      
    }).status(200).json(
        new ApiResponse(200, "","user logged our successfully")
    )
})


