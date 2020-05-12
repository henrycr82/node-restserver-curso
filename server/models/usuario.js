//requires
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
//para el esquema
let Schema = mongoose.Schema;

//Roles válidos
let rolesValidos = {
    values : ['USER_ROLE','ADMIN_ROLE'],
    message : 'Error, el rol {VALUE} no es válido.'
};

//creamos las reglas de validación para las operaciones crud
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique : true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'El password es necesario']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

//para eliminar el password del objeto que retornamos
//El metodo toJSON siempre se llama en un esquema cuando deseamos imprimir
//Usamos una función normal y no un arrow function para no tener problemas con el (this)
usuarioSchema.methods.toJSON = function () {
    let user = this; //tomamos todo lo que tenga el this
    let userObject = user.toObject();//tomamos el objeto del usuario (todas las propiedades y metodos)
    delete userObject.password;//eliminamos del objeto la contraseña

    return userObject;

}

//mensaje de error personalizado (campo único)
//usuarioSchema.plugin(uniqueValidator,'{PATH} debe ser único');
usuarioSchema.plugin(uniqueValidator, { message: 'Error, el campo {PATH} debe ser único.' });
//exportamos el modelo
module.exports = mongoose.model('Usuario',usuarioSchema);
