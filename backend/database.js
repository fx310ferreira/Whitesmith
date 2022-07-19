const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/circuitapp'); 

const userSchema = mongoose.Schema({
    username: String,
    password: String
})

const UserModel = mongoose.model('users', userSchema);

module.exports = UserModel;