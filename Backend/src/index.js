import dotenv from 'dotenv';
dotenv.config({
    path:"./.env"
})
import connectDB from './DB/index.js';
import {app} from './app.js';

const port = process.env.PORT || 3000;

console.log(process.env.MONGODB_URI)
connectDB()
.then(() => {
    app.listen(port,() => {
        console.log(`Server is running on port : http://localhost;${port}`)
    })
}).catch((err) =>{
    console.log("Mongodb connection failed : ",err);
})