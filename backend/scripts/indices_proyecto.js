

db.restaurante.createIndex(
  { ubicacion: "2dsphere" }
);


db.ordenes.createIndex(
  { clienteId: 1, fechaCreacion: -1 }
);



db.ordenes.createIndex(
  { restauranteId: 1, estado: 1 }
);


db.menu.createIndex(
  { tags: 1 }
);
