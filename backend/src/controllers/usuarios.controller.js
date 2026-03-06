const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const col = () => getDB().collection('usuarios');

exports.listar = async (req, res) => {
  try {
    const { skip, limit, sort } = req.pagination;
    const filter = {};
    if (req.query.rol) filter.rol = req.query.rol;
    if (req.query.activo !== undefined) filter.activo = req.query.activo === 'true';

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

exports.crear = async (req, res) => {
  try {
    const result = await col().insertOne({ ...req.body, fechaCreacion: new Date(), activo: true });
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

exports.eliminar = async (req, res) => {
  try {
    const result = await col().deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
