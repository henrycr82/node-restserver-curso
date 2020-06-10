//requires
const express = require('express');
const app = express();

// Importamos los archivos de rutas server/routes/
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));

//exportamos
module.exports = app;
