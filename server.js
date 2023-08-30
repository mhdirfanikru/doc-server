import express from "express";
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import dotenv from 'dotenv'
import dbConnection from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import messageRoutes from './routes/messageRoutes.js'


const app=express();
dotenv.config();


app.use(cors());


app.use(morgan("dev"))
app.use(bodyParser.json());

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))

app.use('/api',userRoutes)
app.use('/api/doc',doctorRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/payment',paymentRoutes)
app.use('/api/conversation',conversationRoutes)
app.use('/api/message',messageRoutes)

app.get('*',(req,res)=>{
    res.status(404).send("PAGE NOT FOUND")
})


dbConnection().then(()=>{
    app.listen(process.env.PORT,()=>console.log(`SERVER STARTED AT PORT:${process.env.PORT}`))
})