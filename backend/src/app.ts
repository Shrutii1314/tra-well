import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import './config/redis';

// Load environment variables immediately
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import your routers
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import reviewRouter from './routes/reviewRoutes';
import bookingRouter from './routes/bookingRoutes';

const app = express();

// 1️⃣ GLOBAL SECURITY MIDDLEWARE
// A. Enable CORS (Cross-Origin Resource Sharing) for future frontend connections
app.use(cors());

// B. Set secure HTTP headers via Helmet
app.use(helmet());

// C. Rate Limiting: Limit requests from the same IP address
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowPeriod
  windowMs: 60 * 60 * 1000, // 1 Hour window period
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); // Apply the rate limiter only to routes starting with /api

// D. Body parser: Reading data from body into req.body, limiting payload size to 10kb
app.use(express.json({ limit: '10kb' }));

// E. Data sanitization against NoSQL query injection (Express 5 Compatible)
app.use((req, res, next) => {
  const clean = (obj: any) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        // If a key starts with $ (like $gt) or contains a dot, delete it to prevent injection
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          clean(obj[key]); // Recursively clean nested objects
        }
      }
    }
  };

  // Sanitize all incoming request components safely
  if (req.body) clean(req.body);
  if (req.params) clean(req.params);
  if (req.query) clean(req.query);

  next();
});

// 2️⃣ MOUNT ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// 3️⃣ FALLBACK ROUTE
app.all(/(.*)/, (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// 4️⃣ CONNECT TO DATABASE & START SERVER
const PORT = process.env.PORT || 5000;

// Read directly from MONGO_URI in your .env file
const DB = process.env.MONGO_URI || process.env.DATABASE || 'mongodb://localhost:27017/tra-well';

mongoose
  .connect(DB)
  .then((conn) => {
    console.log(`📦 Database connection successful! Host: ${conn.connection.host} | DB Name: ${conn.connection.name}`);

    // Only start listening to network traffic once the database is safely connected
    app.listen(PORT, () => {
      console.log(`🚀 Security-locked server is running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error('❌ DATABASE CONNECTION ERROR:', err.message);
  });

export default app;