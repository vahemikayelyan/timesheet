import express, { Express } from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

const app: Express = express();
const host = 'http://localhost';
const port = 3000;

// Use it before all route definitions
app.use(cors({ origin: `${host}:4200` }));

// Check if uploads directory exists, if not, create it
const folderName = 'uploads';
const uploadsDir = `./${folderName}`;

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, folderName);
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// File upload endpoint
app.post('/upload', upload.array('files'), (_req, res) => {
  res.json({ message: 'Files uploaded successfully' });
});

app.get('/files', (_req, res) => {
  const uploadsDirectory = `./${folderName}`;

  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Unable to access the uploads directory' });
    }

    res.json({ files });
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${host}:${port}`);
});
