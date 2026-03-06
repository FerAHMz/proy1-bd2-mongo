const { ObjectId } = require('mongodb');
const { GridFSBucket } = require('mongodb');
const { getDB } = require('../config/db');
const { Readable } = require('stream');

function getBucket() {
  return new GridFSBucket(getDB(), { bucketName: 'archivos' });
}

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió archivo' });

    const bucket = getBucket();
    const readable = Readable.from(req.file.buffer);
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });

    await new Promise((resolve, reject) => {
      readable.pipe(uploadStream)
        .on('finish', resolve)
        .on('error', reject);
    });

    res.status(201).json({
      fileId: uploadStream.id,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const files = await getDB().collection('archivos.files').find().sort({ uploadDate: -1 }).toArray();
    res.json({ data: files, total: files.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.descargar = async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
    const file = await getDB().collection('archivos.files').findOne({ _id: fileId });
    if (!file) return res.status(404).json({ error: 'Archivo no encontrado' });

    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

    const bucket = getBucket();
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
    const bucket = getBucket();
    await bucket.delete(fileId);
    res.json({ message: 'Archivo eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
