//Requires
const express = require('express');

//importamos por destruccturing
let {  verificarToken, verificarAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


// Mostrar todas las categorias
app.get('/categoria', verificarToken, (req, res) => {
	//callback listar todas categoria
    	Categoria.find({})
       	 	.sort('descripcion')//para ordenar la consulta alfabeticamente por la descripción de las categoria
        	.populate('usuario', 'nombre email')//me trae el 'nombre y email' de la colección 'usuario' (El usuario que creo la categoria).  si no especicifo los campos 'nombre y email' me trae todos los campos de la colección 'usuario'. El 'Id' se carga por defecto 
        	 //.exec ejecuta nuestra consulta
		.exec((err, categorias) => {
			//Si sucede algún error
            		if (err) {
		                return res.status(500).json({
		                    	ok: false,
		                    	err
                		});
            		}
			//Retornamos las categorias
           		res.json({
                		ok: true,
                		categorias
           		 });
        })
});



// Mostrar una categoria por ID
app.get('/categoria/:id', verificarToken, (req, res) => {

	    let id = req.params.id;//obtenemos el id que enviamos por la url
	    //callback para Buscar por ID y mostra una categoria
	    Categoria.findById(id, (err, categoriaDB) => {
	
	        	//Si sucede algún error
			if (err) {
	            		return res.status(500).json({
	               	 		ok: false,
	                		err
	            		});
	        	}
			
			//Si no Existe la categoria
	       	 	if (!categoriaDB) {
	            		return res.status(500).json({
	                		ok: false,
	                		err: {
	                    			message: 'El ID no es correcto'
	               			 }
	           		 });
	        	}
	
			//Retornamos la categoria
	        	res.json({
	            		ok: true,
	            		categoria: categoriaDB
	       		 });
	
    		});
});


// Crear nueva categoria
app.post('/categoria', verificarToken, (req, res) => {
    
	//Obtengo todo el body
	let body = req.body;

  	 //Creo una nueva instancia del modelo Categoria
   	//tengo el acceso al  usuario._id a través del middleware verificarToken
    	let categoria = new Categoria({
        	descripcion: body.descripcion,
        	usuario: req.usuario._id
   	});

	//Guardamos
   	 //callback para guardar
    	//err: error
   	//categoriaDB: categoria almacenada
    	categoria.save((err, categoriaDB) => {

        	//Si sucede algún error
		if (err) {
            		return res.status(500).json({
                		ok: false,
                		rr
           		 });
        	}

		//Si no se crea la categoria
       		if (!categoriaDB) {
            		return res.status(400).json({
                		ok: false,
                		err
           		 });
        	}

		//Si se creo la categoria
       		res.json({
            		ok: true,
            		categoria: categoriaDB
       		 });
    	});

});

// Actualizar una categoria
app.put('/categoria/:id', verificarToken, (req, res) => {
	
	let id = req.params.id;//obtenemos el id que enviamos por la url
    	let body = req.body;

	//descCategoria contiene la descripcion que nos llega por el body
    	let descCategoria = {
        	descripcion: body.descripcion
    	};

	//callback para buscar por Id y Actualiar una categoria
    	Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        	
		//Si sucede algún error
		if (err) {
            		return res.status(500).json({
                		ok: false,
                		err
           		 });
        	}
		
		//Si no existe la categoria
	        if (!categoriaDB) {
	            	return res.status(400).json({
	                	ok: false,
	               	 	err: {
	                		message: 'El id no existe'
	                	}
	           	 });
       		}

		//Si se actualizó la categoria
        	res.json({
            		ok: true,
            		categoria: categoriaDB
        	});
    	});


});


// Eliminar una categoria
app.delete('/categoria/:id', [verificarToken, verificarAdminRole], (req, res) => {
	// solo un administrador puede borrar categorias

   	let id = req.params.id;//obtenemos el id que enviamos por la url

	//callback para buscar por Id y Eliminar una categoria
    	Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
		//Si sucede algún error
	        if (err) {
	        	return res.status(500).json({
	                	ok: false,
	                	err
	            	});
	        }
		//Si no existe la categoria
	        if (!categoriaDB) {
	        	return res.status(400).json({
	                	ok: false,
	                	err: {
	                		message: 'El id no existe'
	                	}
	            	});
	        }
		//Si se Eliminó la categoria
	        res.json({
	        	ok: true,
	            	message: 'Categoria Borrada'
       		 });

    });


});


module.exports = app;