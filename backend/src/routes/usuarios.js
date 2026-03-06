const { Router } = require('express');
const router = Router();
const pagination = require('../middleware/pagination');
const ctrl = require('../controllers/usuarios.controller');

router.get('/', pagination, ctrl.listar);
router.get('/:id', ctrl.obtenerUno);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
