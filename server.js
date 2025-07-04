const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth");
const cors = require('cors')
const postRoutes = require("./src/routes/post");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Use routes
app.use("/api/auth", authRoutes.router);
app.use("/api/posts", postRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
