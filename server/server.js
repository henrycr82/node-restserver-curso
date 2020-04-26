//requires
require('./config/config');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
// para procesar peticiones /x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// para procesar peticiones /json
app.use(bodyParser.json())

/*app.get('/', function (req, res) {
  res.json('Hello World');
});*/

app.get('/usuario', function (req, res) {
  res.json('get usuario');
});

app.post('/usuario', function (req, res) {

  let body = req.body;

  //si no recibo el nombre
  //envío un status 400 (Bad Request )
  if (body.nombre===undefined) {
      res.status(400).json({
          ok : false,
          mensaje : 'El nombre es necesario'
      });
  } else {
      res.json({
          persona: body
      });
  }


});

// /:id para pasar un parametro por la url
app.put('/usuario/:id', function (req, res) {
  let id = req.params.id//para obtener el parametro que pasamos por la url
  res.json({
      id
  });
});

app.delete('/usuario', function (req, res) {
  res.json('delete usuario');
});

//de la variable global process.env.PORT leemos el puerto
//ella se encuentra en server/config/config.js
app.listen(process.env.PORT, () => {
    console.log('Escuchando por el puerto:', process.env.PORT);
});
