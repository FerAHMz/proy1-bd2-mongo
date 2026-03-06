const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

exports.bulkWrite = async (req, res) => {
  try {
    const { coleccion } = req.params;
    const { operations } = req.body;

    if (!operations || !Array.isArray(operations) || !operations.length) {
      return res.status(400).json({ error: 'operations (array) es requerido' });
    }

    // Convert string IDs to ObjectId and add defaults for inserts
    const ops = operations.map(op => {
      if (op.insertOne) {
        const doc = { ...op.insertOne.document };
        if (!doc.fechaCreacion) doc.fechaCreacion = new Date();
        else if (typeof doc.fechaCreacion === 'string') doc.fechaCreacion = new Date(doc.fechaCreacion);
        return { insertOne: { document: doc } };
      }
      if (op.updateOne) {
        const filter = { ...op.updateOne.filter };
        if (filter._id) filter._id = new ObjectId(filter._id);
        return { updateOne: { filter, update: op.updateOne.update } };
      }
      if (op.updateMany) {
        return { updateMany: { filter: op.updateMany.filter, update: op.updateMany.update } };
      }
      if (op.deleteOne) {
        const filter = { ...op.deleteOne.filter };
        if (filter._id) filter._id = new ObjectId(filter._id);
        return { deleteOne: { filter } };
      }
      if (op.deleteMany) {
        return { deleteMany: { filter: op.deleteMany.filter } };
      }
      return op;
    });

    const result = await getDB().collection(coleccion).bulkWrite(ops);
    res.json({
      insertedCount: result.insertedCount,
      modifiedCount: result.modifiedCount,
      deletedCount: result.deletedCount,
      upsertedCount: result.upsertedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
