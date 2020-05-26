//requires
const express = require('express');
const app = express();

// Importamos los archivos de rutas server/routes/usuario.js y server/routes/login.js
app.use(require('./usuario'));
app.use(require('./login'));

//exportamos
module.exports = app;
