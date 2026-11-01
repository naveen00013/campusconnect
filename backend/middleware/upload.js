const multer = require('multer');
const path = require('path');
const File = require('../models/File');

const ALLOWED = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Allowed files: PDF, JPG/PNG, Word, PowerPoint, Excel, TXT, ZIP')),
});

exports.single = (req, res, next) =>
  upload.single('file')(req, res, async (err) => {
    if (err)
      return res.status(400).json({
        message: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (maximum 5 MB)' : err.message,
      });
    try {
      if (req.file) {
        const doc = await File.create({
          name: req.file.originalname,
          mime: req.file.mimetype,
          data: req.file.buffer,
        });
        req.file.filename = String(doc._id);
      }
      next();
    } catch (e) {
      next(e);
    }
  });

exports.remove = (id) => {
  if (id) File.findByIdAndDelete(id).catch(() => {});
};
exports.info = (f) => (f ? { name: f.originalname, file: f.filename } : undefined);