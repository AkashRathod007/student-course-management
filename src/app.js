import express from "express"
import cors from "cors"
import userRoutes from './routes/user.routes.js'
import cookieParser from "cookie-parser"



const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(cookieParser())



//User route 
app.use("/api/v1" , userRoutes)

//protected routes 

//admin routes
import adminRoutes from "./routes/admin.route.js" 
app.use("/api/v1/admin" ,adminRoutes)


export default app