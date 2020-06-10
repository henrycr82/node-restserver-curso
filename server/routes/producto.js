const express = require('express');

//importamos por destruccturing
let {  verificarToken} = require('../middlewares/autenticacion');


let app = express();
let Producto = require('../models/producto');


// ===========================
//  Obtener productos
// ===========================
app.get('/productos', verificarToken, (req, res) => {

    //Obtengo el valor 'desde' desde los query (es opcional)
    let desde = req.query.desde || 0;
    desde = Number(desde);//lo transformo a número

    //callback para buscar. Traeremos solo los productos disponibles (disponible: true)
    Producto.find({ disponible: true })
        .skip(desde)//para saltar de página
        .limit(10)//para mostrar los registros de 10 en 10
        .populate('usuario', 'nombre email')//me trae el 'nombre y email' de la colección 'usuario' 
        .populate('categoria', 'descripcion')//me trae la 'descripcion' de la colección 'categoria' 
         //.exec ejecuta nuestra consulta
        .exec((err, productos) => {
           
            //Si sucede algún error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            //Retornamos todos los productos
            res.json({
                ok: true,
                productos
            });


        })

});

// ===========================
//  Obtener un producto por ID
// ===========================
app.get('/productos/:id', verificarToken,  (req, res) => {

    let id = req.params.id;//obtenemos el id que enviamos por la url

    //callback para buscar por el ID el producto
    Producto.findById(id)
        .populate('usuario', 'nombre email') //me trae el 'nombre y email' de la colección 'usuario' 
        .populate('categoria', 'descripcion')//me trae la 'descripcion' de la colección 'categoria' 
         //.exec ejecuta nuestra consulta
     	.exec((err, productoDB) => {

	        //Si sucede algún error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

	        //Si no existe el ID del producto
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID del producto no existe'
                    }
                });
            }

	        //Retornamos el producto
            res.json({
                ok: true,
                producto: productoDB
            });

        });

});

// ===========================
//  Buscar productos
// ===========================
app.get('/productos/buscar/:termino', verificarToken, (req, res) => {

    let termino = req.params.termino;//obtenemos el termino(cadena que deseamos buscar) que enviamos por la url

    //expresión regular para realizar la busqueda
    //el parametro 'i' es para que sea insensible a mayúsculas o minúsculas
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')//me trae la 'descripcion' de la colección 'categoria' 
         //.exec ejecuta nuestra consulta
        .exec((err, productos) => {

            //Si sucede algún error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
	        //Retornamos el producto que cumpla con las condiciones de busqueda
            res.json({
                ok: true,
                productos
            })

        })


});



// ===========================
//  Crear un nuevo producto
// ===========================
app.post('/productos', verificarToken, (req, res) => {

    let body = req.body; //Obtengo todo el body

    //Creo una nueva instancia del modelo Producto
    //tengo el acceso al  usuario._id a través del middleware verificarToken
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    //callback para guardar
    producto.save((err, productoDB) => {

        //Si sucede algún error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

       //Si se creo el producto. estatus 201 es para cuando se crea un nuevo registro de manera exitosa
        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});

// ===========================
//  Actualizar un producto
// ===========================
app.put('/productos/:id', verificarToken, (req, res) => {

    let id = req.params.id;//obtenemos el id que enviamos por la url
    let body = req.body;//Obtengo todo el body

    //callback para buscar por Id del producto
     Producto.findById(id, (err, productoDB) => {
	
        //si existe algún error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

	    //si no existe el producto
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID del producto no existe'
                }
            });
        }

	    //Seteamos los campos
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        //callback para guardar 
        productoDB.save((err, productoGuardado) => {
		
	        //si existe algún error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            //Si se guardo correctamente
            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    });


});

// ===========================
//  Borrar un producto
// ===========================
app.delete('/productos/:id', verificarToken, (req, res) => {

    let id = req.params.id;//obtenemos el id que enviamos por la url

    //callback para buscar por Id del producto
    Producto.findById(id, (err, productoDB) => {
	
	    //si sucede algún error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

	    //Si no existe el producto
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID del producto no existe'
                }
            });
        }

	    //cambiomos la disponibilidad de true a false
        productoDB.disponible = false;

	    //callback para guardar
        productoDB.save((err, productoBorrado) => {

            //si sucede algún error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

	        //Notificamos que eliminamos el producto (Cambiamos de estatus)
            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });

        })

    })


});


module.exports = app;
