const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const connectDB = require('./db.js');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
const userRoutes = require("./Routes/userRoutes.js");
const facebookRoutes = require("./Routes/facebookRoutes.js");
const postRoutes = require("./Routes/postRoutes.js");
const threadRoutes = require("./Routes/threadRoutes.js");
const LinkedinRoutes = require("./Routes/LinkedinRoutes.js");
const multiPlatformRoutes = require("./Routes/multiPlatformRoutes.js");
const dashboardRoutes = require("./Routes/dashboardRoutes.js");
const aiRoutes = require("./Routes/aiRoutes.js");

const app = express();

// Production middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for production
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://your-frontend-domain.com",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Connect to database
connectDB();

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', facebookRoutes);
app.use('/api', userRoutes);
app.use("/api", LinkedinRoutes);
app.use("/api", postRoutes);
app.use("/api", threadRoutes);
app.use("/api", multiPlatformRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Reach-Way Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build (if deploying together)
if (process.env.SERVE_FRONTEND === 'true') {
  app.use(express.static(path.join(__dirname, '../FE/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../FE/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Reach-Way Backend running in ${process.env.NODE_ENV || 'production'} mode`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
