import type { Request, Response, NextFunction } from "express";
import { settingsStorage } from "./settings-storage";

/**
 * Maintenance Mode Middleware
 * Blocks all requests when maintenance mode is enabled
 * Allows admin routes to pass through
 */
export async function maintenanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Always allow admin routes and settings API
    if (
      req.path.startsWith("/api/admin") ||
      req.path === "/api/admin/settings" ||
      req.path.startsWith("/maintenance")
    ) {
      return next();
    }

    // Check if maintenance mode is enabled
    const settings = await settingsStorage.getSettings();
    
    if (settings.maintenanceMode) {
      // Return maintenance page for HTML requests
      if (req.accepts("html")) {
        return res.status(503).send(generateMaintenancePage(settings));
      }
      
      // Return JSON for API requests
      return res.status(503).json({
        error: "Service Unavailable",
        message: settings.maintenanceMessage || "الموقع تحت الصيانة حالياً. سنعود قريباً.",
        maintenanceMode: true,
      });
    }

    next();
  } catch (error) {
    console.error("Maintenance middleware error:", error);
    next();
  }
}

/**
 * Generate maintenance page HTML
 */
function generateMaintenancePage(settings: any): string {
  const message = settings.maintenanceMessage || "الموقع تحت الصيانة حالياً. سنعود قريباً.";
  const siteName = settings.siteNameAr || "U.N.N.T";
  
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>وضع الصيانة - ${siteName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #fff;
    }
    
    .maintenance-container {
      max-width: 600px;
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 60px 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .logo {
      width: 120px;
      height: 120px;
      margin: 0 auto 30px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: bold;
      color: #fff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }
    
    h1 {
      font-size: 42px;
      margin-bottom: 20px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    p {
      font-size: 20px;
      line-height: 1.8;
      margin-bottom: 30px;
      opacity: 0.95;
    }
    
    .message {
      background: rgba(255, 255, 255, 0.15);
      padding: 20px;
      border-radius: 12px;
      margin: 30px 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      margin: 30px auto;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .contact {
      margin-top: 40px;
      font-size: 16px;
      opacity: 0.8;
    }
    
    .contact a {
      color: #fff;
      text-decoration: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.5);
      transition: all 0.3s ease;
    }
    
    .contact a:hover {
      border-bottom-color: #fff;
      opacity: 1;
    }
    
    @media (max-width: 600px) {
      .maintenance-container {
        padding: 40px 20px;
      }
      
      h1 {
        font-size: 32px;
      }
      
      p {
        font-size: 18px;
      }
      
      .logo {
        width: 100px;
        height: 100px;
        font-size: 40px;
      }
    }
  </style>
</head>
<body>
  <div class="maintenance-container">
    <div class="logo">🔧</div>
    
    <h1>وضع الصيانة</h1>
    
    <div class="message">
      <p>${message}</p>
    </div>
    
    <div class="spinner"></div>
    
    <p>نعمل على تحسين الموقع لتقديم تجربة أفضل لكم</p>
    
    <div class="contact">
      <p>للاستفسارات: <a href="mailto:${settings.contactEmail || 'contact@unnt.news'}">${settings.contactEmail || 'contact@unnt.news'}</a></p>
    </div>
  </div>
  
  <script>
    // Auto-refresh every 30 seconds to check if maintenance is over
    setTimeout(function() {
      location.reload();
    }, 30000);
  </script>
</body>
</html>
  `;
}
