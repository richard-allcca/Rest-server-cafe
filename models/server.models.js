const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { createServer } = require("http");

require("dotenv").config();

// config db
const { dbConnection } = require("../database/config.db");
const socketController = require("../sockets/controller.socket");

class Server {

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8085;
    this.server = createServer(this.app);
    this.io = require("socket.io")(this.server);

    // rutas end-point
    this.paths = {
      auth: "/api/auth",
      buscar: "/api/buscar",
      categorias: "/api/categorias",
      productos: "/api/productos",
      uploads: "/api/uploads",
      user: "/api/users",
    };

    // Middlewares
    this.conectarDatabase();

    this.middleware();

    this.routes();

    this.socket();
  }

  async conectarDatabase() {
    await dbConnection();
  }

  middleware() {
    // Evita errores cors origin en los navegadores
    this.app.use(cors());

    // Serializa data del body en las peticiones para uso en controladores con req
    this.app.use(express.json());

    // Directorio publico, se muestra con localhost:8085
    // this.app.use(express.static("public",{extensions: ["html","css","js"]}));
    this.app.use(express.static("public"));

    // Carga de archivos
    this.app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: "./tmp",
      createParentPath: true,
    }));
  }

  routes() {
    this.app.use(this.paths.auth, require("../routes/auth.routes"));
    this.app.use(this.paths.buscar, require("../routes/buscar.routes"));
    this.app.use(this.paths.categorias, require("../routes/categories.routes"));
    this.app.use(this.paths.productos, require("../routes/producto.routes"));
    this.app.use(this.paths.uploads, require("../routes/uploads.routes"));
    this.app.use(this.paths.user, require("../routes/usuarios.routes"));
  }

  socket() {
    // Paso de socket e io al controlador
    this.io.on("connection", (socket) => socketController(socket, this.io));
  }

  listen() {
    this.server.listen(this.port, () => {
      console.log(`Server escuchando en el puerto ${this.port}`);
    });
  }
}

module.exports = Server;
