//puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//seed de autenticación
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//vencimiento del jsonwebtoken
//60 segundos * 60 minutos * 24 horas * 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//Base de datos
let urlDB;


if (process.env.NODE_ENV==='dev') {
    urlDB='mongodb://localhost:27017/cafe';
} else {
    urlDB=process.env.MONGO_URI;//process.env.MONGO_URI variable de entorno personalizadas Heroku para laurl de conexión de producción
}

//guardamos la cadena de conexión de la base de datos
process.env.URLDB = urlDB;

//Google Client ID
process.env.CLIENT_ID = process.env.CLIENT_ID  || '885503305057-l31a0imro6v3tktuhfgep60kglv9elv8.apps.googleusercontent.com';

