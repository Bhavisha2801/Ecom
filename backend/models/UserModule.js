const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: Number, required: true },
    password: { type: String, required: true },
    confirmpassword: { type: String },
    notarobot: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;