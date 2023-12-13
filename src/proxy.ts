import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

const backendProxy = createProxyMiddleware('/api', {
  target: process.env.BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
});

const frontendProxy = createProxyMiddleware('/', {
  target: process.env.FRONTEND_URL,
  changeOrigin: true,
});

app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

app.use('/api', backendProxy);
app.use('/', frontendProxy);

app.use((req, res, next) => {
  res.on('close', () => {
    console.log(`Respuesta enviada: ${res.statusCode}`);
  });
  next();
});


const port = process.env.PROXY_PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor de reenvío iniciado en http://localhost:${port}`);
});