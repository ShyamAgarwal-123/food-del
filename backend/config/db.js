import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://greatstack:9935521297@cluster0.bmts8ke.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}