const express = require("express")
const cors = require("cors")
const dotenv = require('dotenv')
const connectDB = require('./db.js')
const userRoutes = require("./Routes/userRoutes.js");
const facebookRoutes = require("./Routes/facebookRoutes.js");
const postRoutes = require("./Routes/postRoutes.js");
const threadRoutes = require("./Routes/threadRoutes.js");
const LinkedinRoutes = require("./Routes/LinkedinRoutes.js");
const { default: axios } = require("axios");
const app = express();
dotenv.config();
app.use(express.json());
connectDB();

  app.use(cors({
    origin: "*", // Allow all origins (replace '*' with specific origins if needed)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  }));
  app.use('/uploads', express.static(`${__dirname}/uploads`));
app.use('/api', facebookRoutes);
app.use('/api', userRoutes);
app.use("/api", LinkedinRoutes);

app.use("/api", postRoutes);
app.use("/api", threadRoutes);
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));