use cadena_restaurantes

db.restaurante.insertMany([
{
  nombre: "Castor's Pizza | Zona 1",
  direccion: "Local B, Centro Historico, 9A Calle 637, Cdad. de Guatemala, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.513575, 14.64043]
  },
  telefono: "",
  correoContacto: "castors1@cadena.com",
  horario: { apertura: "05:00", cierre: "22:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | La Reformita Z.12",
  direccion: "7a avenida y, Condominio Génesis Urbana, 15 Calle, Cdad. de Guatemala, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.543712, 14.602607]
  },
  telefono: "",
  correoContacto: "castors2@cadena.com",
  horario: { apertura: "06:00", cierre: "22:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | Forum Zona 10",
  direccion: "1080, 3 Avenida 01010, Cdad. de Guatemala 01010, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.513716, 14.602532]
  },
  telefono: "",
  correoContacto: "castors3@cadena.com",
  horario: { apertura: "08:00", cierre: "22:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | C.C. Vilaflor",
  direccion: "C.C. Vilaflor km 16.5, Carr. a El Salvador, Cdad. de Guatemala 01052, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.452484, 14.542517]
  },
  telefono: "",
  correoContacto: "castors4@cadena.com",
  horario: { apertura: "09:00", cierre: "23:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | San Cristóbal",
  direccion: "CC SanKris Mall, 3ra. Calle 6-72 Sector A3 Boulevard, Cdad. de Guatemala, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.598067, 14.611564]
  },
  telefono: "",
  correoContacto: "castors5@cadena.com",
  horario: { apertura: "09:00", cierre: "20:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza",
  direccion: "12 Calle 5-59, Cdad. de Guatemala 01009, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.520782, 14.601448]
  },
  telefono: "",
  correoContacto: "castors6@cadena.com",
  horario: { apertura: "09:00", cierre: "21:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | C.C. Metronorte",
  direccion: "Centro Comercial Los Álamos, Cdad. de Guatemala 01017, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.480439, 14.649697]
  },
  telefono: "",
  correoContacto: "castors7@cadena.com",
  horario: { apertura: "07:00", cierre: "21:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | Kalú El Naranjo",
  direccion: "Plaza KALÚ, 2do nivel, Condado Naranjo 14-50, Mixco 01057, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.539612, 14.650986]
  },
  telefono: "",
  correoContacto: "castors8@cadena.com",
  horario: { apertura: "08:00", cierre: "23:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | Séptimo Zona 4",
  direccion: "Edificio Séptimo, 7A Avenida 01004, Cdad. de Guatemala 01004, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.515512, 14.621674]
  },
  telefono: "",
  correoContacto: "castors9@cadena.com",
  horario: { apertura: "10:00", cierre: "22:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | Plaza Reformadores",
  direccion: "Plaza Reformadores, Villa Nueva 01064, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.586045, 14.509346]
  },
  telefono: "",
  correoContacto: "castors10@cadena.com",
  horario: { apertura: "08:00", cierre: "24:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza El Recreo",
  direccion: "11 Avenida & 30 Calle, Cdad. de Guatemala, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.550965, 14.591133]
  },
  telefono: "",
  correoContacto: "castors11@cadena.com",
  horario: { apertura: "06:00", cierre: "22:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | Antigua Calle del Arco",
  direccion: "Calle del Arco, 5a Avenida Norte 31, Antigua Guatemala 03001, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.734153, 14.560333]
  },
  telefono: "",
  correoContacto: "castors12@cadena.com",
  horario: { apertura: "08:00", cierre: "22:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | Rus Mall",
  direccion: "Centro Comercial Rus Mall, Calzada Roosevelt 12-76, Cdad. de Guatemala 01007, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.550108, 14.622639]
  },
  telefono: "",
  correoContacto: "castors13@cadena.com",
  horario: { apertura: "07:00", cierre: "24:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza",
  direccion: "GFF8+Q5V, Villa Canales, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.534652, 14.524457]
  },
  telefono: "",
  correoContacto: "castors14@cadena.com",
  horario: { apertura: "05:00", cierre: "24:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | Interplaza Villalobos",
  direccion: "km 14, Metroplaza Villalobos, Carretera al Pácifico, Villa Nueva 01064, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.57754, 14.552112]
  },
  telefono: "",
  correoContacto: "castors15@cadena.com",
  horario: { apertura: "07:00", cierre: "22:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor pizza pet friendly",
  direccion: "7a Calle Poniente 35, Antigua Guatemala, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.736436, 14.55407]
  },
  telefono: "",
  correoContacto: "castors16@cadena.com",
  horario: { apertura: "09:00", cierre: "24:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},{
  nombre: "Castor's Pizza | C.C. EcoCentro Los Alámos",
  direccion: "KM 15, Centro Comercial EcoCentro Los Álamos, 0 Calle 0-60, 01066, Guatemala",
  ubicacion: {
    type: "Point",
    coordinates: [-90.551685, 14.524258]
  },
  telefono: "",
  correoContacto: "castors17@cadena.com",
  horario: { apertura: "07:00", cierre: "24:00" },
  activo: true,
  fechaCreacion: new Date(),
  fechaActualizacion: new Date()
},]);

// ================= USUARIOS =================
for (let i = 1; i <= 100; i++) {

  db.usuarios.insertOne({
    nombre: "Usuario " + i,
    email: "usuario" + i + "@cadena.com",
    passwordHash: "hash_demo_" + i,
    rol: ["admin","gerente","operador"][Math.floor(Math.random()*3)],
    activo: true,
    fechaCreacion: new Date(),
    ultimoAcceso: new Date()
  });
}
// ================= CLIENTES =================
for (let i = 1; i <= 5000; i++) {

  db.clientes.insertOne({
    nombre: "Cliente " + i,
    direccion: {
      calle: "Calle " + i,
      numero: "" + i,
      zona: "Zona " + (i%10),
      ciudad: "Ciudad",
      departamento: "Depto",
      codigoPostal: "000" + (i%100)
    },
    email: "cliente" + i + "@mail.com",
    telefono: "700000" + i,
    fechaRegistro: new Date(),
    puntosFidelidad: Math.floor(Math.random()*1000),
    activo: true,
    tags: []
  });
}

// ================= MENU =================
// Lista maestra de 20 tags
const listaTags = [
  "pizza",
  "Carne Premium",
  "pollo",
  "vegetariano",
  "vegano",
  "picante",
  "sin_gluten",
  "especialidad",
  "Favorita",
  "familiar",
  "italiano",
  "mexicano",
  "americano",
  "rapido",
  "premium",
  "economico",
  "postre",
  "bebida",
  "preferencial",
  "nuevo"
];

for (let i = 1; i <= 20; i++) {

  // Número aleatorio entre 1 y 5
  let cantidadTags = Math.floor(Math.random() * 5) + 1;

  // Mezclar la lista y tomar los primeros N (sin repetición)
  let tagsSeleccionados = [...listaTags]
    .sort(() => 0.5 - Math.random())
    .slice(0, cantidadTags);

  db.menu.insertOne({
    nombre: "Producto " + i,
    descripcion: "Descripción producto " + i,
    tamanos: [
      {nombre: "Pequeña", precioVenta: 20, costoProduccion: 10, margenEstimado: 50 },
      {nombre: "Mediana", precioVenta: 35, costoProduccion: 18, margenEstimado: 48 },
      {nombre: "Grande", precioVenta: 50, costoProduccion: 25, margenEstimado: 50 }
    ],
    precioPuntos: 200,
    tags: tagsSeleccionados,
    activo: true,
    fechaCreacion: new Date(),
    fechaActualizacion: new Date()
  });
}
// ================= ORDENES =================

let clientes = db.clientes.find().toArray();
let restaurantes = db.restaurante.find().toArray();
let menu = db.menu.find().toArray();

for (let i = 1; i <= 50000; i++) {

  let cliente = clientes[Math.floor(Math.random() * clientes.length)];
  let restaurante = restaurantes[Math.floor(Math.random() * restaurantes.length)];

  // 1 a 5 productos distintos
  let cantidadItems = Math.floor(Math.random() * 5) + 1;

  let productosSeleccionados = [...menu]
    .sort(() => 0.5 - Math.random())
    .slice(0, cantidadItems);

  let items = [];
  let totalProductos = 0;

  for (let producto of productosSeleccionados) {

    // Elegir tamaño aleatorio del arreglo tamanos
    let tamanoIndex = Math.floor(Math.random() * producto.tamanos.length);
    let tamanoObj = producto.tamanos[tamanoIndex];

    let cantidad = Math.floor(Math.random() * 3) + 1; // 1 a 3 unidades
    let subtotal = tamanoObj.precioVenta * cantidad;

    totalProductos += subtotal;

    items.push({
      menuId: producto._id,
      nombreProducto: producto.nombre,
      tamano: tamanoObj.nombre,
      precioUnitario: tamanoObj.precioVenta,
      costoUnitario: tamanoObj.costoProduccion,
      cantidad: cantidad,
      subtotal: subtotal
    });
  }

  let propina = Math.floor(Math.random() * 50) + 1;
  let total = totalProductos + propina;

  db.ordenes.insertOne({
    clienteId: cliente._id,
    restauranteId: restaurante._id,
    items: items,
    total: total,
    propina: propina,
    metodoPago: ["efectivo", "tarjeta"][Math.floor(Math.random() * 2)],
    estado: ["entregado"][Math.floor(Math.random() * 1)],
    fechaCreacion: new Date(),
    fechaEntrega: new Date()
  });
}
// ================= RESEÑAS =================

// ====== Banco de palabras para comentarios ======
const bancoPalabras = [
  "excelente", "rápido", "delicioso", "frío", "caliente",
  "lento", "amable", "terrible", "recomendado", "sabroso",
  "crujiente", "jugoso", "salado", "perfecto", "agradable",
  "increíble", "normal", "aceptable", "fantástico", "horrible"
];

// ====== Banco de tags ======
const bancoTags = [
  "rapido", "calidad", "precio", "servicio",
  "demora", "recomendado", "mala_experiencia",
  "excelente", "volveria", "amabilidad",
  "presentacion", "sabor", "cantidad"
];

// Obtener órdenes (ej: 10000)
let ordenes = db.ordenes.find().limit(10000).toArray();

if (!ordenes.length) {
  throw new Error("No hay órdenes para generar reseñas.");
}

for (let orden of ordenes) {

  // ===== Generar comentario =====
  let cantidadPalabras = Math.floor(Math.random() * 3) + 1;

  let palabrasSeleccionadas = [...bancoPalabras]
    .sort(() => 0.5 - Math.random())
    .slice(0, cantidadPalabras);

  let comentario = palabrasSeleccionadas.join(" ");

  // ===== Generar tags =====
  let cantidadTags = Math.floor(Math.random() * 3) + 1;

  let tagsSeleccionados = [...bancoTags]
    .sort(() => 0.5 - Math.random())
    .slice(0, cantidadTags);

  // ===== Insertar reseña =====
  db.reviews.insertOne({
    clienteId: orden.clienteId,
    restauranteId: orden.restauranteId,
    ordenId: orden._id,
    estrellas: Math.floor(Math.random() * 5) + 1,
    comentario: comentario,
    tags: tagsSeleccionados,
    fechaCreacion: new Date()
  });
}

