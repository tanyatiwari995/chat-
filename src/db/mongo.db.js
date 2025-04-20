import { connect } from "mongoose";

const connectToMongoDB = async (connectString) => {
    try {
        const instance = await connect(connectString)
        console.log(`\nDatabase Connection Host : ${instance.connection.host}`)
    } catch (error) {
        console.log(`Database Connection Error : ${error.message}`);
        process.exit(1)
    }
}
// import mongoose from "mongoose";

// // Function to connect to MongoDB
// const connectToMongoDB = async (connectString) => {
//     try {
//         // Establish connection to MongoDB
//         const instance = await mongoose.connect(connectString, {
//             // Options (optional in the latest mongoose versions)
//             // useNewUrlParser: true, // Deprecated
//             // useUnifiedTopology: true, // Deprecated
//         });
        
//         // Log the successful connection
//         console.log(`Connected to MongoDB at: ${instance.connection.host}`);
//     } catch (error) {
//         // Catch and log any connection errors
//         console.error(`Error connecting to MongoDB: ${error.message}`);
//         process.exit(1); // Exit the application if connection fails
//     }
// };

// export default connectToMongoDB;

export default connectToMongoDB;