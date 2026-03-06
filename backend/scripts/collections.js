use proyecto_1;

db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "email", "passwordHash", "rol", "activo", "fechaCreacion"],
      properties: {
        nombre: { bsonType: "string" },
        email: { bsonType: "string" },
        passwordHash: { bsonType: "string" },
        rol: { enum: ["admin", "gerente", "operador"] },
        activo: { bsonType: "bool" },
        fechaCreacion: { bsonType: "date" },
        ultimoAcceso: { bsonType: "date" }
      }
    }
  }
})



db.createCollection("clientes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "email", "fechaRegistro", "activo"],
      properties: {
        nombre: { bsonType: "string" },
        direccion: {
          bsonType: "object",
          properties: {
            calle: { bsonType: "string" },
            numero: { bsonType: "string" },
            zona: { bsonType: "string" },
            ciudad: { bsonType: "string" },
            departamento: { bsonType: "string" },
            codigoPostal: { bsonType: "string" }
          }
        },
        email: { bsonType: "string" },
        telefono: { bsonType: "string" },
        fechaRegistro: { bsonType: "date" },
        puntosFidelidad: { bsonType: "number" },
        activo: { bsonType: "bool" },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" }
        }
      }
    }
  }
})


db.createCollection("menu", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "activo", "fechaCreacion"],
      properties: {
        nombre: { bsonType: "string" },
        descripcion: { bsonType: "string" },
        tamanos: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["nombre", "precioVenta"],
            properties: {
              nombre: { bsonType: "string" },
              precioVenta: { bsonType: "number" },
              costoProduccion: { bsonType: "number" },
              margenEstimado: { bsonType: "number" }
            }
          }
        },
        precioPuntos: { bsonType: "number" },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        activo: { bsonType: "bool" },
        fechaCreacion: { bsonType: "date" },
        fechaActualizacion: { bsonType: "date" }
      }
    }
  }
})


db.createCollection("restaurante", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "ubicacion", "activo", "fechaCreacion"],
      properties: {
        nombre: { bsonType: "string" },
        direccion: { bsonType: "string" },
        ubicacion: {
          bsonType: "object",
          required: ["type", "coordinates"],
          properties: {
            type: { enum: ["Point"] },
            coordinates: {
              bsonType: "array",
              items: { bsonType: "number" },
              minItems: 2,
              maxItems: 2
            }
          }
        },
        telefono: { bsonType: "string" },
        correoContacto: { bsonType: "string" },
        horario: {
          bsonType: "object",
          properties: {
            apertura: { bsonType: "string" },
            cierre: { bsonType: "string" }
          }
        },
        activo: { bsonType: "bool" },
        fechaCreacion: { bsonType: "date" },
        fechaActualizacion: { bsonType: "date" }
      }
    }
  }
})

db.RESTAURANTES.createIndex({ ubicacion: "2dsphere" })


db.createCollection("ordenes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["clienteId", "restauranteId", "items", "total", "estado", "fechaCreacion"],
      properties: {
        clienteId: { bsonType: "objectId" },
        restauranteId: { bsonType: "objectId" },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["menuId", "nombreProducto", "precioUnitario", "cantidad", "subtotal"],
            properties: {
              menuId: { bsonType: "objectId" },
              nombreProducto: { bsonType: "string" },
              tamano: { bsonType: "string" },
              precioUnitario: { bsonType: "number" },
              costoUnitario: { bsonType: "number" },
              cantidad: { bsonType: "number" },
              subtotal: { bsonType: "number" }
            }
          }
        },
        total: { bsonType: "number" },
        propina: { bsonType: "number" },
        metodoPago: { bsonType: "string" },
        estado: { bsonType: "string" },
        fechaCreacion: { bsonType: "date" },
        fechaEntrega: { bsonType: "date" }
      }
    }
  }
})


db.createCollection("reviews", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["clienteId", "restauranteId", "ordenId", "estrellas", "fechaCreacion"],
      properties: {
        clienteId: { bsonType: "objectId" },
        restauranteId: { bsonType: "objectId" },
        ordenId: { bsonType: "objectId" },
        estrellas: { bsonType: "int", minimum: 1, maximum: 5 },
        comentario: { bsonType: "string" },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        fechaCreacion: { bsonType: "date" }
      }
    }
  }
})


