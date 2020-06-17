//requires
const express = require('express');

//importamos el Path y File System
const fs = require('fs');
const path = require('path');

//importamos por destruccturing
const { verificaTokenImg } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
	let tipo = req.params.tipo;//para obtener el parametro 'tipo' que pasamos por la url
    	let img = req.params.img;//para obtener el parametro 'img' que pasamos por la url

	//construimos el path de la imagen dinamica (cuando existe en los directorios uploads/usuarios o uploads/productos)
   	let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

	//Si la imagen existe en uploads/usuarios o uploads/productos
    	if (fs.existsSync(pathImagen)) {
        	res.sendFile(pathImagen);//regresamos el Content-Type del archivo
    	} else {//Caso contrario
        	let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');//path de la imagen estatica (server/assets)
        	res.sendFile(noImagePath);//regresamos el Content-Type del archivo
    	}
});


//exportamos
module.exports = app;