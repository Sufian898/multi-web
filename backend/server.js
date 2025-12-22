import connectDB from './config/database.js';
import app from './serverApp.js';

const PORT = process.env.PORT || 5000;

// Connect and start only for local/server hosting (not used by Vercel serverless)
connectDB()
  .then(() => {
app.listen(PORT, () => {
      // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', e);
    process.exit(1);
});

