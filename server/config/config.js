//puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//Base de datos
let urlDB;


if (process.env.NODE_ENV==='dev') {
    urlDB='mongodb://localhost:27017/cafe';
} else {
    urlDB=process.env.MONGO_URI;//process.env.MONGO_URI variable de entorno personalizadas Heroku para laurl de conexión de producción
}

//guardamos la cadena de conexión de la base de datos
process.env.URLDB = urlDB;
