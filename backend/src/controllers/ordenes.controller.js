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

// TRANSACCIÓN 4: Pagar con puntos
exports.pagarConPuntos = async (req, res) => {
  const session = getClient().startSession();
  try {
    let insertedId;
    await session.withTransaction(async () => {
      const { clienteId, restauranteId, items, totalPuntos } = req.body;
      const cid = new ObjectId(clienteId);

      const cliente = await getDB().collection('clientes').findOne({ _id: cid }, { session });
      if (!cliente) throw new Error('Cliente no encontrado');
      if (cliente.puntosFidelidad < totalPuntos) throw new Error('Puntos insuficientes');

      const orden = {
        clienteId: cid,
        restauranteId: new ObjectId(restauranteId),
        items: items.map(it => ({ ...it, menuId: new ObjectId(it.menuId) })),
        total: 0,
        metodoPago: 'puntos',
        puntosUsados: totalPuntos,
        estado: 'pendiente',
        fechaCreacion: new Date()
      };

      const result = await col().insertOne(orden, { session });
      insertedId = result.insertedId;

      await getDB().collection('clientes').updateOne(
        { _id: cid },
        { $inc: { puntosFidelidad: -totalPuntos } },
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
