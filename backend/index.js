const express = require('express');
const app = express();
const port = 5000;
const User = require('./models/UserModule');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "1d"});
}


app.use(express.json());
dotenv.config();
app.get('/', async () => {
    console.log('hello');
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // This should work if User is correctly defined
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1 - user - fill in data through form
// 2 - identify if user already exist or not - if yes - error - go to login
// 3 - user data save - status & message - 201 - user registered successfully

app.post('/api/register', async (req, res) => {
    // user - name, email, number, password, confirm password, not a robot,
    let existinguser = await User.findOne({ email: req.body.email })
    if(existinguser){
        res.status(400).json({ 'error': 'user already exist' });
    }

    if(req.body.password !== req.body.confirmpassword){
        res.status(400).json({ 'error': 'confirm password is different from password' });
    }

    let salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        number: req.body.number,
        password: password,
        confirmpassword: password,
        notarobot: req.body.notarobot,
    });

    await user.save();

    return res.status(201).json({
        status: 201,
        message: 'user registered successfully',
        user: {...user._doc, token: generateToken(user._id)}
    })
});

// email and password --
// user of same email is there? , password is matching with that by encrypt password
// token generate 

app.post('/api/login', async (req, res) => {
    const existinguser = await User.findOne({ email: req.body.email });

    if(!existinguser){
        res.status(400).json({
            status: 400,
            error: 'User does not exist, Please register'
        });
    }

    let passwordValidation = await bcrypt.compare(req.body.password, existinguser.password);
    console.log(passwordValidation,'---')

    if(!passwordValidation){
        res.status(400).json({
            status: 400,
            error: 'Password is incorrect'
        });
    }

    return res.status(200).json({
        status: 200,
        message: 'user loggedin successfully',
        user: {...existinguser._doc, token: generateToken(existinguser._id)}
    })
});

mongoose.connect(`${process.env.MONGODB_DATABASE_URL}`).then(() => {
    console.log('connected')
}).catch((err) => {
    console.log(err)
})

app.listen(port, () => {
    console.log('Server is running on port ', port);
})
