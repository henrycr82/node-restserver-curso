//puerto
process.env.PORT = process.env.PORT || 3000;

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//Base de datos
let urlDB;


if (process.env.NODE_ENV==='dev') {
    urlDB='mongodb://localhost:27017/cafe';
} else {
    urlDB='mongodb+srv://castroh:GC1xe2A6vNg9rPcS@cluster0-oqqgl.mongodb.net/cafe?retryWrites=true&w=majority';
}

//guardamos la cadena de conexión de la base de datos
process.env.URLDB = urlDB;
