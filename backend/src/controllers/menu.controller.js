const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const col = () => getDB().collection('menu');

exports.listar = async (req, res) => {
  try {
    const { skip, limit, sort } = req.pagination;
    const filter = {};
    if (req.query.activo !== undefined) filter.activo = req.query.activo === 'true';
    if (req.query.nombre) filter.nombre = { $regex: req.query.nombre, $options: 'i' };
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.tags) filter.tags = { $all: req.query.tags.split(',') };

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

exports.buscar = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q es requerido' });
    const { skip, limit, sort } = req.pagination;
    const filter = { nombre: { $regex: q, $options: 'i' } };

    const [docs, total] = await Promise.all([
      col().find(filter).sort(Object.keys(sort).length ? sort : { nombre: 1 }).skip(skip).limit(limit).toArray(),
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

exports.actualizarTamanos = async (req, res) => {
  try {
    const { op, tamanos } = req.body;
    const id = new ObjectId(req.params.id);
    let update;

    if (op === 'add') {
      update = {
        $push: { tamanos: { $each: tamanos } },
        $set: { fechaActualizacion: new Date() }
      };
    } else if (op === 'remove') {
      const nombres = tamanos.map(t => t.nombre);
      update = {
        $pull: { tamanos: { nombre: { $in: nombres } } },
        $set: { fechaActualizacion: new Date() }
      };
    } else {
      return res.status(400).json({ error: 'op debe ser "add" o "remove"' });
    }

    const result = await col().updateOne({ _id: id }, update);
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
