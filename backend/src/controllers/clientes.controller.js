const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const col = () => getDB().collection('clientes');

exports.listar = async (req, res) => {
  try {
    const { skip, limit, sort } = req.pagination;
    const filter = {};
    if (req.query.activo !== undefined) filter.activo = req.query.activo === 'true';
    if (req.query.zona) filter['direccion.zona'] = req.query.zona;
    if (req.query.tag) filter.tags = req.query.tag;

    const projection = {};
    if (req.query.fields) {
      for (const f of req.query.fields.split(',')) projection[f.trim()] = 1;
    }

    const [docs, total] = await Promise.all([
      col().find(filter, { projection }).sort(Object.keys(sort).length ? sort : { nombre: 1 }).skip(skip).limit(limit).toArray(),
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

exports.historialOrdenes = async (req, res) => {
  try {
    const { skip, limit, sort } = req.pagination;
    const clienteId = new ObjectId(req.params.id);
    const pipeline = [
      { $match: { clienteId } },
      { $sort: Object.keys(sort).length ? sort : { fechaCreacion: -1 } },
      { $skip: skip },
      { $limit: limit },
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
    const docs = await getDB().collection('ordenes').aggregate(pipeline).toArray();
    const total = await getDB().collection('ordenes').countDocuments({ clienteId });
    res.json({ data: docs, total, skip, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const result = await col().insertOne({ ...req.body, fechaRegistro: new Date(), activo: true, puntosFidelidad: 0 });
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

exports.actualizarDireccion = async (req, res) => {
  try {
    const result = await col().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { direccion: req.body } }
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
      case 'push':
        update = { $push: { tags: { $each: values } } };
        break;
      case 'remove':
        update = { $pull: { tags: { $in: values } } };
        break;
      default:
        return res.status(400).json({ error: 'operation debe ser add, push o remove' });
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
