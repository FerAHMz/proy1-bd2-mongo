const { Router } = require('express');
const router = Router();
const multer = require('multer');
const ctrl = require('../controllers/archivos.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 16 * 1024 * 1024 } });

router.post('/upload', upload.single('archivo'), ctrl.upload);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.descargar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
