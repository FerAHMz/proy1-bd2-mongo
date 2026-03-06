const { getDB } = require('../config/db');

exports.platilloMasVendido = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.nombreProducto',
          totalVendido: { $sum: '$items.cantidad' },
          ingresoTotal: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalVendido: -1 } },
      { $limit: parseInt(req.query.limit) || 10 }
    ];
    const data = await getDB().collection('ordenes').aggregate(pipeline).toArray();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.restauranteMejorCalificado = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$restauranteId',
          promedioEstrellas: { $avg: '$estrellas' },
          totalReviews: { $sum: 1 }
        }
      },
      { $sort: { promedioEstrellas: -1 } },
      { $limit: parseInt(req.query.limit) || 10 },
      {
        $lookup: {
          from: 'restaurante',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurante'
        }
      },
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          restauranteId: '$_id',
          nombre: '$restaurante.nombre',
          promedioEstrellas: { $round: ['$promedioEstrellas', 2] },
          totalReviews: 1
        }
      }
    ];
    const data = await getDB().collection('reviews').aggregate(pipeline).toArray();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.margenPorSede = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$items' },
      {
        $group: {
          _id: '$restauranteId',
          totalVentas: { $sum: '$items.subtotal' },
          totalCostos: { $sum: { $multiply: ['$items.costoUnitario', '$items.cantidad'] } },
          totalOrdenes: { $sum: 1 }
        }
      },
      {
        $addFields: {
          margen: { $subtract: ['$totalVentas', '$totalCostos'] },
          margenPorcentaje: {
            $cond: [
              { $eq: ['$totalVentas', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: [{ $subtract: ['$totalVentas', '$totalCostos'] }, '$totalVentas'] }, 100] }, 2] }
            ]
          }
        }
      },
      { $sort: { margen: -1 } },
      {
        $lookup: {
          from: 'restaurante',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurante'
        }
      },
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          restauranteId: '$_id',
          nombre: '$restaurante.nombre',
          totalVentas: { $round: ['$totalVentas', 2] },
          totalCostos: { $round: ['$totalCostos', 2] },
          margen: { $round: ['$margen', 2] },
          margenPorcentaje: 1,
          totalOrdenes: 1
        }
      }
    ];
    const data = await getDB().collection('ordenes').aggregate(pipeline).toArray();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clienteMasFrecuente = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$clienteId',
          totalOrdenes: { $sum: 1 },
          totalGastado: { $sum: '$total' }
        }
      },
      { $sort: { totalOrdenes: -1 } },
      { $limit: parseInt(req.query.limit) || 10 },
      {
        $lookup: {
          from: 'clientes',
          localField: '_id',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      { $unwind: { path: '$cliente', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          clienteId: '$_id',
          nombre: '$cliente.nombre',
          email: '$cliente.email',
          totalOrdenes: 1,
          totalGastado: { $round: ['$totalGastado', 2] }
        }
      }
    ];
    const data = await getDB().collection('ordenes').aggregate(pipeline).toArray();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ventasPorMes = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$fechaCreacion' } },
          totalVentas: { $sum: '$total' },
          totalOrdenes: { $sum: 1 },
          promedioOrden: { $avg: '$total' }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          mes: '$_id',
          totalVentas: { $round: ['$totalVentas', 2] },
          totalOrdenes: 1,
          promedioOrden: { $round: ['$promedioOrden', 2] }
        }
      }
    ];
    const data = await getDB().collection('ordenes').aggregate(pipeline).toArray();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ordenesPorRestaurante = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$restauranteId',
          totalOrdenes: { $sum: 1 },
          totalVentas: { $sum: '$total' }
        }
      },
      { $sort: { totalOrdenes: -1 } },
      {
        $lookup: {
          from: 'restaurante',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurante'
        }
      },
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          restauranteId: '$_id',
          nombre: '$restaurante.nombre',
          totalOrdenes: 1,
          totalVentas: { $round: ['$totalVentas', 2] }
        }
      }
    ];
    const data = await getDB().collection('ordenes').aggregate(pipeline).toArray();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.conteo = async (req, res) => {
  try {
    const { coleccion } = req.params;
    const count = await getDB().collection(coleccion).countDocuments();
    res.json({ coleccion, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.distinct = async (req, res) => {
  try {
    const { coleccion, campo } = req.params;
    const values = await getDB().collection(coleccion).distinct(campo);
    res.json({ coleccion, campo, count: values.length, values });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
