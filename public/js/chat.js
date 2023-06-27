const url = window.location.hostname.includes("localhost")
  ? "http://localhost:8085/api/auth"
  : "https://api-rest-cafe-node.herokuapp.com/api/auth";

const $txtUid = document.getElementById("txtUid");
const $txtMensaje = document.getElementById("txtMensaje");
const $ulMensajes = document.getElementById("ulMensajes");
const $ulUsuarios = document.getElementById("ulUsuarios");
const $bntSalir = document.getElementById("bntSalir");

let usuario = null;
let socket = null;

const validarJwt = async () => {
  const token = localStorage.getItem("token") || "";

  if (token.length === 0) {
    // para redireccionar puedes usar react o angular
    window.location = "index.html";
    throw new Error("No hay token");
  }

  const resp = await fetch(url, {
    headers: { "x-token": token },
  });

  const { usuario: usuarioDB, token: tokenDB } = await resp.json();
  localStorage.setItem("token", tokenDB);

  usuario = usuarioDB;
  document.title = `Chat - ${usuario.nombre}`;

  await conectarSocket();
};

const conectarSocket = async () => {
  socket = io({
    extraHeaders: {
      "x-token": localStorage.getItem("token"),
    },
  });

  socket.on("connect", () => {
    console.log("Conectado al servidor");
  });

  socket.on("disconnect", () => {
    console.log("Desconectado del servidor");
  });

  socket.on("recibir-mensaje", pintarMensaje);

  socket.on("usuarios-activos", pintarUsuariosActivos);

  socket.on("mensajes-privados", (payload) => {
    // TODO: pintar mensaje en canal privado(pueder ser una burbuja)
    console.log(payload);
  });
};

const pintarUsuariosActivos = (usuarios) => {
  let usersHtml = "";
  usuarios.forEach(({ nombre, uid }) => {
    usersHtml += `
    <li>
      <p>
        <h5 class="text-success" >${nombre}</h5>
        <span class="fs-6 text-muted" >${uid}</span>
      </p>
    </li>
  `;
  });
  $ulUsuarios.innerHTML = usersHtml;
};

const pintarMensaje = (msg) => {
  // console.log(payload)
  let mensajeHtml = "";
  msg.forEach(({ uid, nombre, mensaje }) => {
    mensajeHtml += `
      <li  >
        <span class="text-primary" >${nombre}</span>:
        <span>${mensaje}</span>
      </li>
    `;
    $ulMensajes.innerHTML = mensajeHtml;
  });
};

$txtMensaje.addEventListener("keyup", (e) => {
  const mensaje = $txtMensaje.value;
  const uid = $txtUid.value;

  if ($txtMensaje.value.length === 0) return;
  if (!e.key === "Enter") return;
  if (e.key === "Enter") {
    socket.emit("enviar-mensaje", { mensaje, uid });

    $txtMensaje.value = "";
  }
});

const main = async () => {
  await validarJwt();
};

main();
