import { app } from "./app";
import connectDB from "./db";

connectDB()
.then(()=>{
    app.on("error", (error)=>{
        console.log(`App connection error: ${error}`)
        throw error;
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log(`MONGODB connection failed: `, error);
})