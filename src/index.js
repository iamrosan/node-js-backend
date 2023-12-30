import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Server Connected to PORT : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB CONNECTION FAILED");
  });

/*
import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (error) => {
      console.log(`ERROR: ${error}`);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`listening on PORT: ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
})();
*/
