import mongoose from "mongoose";

const connectDb = async () => {
  const connection = await mongoose
    .connect('mongodb+srv://mhdirfanpn:lANkmWhhRk6X9hF6@cluster0.ov3ni04.mongodb.net/quickdoc', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DATABASE CONNECTED");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default connectDb;
