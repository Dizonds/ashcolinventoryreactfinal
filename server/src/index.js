import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { initializeDatabase } from "./setup.js";

mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ashcol_inventory",
    { autoIndex: false },
  )
  .then(initializeDatabase)
  .then(() =>
    app.listen(process.env.PORT || 3001, () =>
      console.log("Inventory API ready"),
    ),
  )
  .catch((error) => {
    console.error("Startup failed:", error.message);
    process.exitCode = 1;
    mongoose.disconnect();
  });
