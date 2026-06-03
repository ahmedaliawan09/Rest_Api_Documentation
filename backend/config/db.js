import mongoose from "mongoose";

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.mongo_URI);
        console.log("mongodb connected successfully")
    }
    catch (error) {
        console.error("mongodb not connected", error.message);
        process.exit(1);
    }


}
export default connectdb;