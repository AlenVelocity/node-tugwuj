const express = require('express');
const satori = require('satori').default;

// workarounds to use ESM only packages in commonjs file
const html = (...args) =>
  import('satori-html').then(({ html }) => html(...args));
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = 3000;

// Add middleware to parse JSON bodies
app.use(express.json());

const inter = fetch(
  'https://og-playground.vercel.app/inter-latin-ext-400-normal.woff'
).then((res) => res.arrayBuffer());

app.get('/', async (req, res) => {
  // ... (keep the existing GET route as is)
});

// New POST route to accept HTML
app.post('/generate-svg', async (req, res) => {
  try {
    const { htmlContent } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    const markup = await html`${htmlContent}`;
    const svg = await satori(markup, {
      width: 600,
      height: 600,
      fonts: [
        {
          name: 'Inter',
          data: await inter,
          weight: 400,
          style: 'normal',
        },
      ],
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Error generating SVG:', error);
    res.status(500).json({ error: 'Failed to generate SVG' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});