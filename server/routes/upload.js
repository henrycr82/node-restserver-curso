//requires
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

//modelos
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

//importamos el Path y File System
const fs = require('fs');
const path = require('path');

// default options. Middleware
//Cuando llamamosla función fileUpload() todos los archivos que se cargen caen req.files
app.use(fileUpload());


app.put('/upload/:tipo/:id', function(req, res) {
	
	let tipo = req.params.tipo;//obtenemos el tipo (solo hay dos carpetas (productos y usuarios) es necesario saber en cual carpeta se guardara la imagen que subamos)
    	let id = req.params.id;//obtenemos el id de usuario que enviamos por la url

	//Sino se ha seleccionado ningún archivo
	if (!req.files) {
        	return res.status(400)
        		.json({
         			ok: false,
        			err: {
         				message: 'No se ha seleccionado ningún archivo'
          			}
         		});
	}

	// Valida tipo
    	let tiposValidos = ['productos', 'usuarios'];
    	if (tiposValidos.indexOf(tipo) < 0) {
        	return res.status(400).json({
            		ok: false,
            		err: {
                		message: 'Los tipos permitidas son ' + tiposValidos.join(', ')
            		}
        	})
    	}

	//el archivo que subimos. 'archivo' es el nombre del input
	let archivo = req.files.archivo;

	//Para obtener la extención del archivo
	let nombreCortado = archivo.name.split('.');
    	let extension = nombreCortado[nombreCortado.length - 1];

	// Extensiones permitidas
    	let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

	//Validamos que el archivo tenga una extención permitida
	if (extensionesValidas.indexOf(extension) < 0) {
        	return res.status(400).json({
            		ok: false,
            		err: {
                		message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                		ext: extension
            		}
       		})
    	}

	// Cambiar nombre al archivo
    	let nombreArchivo = `${ id }-${ new Date().getMilliseconds()  }.${ extension }`;
	
	//movemos el archivo que subimos a la carpeta 'uploads/tipo/'
	//solo hay dos directorios permitidos 'productos' y  'usuarios'
	//archivo.mv('uploads/filename.jpg', (err) => {
	//archivo.mv(`uploads/${ tipo }/${ archivo.name }`, (err) => {
	archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {

		//Si ocurre algún error
		if (err)
			return res.status(500).json({
                		ok: false,
                		err
        		 });
	
		// Aqui, imagen cargada
        	if (tipo === 'usuarios') {
            		imagenUsuario(id, res, nombreArchivo);
        	} else {
            		imagenProducto(id, res, nombreArchivo);
        	}

	});

});


function imagenUsuario(id, res, nombreArchivo) {

	//Busco el usuario en la base de datos
	Usuario.findById(id, (err, usuarioDB) => {

		//Si sucede algun error        	
		if (err) {
            		//borramos la imagen que subio el usuario
			borraArchivo(nombreArchivo, 'usuarios');

            		return res.status(500).json({
                		ok: false,
                		err
            		});
        	}

		//Si el usuario no existe
        	if (!usuarioDB) {
			//borramos la imagen que subio el usuario
            		borraArchivo(nombreArchivo, 'usuarios');

           	 	return res.status(400).json({
                		ok: false,
                		err: {
                    			message: 'Usuaro no existe'
                		}
            		});
        	}

		//borramos la imagen que tenia el usuario en la carpeta 'usuarios'
        	borraArchivo(usuarioDB.img, 'usuarios')

		//seteo el nombre del archivo
        	usuarioDB.img = nombreArchivo;

		//guardamos en la BD
        	usuarioDB.save((err, usuarioGuardado) => {

            		res.json({
                		ok: true,
                		usuario: usuarioGuardado,
                		img: nombreArchivo
            		});

        	});

   	 });
}

function imagenProducto(id, res, nombreArchivo) {

	//Busco el usuario en la base de datos
	Producto.findById(id, (err, productoDB) => {
		//Si sucede algun error 
	        if (err) {
	        	//borramos la imagen que subio el usuario
			borraArchivo(nombreArchivo, 'productos');
	
	            	return res.status(500).json({
	                	ok: false,
	               	 	err
	            	});
        	}

		//Si el producto no existe
	        if (!productoDB) {
			//borramos la imagen que subio el usuario
			borraArchivo(nombreArchivo, 'productos');
	
	            	return res.status(400).json({
	                	ok: false,
	                	err: {
	                    		message: 'El Producto no existe'
	               	 	}
	            	});
        	}

		//borramos la imagen que tenia el producto en la carpeta 'productos'
        	borraArchivo(productoDB.img, 'productos')

		//seteo el nombre del archivo
        	productoDB.img = nombreArchivo;

		//guardamos en la BD
        	productoDB.save((err, productoGuardado) => {

			res.json({
		        	ok: true,
		                producto: productoGuardado,
		                img: nombreArchivo
       			});

        	});

	});

}


function borraArchivo(nombreImagen, tipo) {

	//armamos el path donde se puede encontrar la imagen
	let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    	//validamos que exista la imagen. True si existe o False sino Existe
	if (fs.existsSync(pathImagen)) {
        	//borramos la imagen
		fs.unlinkSync(pathImagen);
    	}
}


//exportamos
module.exports = app;