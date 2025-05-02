import type { Request, Response, NextFunction } from "express"
import os from "os"
import ServerHealth from "../models/ServerHealth"

// Track request counts and errors
let requestCount = 0
let errorCount = 0

// Reset counters every minute
setInterval(() => {
  requestCount = 0
  errorCount = 0
}, 60000)

// Middleware to track requests
export const trackRequest = (req: Request, res: Response, next: NextFunction) => {
  requestCount++

  // Track errors
  const originalSend = res.send
  res.send = function (body) {
    const statusCode = res.statusCode
    if (statusCode >= 400) {
      errorCount++
    }
    return originalSend.call(this, body)
  }
  next()
}

// Function to record server health metrics
export const recordServerHealth = async () => {
  try {
    const cpuUsage = os.loadavg()[0] / os.cpus().length // Normalize by CPU count
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const memoryUsage = (totalMemory - freeMemory) / totalMemory

    await ServerHealth.create({
      cpu: cpuUsage,
      memory: memoryUsage,
      requests: requestCount,
      errors: errorCount,
    })
  } catch (error) {
    console.error("Error recording server health:", error)
  }
}

// Schedule health recording every minute
export const startHealthMonitoring = () => {
  setInterval(recordServerHealth, 60000) // Every minute
}
