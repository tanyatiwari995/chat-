import { connect } from "mongoose";

const connectToMongoDB = async (connectString) => {
  try {
    const { connection } = await connect(connectString);
    console.log(`\nDatabase Connection Host : ${connection.host}`);
    return connection.readyState;
  } catch (error) {
    console.log(`Database Connection Error : ${error.message}`);
    return null;
  }
};

export default connectToMongoDB;
