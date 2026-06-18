import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Роздаємо статичні файли з папки dist
app.use(express.static(path.join(__dirname, 'dist')));

// Всі запити направляємо на index.html (для SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запускаємо сервер
app.listen(PORT, () => {
  console.log(`✅ Deep Carbon Mining server running on port ${PORT}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
});
