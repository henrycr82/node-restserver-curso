//requires
require('./config/config');//Aqui se encuentra la configuración de la aplicación
const express = require('express');
const mongoose = require('mongoose');
const app = express();

const bodyParser = require('body-parser');
// para procesar peticiones /x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// para procesar peticiones /json
app.use(bodyParser.json())

// Importamos el archivo de rutas server/routes/usuario.js
app.use(require('./routes/usuario'));

//Conectando a MongoDB
mongoose.connect(process.env.URLDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(error => handleError(error));

//de la variable global process.env.PORT leemos el puerto
//ella se encuentra en server/config/config.js
app.listen(process.env.PORT, () => {
    console.log('Escuchando por el puerto:', process.env.PORT);
});
