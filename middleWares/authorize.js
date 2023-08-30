import User from '../model/user.js'
import jwt from 'jsonwebtoken'

export const isBlocked=(req,res,next)=>{
    try{
        const id = req.decoded.id
;
        User.findOne({_id:id}).then((response)=>{
            if(response.isBlocked){
                console.log("blocked");
                return res.status(400).json({message:"User blocked no actions allowed",userBlocked:true})
            }else{
                console.log("ddddd");
                next();
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(400).json({message:"Ops User not found",error:err})
        })
        next()
    }catch(err){
        return res.status(400).json({message:"JWT SERVER ERROR",error:err})
    }
}