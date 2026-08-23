import express from "express";
import path from "path";
import cors from "cors";
import os from "os";
import qrcode from "qrcode-terminal";
import { createServer as createViteServer } from "vite";

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Match Finish endpoint - Stubbed out since we removed database
  app.post("/api/matches/:matchId/finish", async (req, res) => {
    res.json({ success: true, message: "Stubbed - Backend removed" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const localIp = getLocalIp();
    const networkUrl = `http://${localIp}:${PORT}`;

    console.log(`\n🚀 PickMyBall server is running!`);
    console.log(`💻 Local URL:   http://localhost:${PORT}`);
    console.log(`📡 Network URL: ${networkUrl}\n`);
    console.log(`📲 Scan this QR code with your phone camera to open on mobile:\n`);

    qrcode.generate(networkUrl, { small: true });
  });
}

startServer();

