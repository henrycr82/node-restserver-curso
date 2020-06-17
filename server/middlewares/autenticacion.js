//requires
const jwt = require('jsonwebtoken');

//Verificar TOKEN
let verificarToken = (req, res, next) => {

    let token = req.get('token');//para leer la variable token viene por el Headers

    /*
    Función para verificar el TOKEN
    Parametros:
    token: token que viene por el Headers
    process.env.SEED: seed de autenticación (server/config/config.js)
    callback(err,decoded)
    err: ERROR
    decoded: Información decodificada
    */
    jwt.verify(token,process.env.SEED,(err,decoded)=>{

        if(err){
            //No autorizado
            return res.status(401).json({
                ok : false,
                err : {
                    message : 'Token no válido'
                }
            });
        }

        //decoded.usuario PAYLOAD con la información del usuario decodificada
        req.usuario = decoded.usuario;
        next();//para que se siga ejecuando el contenido de la función en donde se invoque el Middleware
    });

};

//Verifica ADMIN_ROLE
let verificarAdminRole = (req, res, next) => {

    //Leemos el usuario
    let usuario = req.usuario;

    //validamos que el usuario sea administrador
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok : false,
            err: {
                message : 'Necesita privilegios de Administrador para realizar esta acción'
            }
        });
    }

}


// Verifica token para imagen
let verificaTokenImg = (req, res, next) => {

	let token = req.query.token;//obtenemos el parametro token que viene por la url
	
	/*
    	Función para verificar el TOKEN
    	Parametros:
    	token: token que viene por la url
    	process.env.SEED: seed de autenticación (server/config/config.js)
    	callback(err,decoded)
    	err: ERROR
    	decoded: Información decodificada
    	*/
	jwt.verify(token, process.env.SEED, (err, decoded) => {
	
	//Si sucede algun error. Token no válido
	if (err) {
		return res.status(401).json({
			ok: false,
			err: {
				message: 'Token no válido'
			}
	    	});
	}
	
	//decoded.usuario PAYLOAD con la información del usuario decodificada
	req.usuario = decoded.usuario;
	//para que se siga ejecuando el contenido de la función en donde se invoque el Middleware
	next();

 	});
}


module.exports = {
    	verificarToken,
    	verificarAdminRole,
	verificaTokenImg
}
