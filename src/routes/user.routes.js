import {Router} from "express"
import { verifyJWt } from "../middleware/auth.js";
import { regiseterstudent , studnetLogin , userProfile , logoutUser} from "../controllers/User.controller.js";



const router = Router();


router.post("/register/student" ,regiseterstudent)
router.post("/login", studnetLogin);
router.post("/logout", logoutUser )
//protected routes 
router.get("/profile", verifyJWt,userProfile)

export default router