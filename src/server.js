import app from "./app.js"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"

dotenv.config()
connectDB();



app.get("/" ,(req ,res)=>{
    res.send("Welcome to home page")
})



app.listen(process.env.PORT , ()=>{
    console.log(`Server is running on the port ${process.env.PORT}`)
})

