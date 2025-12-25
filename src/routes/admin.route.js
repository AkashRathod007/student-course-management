import { Router } from "express";
import {studentwithcoursedetails , getStudentsByCourse , updateStudentDeatils , adminRegisteration , loginadmin} from "../controllers/admin.controller.js"

const router = Router();



//Admin routes 
router.post("/register" , adminRegisteration)
router.post("/login" , loginadmin)
router.get("/students" ,studentwithcoursedetails)
router.post("/subjet/:id" , getStudentsByCourse);
router.patch('/students/:id' , updateStudentDeatils)
export default router