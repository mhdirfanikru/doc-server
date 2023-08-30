import express from 'express'
import { adminVerification } from '../middleWares/adminAuth.js';
import { adminLogin, getAllUsers, getAllDoctors, blockUser,dashboard, unBlockUser, verifyDoctor, doctorsRequest, getDoctor, removeDoctor, appointments } from '../controller/adminController.js';


const router=express.Router();

router.post("/login",adminLogin);

router.get("/allUsers",adminVerification,getAllUsers);

router.get("/allDoctors",adminVerification,getAllDoctors);

router.get("/getDoctor/:id",adminVerification,getDoctor)

router.get("/blockUser/:id",blockUser);

router.put("/unBlockUser/:id",unBlockUser);

router.put("/verifyDoctor",verifyDoctor);

router.put("/rejectDoctor/:id",removeDoctor)

router.get("/doctorsRequest",adminVerification,doctorsRequest)

router.get("/appointment",adminVerification,appointments)

router.get("/dashboard",adminVerification,dashboard)



export default router;