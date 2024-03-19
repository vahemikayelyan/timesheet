"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const xlsx_1 = __importDefault(require("xlsx"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const host = 'http://localhost';
const port = 3000;
// Use it before all route definitions
app.use((0, cors_1.default)({ origin: [`${host}:4200`, 'http://127.0.0.1:4200'] }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Check if uploads directory exists, if not, create it
const folderName = 'uploads';
const uploadsDir = `./${folderName}`;
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, folderName);
    },
    filename: function (_req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
// File upload endpoint
app.post('/files', upload.array('files'), (_req, res) => {
    res.json({ message: 'Files uploaded successfully' });
});
app.get('/files', (_req, res) => {
    fs_1.default.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res
                .status(500)
                .json({ message: 'Unable to access the uploads directory' });
        }
        res.json({ files });
    });
});
app.delete('/files', (req, res) => {
    const fileList = req.body.files;
    const deletionSummary = {
        success: [],
        failed: [],
    };
    fileList.forEach((fileName) => {
        const filePath = path_1.default.join(uploadsDir, fileName);
        // Check if file exists before attempting to delete
        if (fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.unlinkSync(filePath);
                deletionSummary.success.push(fileName);
            }
            catch (err) {
                deletionSummary.failed.push(fileName);
            }
        }
        else {
            deletionSummary.failed.push(fileName);
        }
    });
    res.json(deletionSummary);
});
app.get('/read-excel', (_req, res) => {
    fs_1.default.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Could not list the directory.', err);
            return res
                .status(500)
                .send('Internal Server Error when reading directory');
        }
        const allData = [];
        files.forEach((file) => {
            const filePath = path_1.default.join(uploadsDir, file);
            // Make sure the file is an Excel file
            if (filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
                const workbook = xlsx_1.default.readFile(filePath, { dateNF: 'mm/dd/yyyy' });
                const sheetNames = workbook.SheetNames;
                const jsonOptions = { raw: false, defval: '' };
                // Assuming you want to read the first sheet only
                const sheetData = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetNames[0]], jsonOptions);
                allData.push({ name: file, rows: sheetData });
            }
        });
        res.json(allData);
    });
});
app.listen(port, () => {
    console.log(`Server is running at ${host}:${port}`);
});
