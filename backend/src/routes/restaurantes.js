const { Router } = require('express');
const router = Router();
const pagination = require('../middleware/pagination');
const ctrl = require('../controllers/restaurantes.controller');

router.get('/', pagination, ctrl.listar);
router.get('/cercanos', ctrl.cercanos);
router.get('/:id', ctrl.obtenerUno);
router.post('/', ctrl.crear);
router.post('/muchos', ctrl.crearMuchos);
router.put('/activar-muchos', ctrl.activarMuchos);
router.put('/:id', ctrl.actualizar);
router.delete('/eliminar-muchos', ctrl.eliminarMuchos);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
