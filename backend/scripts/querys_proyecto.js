print("Clientes:", db.clientes.countDocuments());
print("Restaurantes:", db.restaurante.countDocuments());
print("Menu:", db.menu.countDocuments());

db.menu.find()


db.ordenes.find()

db.ordenes.aggregate([
{
  $group:{
    _id:"$restauranteId",
    totalOrdenes:{ $sum:1 }
  }
},
{
  $lookup:{
    from:"restaurante",
    localField:"_id",
    foreignField:"_id",
    as:"restaurante"
  }
},
{ $unwind:"$restaurante" },
{
  $project:{
    _id:0,
    restaurante:"$restaurante.nombre",
    totalOrdenes:1
  }
},
{ $sort:{ totalOrdenes:-1 } }
])

//tags distintos 

db.menu.distinct("tags")

// clientes con mas ordenes. 
db.ordenes.aggregate([
    {$group: {
        _id: "$clienteId", 
        totalPedidos: {$sum:1}
    }}, 
    {'$sort': {"totalPedidos": -1}},
    {
      $lookup:{
        from:"clientes",
        localField:"_id",
        foreignField:"_id",
        as:"cliente"
      }
    },
    { $unwind:"$cliente" },
    {
      $project:{
        _id:0,
        totalPedidos: 1, 
        cliente:"$cliente.nombre"
      }
    }
]).limit(3)
    



// platillo mas vendido 

db.ordenes.aggregate([
{ $unwind:"$items" },
{
  $group:{
    _id:"$items.nombreProducto",
    totalVendido:{ $sum:"$items.cantidad" }
  }
},
{ $sort:{ totalVendido:-1 } },
{ $limit:5 }
])

// ventas por mes y año
db.ordenes.aggregate([
{$group:{
  _id:{
    mes:{$dateToString:{format:"%Y-%m",date:"$fechaCreacion"}},
  },
  total:{$sum:{$toDecimal:"$total"}},
  propinas:{$sum:{$toDecimal:"$propina"}},
  totalOrdenes:{ $sum:1 }
}},
{$project:{
  _id:0,
  mes:"$_id.mes",
  total:{$round:["$total",2]},
  propinas:{$round:["$propinas",2]},
  diferencia: {$round: [{$subtract:["$total", "$propinas"] },2]},
  totalOrdenes:1 
}},
{$sort:{mes:-1}}
])

// restaurante mejor calificado 

db.reviews.aggregate([
{
  $group:{
    _id:"$restauranteId",
    promedioEstrellas:{ $avg:"$estrellas" },
    totalReseñas:{ $sum:1 }
  }
},
{
  $lookup:{
    from:"restaurante",
    localField:"_id",
    foreignField:"_id",
    as:"restaurante"
  }
},
{ $unwind:"$restaurante" },
{
  $project:{
    _id:0,
    restaurante:"$restaurante.nombre",
    promedioEstrellas:{ $round:["$promedioEstrellas",2] },
    totalReseñas:1
  }
},
{ $sort:{ promedioEstrellas:-1 } },
{ $limit:10 }
])

// margen por sede 

db.ordenes.aggregate([
{ $unwind:"$items" },
{
  $group:{
    _id:"$restauranteId",
    totalVentas:{ $sum:"$items.subtotal" },
    totalCostos:{
      $sum:{
        $multiply:["$items.costoUnitario","$items.cantidad"]
      }
    }
  }
},
{
  $project:{
    margen:{
      $subtract:["$totalVentas","$totalCostos"]
    }
  }
},
{
  $lookup:{
    from:"restaurante",
    localField:"_id",
    foreignField:"_id",
    as:"restaurante"
  }
},
{ $unwind:"$restaurante" },
{
  $project:{
    _id:0,
    restaurante:"$restaurante.nombre",
    margen:1
  }
},
{ $sort:{ margen:-1 } }
])


