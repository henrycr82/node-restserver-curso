//requires
const express = require('express');
const Usuario = require('../models/usuario');//Modelo Usuario
const bcrypt = require('bcrypt');
const _ = require('underscore');
//importamos por destruccturing
const { verificarToken, verificarAdminRole } = require('../middlewares/autenticacion');
const app = express();
/*app.get('/', function (req, res) {
  res.json('Hello World');
});*/

//LISTAR USUARIOS
//usamos el Middleware verificarToken para validar el TOKEN de seguridad
app.get('/usuario', verificarToken, (req, res) => {
    //res.json('get usuario');

    //información del PAYLOAD del TOKEN
    /*return res.json({
        usuario : req.usuario,
        nombre : req.usuario.nombre,
        email : req.usuario.email
    });*/

    //si no llega el parametro desde asumo que mostrare todos los registros
    let desde = req.query.desde || 0;
    desde = Number(desde);

    //si no llega el parametro limite el valor del mismo sera 5
    let limite = req.query.limite || 5;
    limite = Number(limite);

    //para obtener todos los registro de la colección
    //.exec ejecuta nuestra consulta
    //limit(limite) para limitar la consulta a la cantidad de registgros que contenga la variable limite
    //skip(desde) trae los registros a partir del parametro indicado (desde). Se usa para paginación
    //{} condición de busqueda
    //ejemplos de condiciones de busqueda {google: true}
    //'nombre email role estado google img' campos o propiedades de un objeto que queremos mostrar en la consulta
    //{estado : true} condicional para traer todos los usuarios activos
    Usuario.find({estado : true}, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err,usuarios)=>{
            if (err) {
                return res.status(400).json({
                    ok : false,
                    err
                });
            }
            //Callback para contar los registrso de la consulta
            //{} la condición de busqueda debe ser igual a la condición de busqueda del Usuario.find({})
            Usuario.count({estado : true},(err,cuantos)=>{
                res.json({
                    ok: true,
                    usuarios,
                    cuantos
                });
            });

        });
});

//GUARDAR
//Arreglo de Middlewares [verificarToken, verificarAdminRole]
app.post('/usuario', [verificarToken, verificarAdminRole], (req, res) => {

    //información del PAYLOAD del TOKEN
    /*return res.json({
        usuario : req.usuario,
        nombre : req.usuario.nombre,
        email : req.usuario.email
    });*/


    let body = req.body;

    //Instancias el modelo usuario
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),//bcrypt para encriptar la contraseña
        role: body.role
    });

    //callback para guardar
    //err: error
    //usuarioDB: usuario insertado
    usuario.save((err, usuarioDB)=>{
        if (err) {
            return res.status(400).json({
                ok : false,
                err
            });
        }

        //Lo cambiamos en el models/usuario.js
        //para quitar la contraseña de la respuesta que pasamos via json
        //usuarioDB.password = null;

        //devuelve por defecto un status 200
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    //si no recibo el nombre
    //envío un status 400 (Bad Request )
    /*if (body.nombre===undefined) {
      res.status(400).json({
          ok : false,
          mensaje : 'El nombre es necesario'
      });
    } else {
      res.json({
          persona: body
      });
    }*/

});

//ACTUALIZAR
// /:id para pasar un parametro por la url
app.put('/usuario/:id', [verificarToken, verificarAdminRole], (req, res) => {

    //información del PAYLOAD del TOKEN
    /*return res.json({
        usuario : req.usuario,
        nombre : req.usuario.nombre,
        email : req.usuario.email
    });*/

    let id = req.params.id;//para obtener el parametro que pasamos por la url
    //para filtrar los campos que puedo actualizar que me llegan por el boby
    //los filtro con la libreria underscore
    let body = _.pick(req.body,['nombre','email','img','role','estado']);

    //callback para buscar por Id y Actualiar el usuario
    //err: error
    //usuarioDB: usuario actualizado
    //{new:true} este parametro me permite retornar el usuario modificado,
    //es decir, los cambios que hicimos al registro del usuario. Es opcional
    //sino lo incluyo me devuelve el usuario original sin las modificaciones.
    //runValidators:true para que corra las reglas de validación
    Usuario.findByIdAndUpdate(id, body, {new:true,runValidators:true},(err,usuarioDB)=>{

        if (err) {
            return res.status(400).json({
                ok : false,
                err
            });
        }

        //devuelve por defecto un status 200
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});


//ELIMINAR
app.delete('/usuario/:id', [verificarToken, verificarAdminRole], (req, res) => {

    //información del PAYLOAD del TOKEN
    /*return res.json({
        usuario : req.usuario,
        nombre : req.usuario.nombre,
        email : req.usuario.email
    });*/

    //res.json('delete usuario');
    let id = req.params.id;//para obtener el parametro que pasamos por la url

    //callback para Eliminar físicamente
    //Usuario.findByIdAndRemove(id,(err,usuarioBorrado)=>{
    //callback para Eliminar logicamente (cambiamos el estatus del usuario)
    //estado que vamos a cambiar (lo pasamos como parametro al metodo findByIdAndUpdate() )
    let cambiaEstado = {
        estado : false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, {new:true}, (err,usuarioBorrado)=>{

        if (err) {
            return res.status(400).json({
                ok : false,
                err
            });
        }

        //cuando no conseguimos el usuario que quemos borrar
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok : false,
                err : {
                    message : 'usuario no encontrado'
                }
            });
        }

        //devuelve por defecto un status 200
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});

//exportamos
module.exports = app;
