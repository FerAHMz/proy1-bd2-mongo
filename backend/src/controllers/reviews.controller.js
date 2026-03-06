const { ObjectId } = require('mongodb');
const { getDB, getClient } = require('../config/db');

const col = () => getDB().collection('reviews');

exports.listar = async (req, res) => {
  try {
    const { skip, limit, sort } = req.pagination;
    const filter = {};
    if (req.query.estrellas) filter.estrellas = parseInt(req.query.estrellas);
    if (req.query.minEstrellas) filter.estrellas = { ...filter.estrellas, $gte: parseInt(req.query.minEstrellas) };
    if (req.query.restauranteId) filter.restauranteId = new ObjectId(req.query.restauranteId);
    if (req.query.clienteId) filter.clienteId = new ObjectId(req.query.clienteId);

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

exports.buscar = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q es requerido' });
    const { skip, limit, sort } = req.pagination;
    const filter = { $text: { $search: q } };

    const projection = { score: { $meta: 'textScore' } };
    if (req.query.fields) {
      for (const f of req.query.fields.split(',')) projection[f.trim()] = 1;
    }

    const defaultSort = Object.keys(sort).length ? sort : { score: { $meta: 'textScore' } };

    const [docs, total] = await Promise.all([
      col().find(filter, { projection }).sort(defaultSort).skip(skip).limit(limit).toArray(),
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
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'ordenes',
          localField: 'ordenId',
          foreignField: '_id',
          as: 'orden'
        }
      },
      { $unwind: { path: '$orden', preserveNullAndEmptyArrays: true } }
    ];
    const docs = await col().aggregate(pipeline).toArray();
    if (!docs.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(docs[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TRANSACCIÓN 2: Crear review solo si la orden está entregada
exports.crear = async (req, res) => {
  const session = getClient().startSession();
  try {
    let insertedId;
    await session.withTransaction(async () => {
      const ordenId = new ObjectId(req.body.ordenId);
      const orden = await getDB().collection('ordenes').findOne({ _id: ordenId }, { session });
      if (!orden) throw new Error('Orden no encontrada');
      if (orden.estado !== 'entregado') throw new Error('Solo se pueden reseñar órdenes entregadas');

      const review = {
        clienteId: new ObjectId(req.body.clienteId),
        restauranteId: new ObjectId(req.body.restauranteId),
        ordenId,
        estrellas: req.body.estrellas,
        comentario: req.body.comentario || '',
        tags: req.body.tags || [],
        fechaCreacion: new Date()
      };
      const result = await col().insertOne(review, { session });
      insertedId = result.insertedId;
    });
    res.status(201).json({ insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.endSession();
  }
};

exports.actualizar = async (req, res) => {
  try {
    const result = await col().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizarTags = async (req, res) => {
  try {
    const { operation, tag, tags } = req.body;
    const id = new ObjectId(req.params.id);
    let update;
    const values = tags || [tag];

    switch (operation) {
      case 'add':
        update = { $addToSet: { tags: { $each: values } } };
        break;
      case 'remove':
        update = { $pull: { tags: { $in: values } } };
        break;
      default:
        return res.status(400).json({ error: 'operation debe ser add o remove' });
    }

    const result = await col().updateOne({ _id: id }, update);
    if (result.matchedCount === 0) return res.status(404).json({ error: 'No encontrado' });
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
