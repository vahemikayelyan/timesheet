import express, { Express } from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import XLSX, { Sheet2JSONOpts } from 'xlsx';
import BodyParser from 'body-parser';

const app: Express = express();
const host = 'http://localhost';
const port = 3000;

// Use it before all route definitions
app.use(cors({ origin: `${host}:4200` }));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

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
app.post('/files', upload.array('files'), (_req, res) => {
  res.json({ message: 'Files uploaded successfully' });
});

app.get('/files', (_req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Unable to access the uploads directory' });
    }

    res.json({ files });
  });
});

app.delete('/files', (req, res) => {
  const fileList: string[] = req.body.files;
  const deletionSummary: { success: string[]; failed: string[] } = {
    success: [],
    failed: [],
  };

  fileList.forEach((fileName) => {
    const filePath = path.join(uploadsDir, fileName);

    // Check if file exists before attempting to delete
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        deletionSummary.success.push(fileName);
      } catch (err) {
        deletionSummary.failed.push(fileName);
      }
    } else {
      deletionSummary.failed.push(fileName);
    }
  });

  res.json(deletionSummary);
});

app.get('/read-excel', (_req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Could not list the directory.', err);

      return res
        .status(500)
        .send('Internal Server Error when reading directory');
    }

    const allData: { name: string; rows: any[] }[] = [];

    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);

      // Make sure the file is an Excel file
      if (filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
        const workbook = XLSX.readFile(filePath, { dateNF: 'mm/dd/yyyy' });
        const sheetNames = workbook.SheetNames;
        const jsonOptions: Sheet2JSONOpts = { raw: false, defval: '' };

        // Assuming you want to read the first sheet only
        const sheetData = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetNames[0]],
          jsonOptions
        );

        allData.push({ name: file, rows: sheetData });
      }
    });

    res.json(allData);
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${host}:${port}`);
});
