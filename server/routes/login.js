//requires
const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');//importamos por destruccturing
const client = new OAuth2Client(process.env.CLIENT_ID);//process.env.CLIENT_ID varible global (server/config/config.js)


const Usuario = require('../models/usuario');//Modelo Usuario
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

//Configuraciones de Google
async function verify(token) {
	const ticket = await client.verifyIdToken({
      		idToken: token,
      		audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
 	});

  	const payload = ticket.getPayload();
  	/*console.log(payload.name);
	console.log(payload.email);
	console.log(payload.picture);*/

	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true
	}
}


app.post('/google', async (req,res) => {

	//recibimos el token de la página public/index.html
	let token = req.body.idtoken;

	//verificamos el token
	let googleUser = await verify(token)
		.catch(e => {
			return res.status(403).json({
				ok: false,
				err: e
			});
		});

    //Validamos la exitencia del usuario en la BD
    Usuario.findOne({email:googleUser.email},(err, usuarioDB) => {

        //Si ocurre algún error
        if (err) {
            return res.status(500).json({
                ok : false,
                err
            });
        }

        //Si existe el usuario en la BD
        if (usuarioDB) {

            //Si no es un usuario logeado con Google
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok : false,
                    err : {
                        message : 'Debe de usar su autenticación Normal'
                    }
                });
            } else { //Si es un usuario logeado con Google (renovamos el token)
                //Generamos el jsonwebtoken
                let token = jwt.sign({
                  //este es nuestro PAYLOAD
                  usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });//la variable global process.env.CADUCIDAD_TOKEN se encuantra en server/config/config.js

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else { //Si no existe el Usuario en a BD

            //creamos el usuario en la BD

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';//este campo también lo seteamos porque es requerido

            //guardamos
            usuario.save((err,usuarioDB)=>{

                //Si ocurre algún error
                if (err) {
                    return res.status(500).json({
                        ok : false,
                        err
                    });
                }

                //Generamos el jsonwebtoken
                let token = jwt.sign({
                  //este es nuestro PAYLOAD
                  usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });//la variable global process.env.CADUCIDAD_TOKEN se encuantra en server/config/config.js

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });

});

//exportamos
module.exports = app;
