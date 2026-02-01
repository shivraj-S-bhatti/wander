import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { connectDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', routes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
