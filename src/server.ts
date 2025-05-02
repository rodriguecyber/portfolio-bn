import express, { Request, Response } from "express" 
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import hpp from "hpp"
import path from "path"
import connectDB from "./config/database"
import { errorHandler, notFound } from "./utils/errorHandler"
import { trackRequest, startHealthMonitoring } from "./middleware/monitor"
import UploadSingle from 'rod-fileupload'
// Import routes
import authRoutes from "./routes/auth"
import blogRoutes from "./routes/blog"
import projectRoutes from "./routes/project"
import commentRoutes from "./routes/comment"
import likeRoutes from "./routes/like"
import contactRoutes from "./routes/contact"
import subscriberRoutes from "./routes/subscriber"
import dashboardRoutes from "./routes/dashboard"
import { cloudinaryConfig } from "./utils/cloudinary"

// Load env vars
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Request tracking
app.use(trackRequest)

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Security headers
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Prevent NoSQL injection
// app.use(mongoSanitize())

// Prevent parameter pollution
app.use(hpp())

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", 
    credentials: true,
  }),
)

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// Mount routes
app.use("/api/auth", authRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/contacts", contactRoutes)
app.use("/api/subscribers", subscriberRoutes)
app.use("/api/dashboard", dashboardRoutes) 
app.use("/api/upload",UploadSingle('image',cloudinaryConfig), (req:Request,res:Response)=>{
res.status(200).json({url:req.body.image.url})
}) 

// Error handling
app.use(notFound)
app.use(errorHandler) 

// Start server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)

  // Start health monitoring
  startHealthMonitoring()
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})
