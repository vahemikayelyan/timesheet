import express, { Express } from 'express';
import XLSX from 'xlsx';
import BodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app: Express = express();
const host = 'http://localhost';
const port = 3000;

// Use it before all route definitions
app.use(cors({ origin: [`${host}:4200`, 'http://127.0.0.1:4200'] }));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

const STATIC_FILES = path.join(__dirname, '../browser');
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

function getEmployeeList() {
  const empWorkbook = XLSX.readFile(
    __dirname + '../../../src/assets/employee_list.xls'
  );
  const empSheet = empWorkbook.Sheets[empWorkbook.SheetNames[0]];
  const headers: string[][] = XLSX.utils.sheet_to_json(empSheet, {
    header: 1,
  });

  const employees: any[] = XLSX.utils.sheet_to_json(empSheet, {
    header: headers[0].map((h) => h.split(' ').join('_')),
    raw: false,
    defval: '',
  });

  return employees;
}

// File upload endpoint
app.post('/api/files', upload.array('files'), (_req, res) => {
  res.json({ message: 'Files uploaded successfully' });
});

app.get('/api/files', (_req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Unable to access the uploads directory' });
    }

    res.json({ files });
  });
});

app.delete('/api/files', (req, res) => {
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

app.get('/api/read-excel', (_req, res) => {
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

        // Assuming you want to read the first sheet only
        const sheetData = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetNames[0]],
          { raw: false, defval: '' }
        );

        allData.push({ name: file, rows: sheetData });
      }
    });

    const employees = getEmployeeList();

    res.json({ data: allData, employees });
  });
});

app.use(express.static(STATIC_FILES));

app.get('*', (_req, res) => {
  res.sendFile(path.join(STATIC_FILES, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at ${host}:${port}`);
});
