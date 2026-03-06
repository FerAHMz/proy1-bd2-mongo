const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const col = () => getDB().collection('restaurante');

exports.listar = async (req, res) => {
  try {
    const { skip, limit, sort } = req.pagination;
    const filter = {};
    if (req.query.activo !== undefined) filter.activo = req.query.activo === 'true';
    if (req.query.nombre) filter.nombre = { $regex: req.query.nombre, $options: 'i' };

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

exports.cercanos = async (req, res) => {
  try {
    const { lng, lat, maxDist } = req.query;
    if (!lng || !lat) return res.status(400).json({ error: 'lng y lat son requeridos' });
    const docs = await col().find({
      ubicacion: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDist) || 5000
        }
      }
    }).limit(parseInt(req.query.limit) || 10).toArray();
    res.json({ data: docs });
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

exports.crear = async (req, res) => {
  try {
    const result = await col().insertOne({ ...req.body, fechaCreacion: new Date(), activo: true });
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crearMuchos = async (req, res) => {
  try {
    const docs = req.body.map(d => ({ ...d, fechaCreacion: new Date(), activo: true }));
    const result = await col().insertMany(docs);
    res.status(201).json({ insertedCount: result.insertedCount, insertedIds: result.insertedIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const result = await col().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, fechaActualizacion: new Date() } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.activarMuchos = async (req, res) => {
  try {
    const { ids, activo } = req.body;
    const filter = ids
      ? { _id: { $in: ids.map(id => new ObjectId(id)) } }
      : req.body.filter || {};
    const result = await col().updateMany(filter, { $set: { activo, fechaActualizacion: new Date() } });
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
