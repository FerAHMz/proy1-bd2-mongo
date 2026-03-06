const { getDB } = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const { coleccion } = req.params;
    const indices = await getDB().collection(coleccion).indexes();
    res.json({ coleccion, indices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crear = async (req, res) => {
  try {
    const { coleccion, keys, options } = req.body;
    const result = await getDB().collection(coleccion).createIndex(keys, options || {});
    res.status(201).json({ coleccion, indexName: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crearTexto = async (req, res) => {
  try {
    const result = await getDB().collection('reviews').createIndex(
      { comentario: 'text' },
      { name: 'comentario_text' }
    );
    res.status(201).json({ coleccion: 'reviews', indexName: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crearSimple = async (req, res) => {
  try {
    const result = await getDB().collection('clientes').createIndex(
      { email: 1 },
      { name: 'email_1' }
    );
    res.status(201).json({ coleccion: 'clientes', indexName: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { coleccion, indexName } = req.body;
    await getDB().collection(coleccion).dropIndex(indexName);
    res.json({ message: `Índice ${indexName} eliminado de ${coleccion}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.explain = async (req, res) => {
  try {
    const { coleccion, filter, sort } = req.body;
    const cursor = getDB().collection(coleccion).find(filter || {});
    if (sort) cursor.sort(sort);
    const explanation = await cursor.explain('executionStats');
    res.json(explanation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
