import express from "express";
import { registerUser, userLogin, userDetails,getTime, updateDetails, session, updatePassword, updateProfileImage, otpLogin,availability, allDoctors, getDoctor, bookSession, appointment, activeSession} from "../controller/userController.js";
import upload from "../utils/multer.js";
import { verifyToken } from "../middleWares/userAuth.js";
import { isBlocked } from "../middleWares/authorize.js";
const router = express.Router();




router.post("/signup", registerUser);

router.post("/login",userLogin);

router.get('/otpLogin/:id',otpLogin);

router.get("/details/:id",userDetails)

router.put("/updateDetails/:id",updateDetails)

router.put("/updatePassword/:id",updatePassword);

router.put("/updateUserImage/:id",upload.single('image'),updateProfileImage);

router.get("/allDoctors",allDoctors)

router.get("/getDoctor/:id",verifyToken,getDoctor)

router.post('/book_session',bookSession);

router.post('/appointment',appointment);

router.post('/availability',availability);

router.get("/getSession/:id",session);

router.get("/getActiveSession/:id",activeSession);

router.post("/getTime", getTime);


export default router;
