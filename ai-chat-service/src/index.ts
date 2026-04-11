import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { createLogger } from "./utils/logger";
import aiChatRoutes from "./routes/aiChatRoutes";

dotenv.config();

const app = express();
const logger = createLogger('index');
const httpServer = http.createServer(app);
const PORT = Number(process.env.PORT) || 3006;

app.use(cors());
app.use(express.json());
app.use(aiChatRoutes);

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.send('AI Chat Service is running');
});

httpServer.listen(PORT, '0.0.0.0', async () => {
  logger.info(`AI Chat service listening on port ${PORT}`);
});
