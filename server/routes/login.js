//requires
const express = require('express');
const Usuario = require('../models/usuario');//Modelo Usuario
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.post('/login',(req,res) => {


    let body = req.body;

    //Buscamos el usuario en la db mediante el campo email
    //Si el usuario exite lo retornamos usuarioDB
    //El return me retorna un valor y finaliza la ejecución del código
    Usuario.findOne({ email: body.email }, (err, usuarioDB)=>{

        //Si ocurre algún error
        if (err) {
            return res.status(500).json({
                ok : false,
                err
            });
        }

        //Si el usuario no Existe
        if (!usuarioDB) {
            return res.status(400).json({
                ok : false,
                err : {
                    message : '(Usuario) o contraseña invalidos'
                }
            });
        }

        //Si la contraseña que recibimos por el body No coincide con la almacenada en la BD
        //retornamos un False
        if (!bcrypt.compareSync(body.password,usuarioDB.password)) {
            return res.status(400).json({
                ok : false,
                err : {
                    message : 'Usuario o (contraseña) invalidos'
                }
            });
        }

        //Generamos el jsonwebtoken
        let token = jwt.sign({
          //este es nuestro PAYLOAD
          usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });//la variable global process.env.CADUCIDAD_TOKEN se encuantra en server/config/config.js

        //token es el TOKEN de seguridad
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });


});


//exportamos
module.exports = app;
