import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Initialize MinIO
async function initializeMinIO() {
  try {
    console.log('🔧 Initializing MinIO...');
    const { initializeMinIO } = await import('./src/lib/initMinIO');
    await initializeMinIO();
    console.log('✅ MinIO initialized successfully');
  } catch (error) {
    console.warn('⚠️ MinIO initialization failed (this is OK if MinIO is not running):', error.message);
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Initialize MinIO
  await initializeMinIO();
  
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
