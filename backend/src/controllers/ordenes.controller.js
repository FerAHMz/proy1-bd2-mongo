const { ObjectId } = require('mongodb');
const { getDB, getClient } = require('../config/db');

const col = () => getDB().collection('ordenes');

exports.listar = async (req, res) => {
  try {
    const { skip, limit, sort } = req.pagination;
    const filter = {};
    if (req.query.estado) filter.estado = req.query.estado;
    if (req.query.clienteId) filter.clienteId = new ObjectId(req.query.clienteId);
    if (req.query.restauranteId) filter.restauranteId = new ObjectId(req.query.restauranteId);
    if (req.query.metodoPago) filter.metodoPago = req.query.metodoPago;

    const projection = {};
    if (req.query.fields) {
      for (const f of req.query.fields.split(',')) projection[f.trim()] = 1;
    }

    const [docs, total] = await Promise.all([
      col().find(filter, { projection }).sort(Object.keys(sort).length ? sort : { fechaCreacion: -1 }).skip(skip).limit(limit).toArray(),
      col().countDocuments(filter)
    ]);
    res.json({ data: docs, total, skip, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerUno = async (req, res) => {
  try {
    const doc = await col().findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'No encontrado' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.detalle = async (req, res) => {
  try {
    const pipeline = [
      { $match: { _id: new ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'clientes',
          localField: 'clienteId',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      { $unwind: { path: '$cliente', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'restaurante',
          localField: 'restauranteId',
          foreignField: '_id',
          as: 'restaurante'
        }
      },
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } }
    ];
    const docs = await col().aggregate(pipeline).toArray();
    if (!docs.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(docs[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TRANSACCIÓN 1: Crear orden + sumar puntos de fidelidad
exports.crear = async (req, res) => {
  const session = getClient().startSession();
  try {
    let insertedId;
    await session.withTransaction(async () => {
      const orden = {
        ...req.body,
        clienteId: new ObjectId(req.body.clienteId),
        restauranteId: new ObjectId(req.body.restauranteId),
        items: req.body.items.map(it => ({ ...it, menuId: new ObjectId(it.menuId) })),
        estado: req.body.estado || 'pendiente',
        fechaCreacion: new Date()
      };
      const result = await col().insertOne(orden, { session });
      insertedId = result.insertedId;

      const puntosGanados = Math.floor(orden.total / 10);
      await getDB().collection('clientes').updateOne(
        { _id: orden.clienteId },
        { $inc: { puntosFidelidad: puntosGanados } },
        { session }
      );
    });
    res.status(201).json({ insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.endSession();
  }
};

// TRANSACCIÓN 4: Pagar con puntos (orden existente)
exports.pagarConPuntos = async (req, res) => {
  const session = getClient().startSession();
  try {
    let puntosRequeridos = 0;
    await session.withTransaction(async () => {
      const { ordenId } = req.body;
      
      if (!ordenId) throw new Error('Debe especificar ordenId');
      
      const oid = new ObjectId(ordenId);

      // Obtener la orden
      const orden = await col().findOne({ _id: oid }, { session });
      if (!orden) throw new Error('Orden no encontrada');
      
      // Verificar que la orden no esté ya pagada con puntos
      if (orden.metodoPago === 'puntos') {
        throw new Error('Esta orden ya fue pagada con puntos');
      }

      // Calcular puntos requeridos basándose en el precioPuntos de cada producto
      puntosRequeridos = 0;
      for (const item of orden.items) {
        const menuItem = await getDB().collection('menu').findOne({ _id: item.menuId }, { session });
        if (!menuItem || !menuItem.precioPuntos) {
          throw new Error(`El producto "${item.nombreProducto}" no tiene precio en puntos configurado`);
        }
        puntosRequeridos += menuItem.precioPuntos * item.cantidad;
      }

      // Obtener el cliente
      const cliente = await getDB().collection('clientes').findOne({ _id: orden.clienteId }, { session });
      if (!cliente) throw new Error('Cliente no encontrado');
      
      // Verificar puntos suficientes
      if (cliente.puntosFidelidad < puntosRequeridos) {
        throw new Error(`Puntos insuficientes. El cliente tiene ${cliente.puntosFidelidad} puntos y se necesitan ${puntosRequeridos}`);
      }

      // Actualizar la orden para marcarla como pagada con puntos
      await col().updateOne(
        { _id: oid },
        { 
          $set: { 
            metodoPago: 'puntos',
            puntosUsados: puntosRequeridos,
            estado: 'preparando',
            fechaPagoPuntos: new Date()
          } 
        },
        { session }
      );

      // Descontar puntos del cliente
      await getDB().collection('clientes').updateOne(
        { _id: orden.clienteId },
        { $inc: { puntosFidelidad: -puntosRequeridos } },
        { session }
      );
    });
    res.status(200).json({ message: 'Orden pagada con puntos exitosamente', puntosUsados: puntosRequeridos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.endSession();
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const result = await col().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { estado: req.body.estado } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizarEstadoMuchos = async (req, res) => {
  try {
    const { ids, estadoActual, estadoNuevo } = req.body;
    const filter = ids
      ? { _id: { $in: ids.map(id => new ObjectId(id)) } }
      : { estado: estadoActual };
    const result = await col().updateMany(filter, { $set: { estado: estadoNuevo } });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const result = await col().deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminarMuchos = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: 'ids requeridos' });
    const result = await col().deleteMany({ _id: { $in: ids.map(id => new ObjectId(id)) } });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
