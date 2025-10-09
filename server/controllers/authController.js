const User = require('../models/User')
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    //incorrect email
    if(err.message === 'incorrect email'){
        errors.email = 'that email is not registered'; 
    }

    if(err.message === 'incorrect password'){
        errors.password = 'that password is incorrect'; 
    }

    //duplicate error code
    if(err.code == 11000) {
        errors.email = "that email is already registered";
        return errors;
    }

    //validation errors
    if(err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        });  
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'my personal secret token', {
        expiresIn: maxAge
    });
}

//check current user to protect routes
const checkCurrentUser = (req, res) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, 'my personal secret token', async (err, decodedToken) => {
            if(err) {
                return res.status(401).json({ user: null });
            }
            else{
                try {
                    const user = await User.findById(decodedToken.id).select("name email role");
                    return res.json({ user });
                } catch (error) {
                    return res.status(500).json({ user: null });
                }
            }
        })
    }
    else{
        return res.status(401).json({ user: null });
    }
}

const signUp = async (req, res) => {
    const { email, password, name } = req.body;
    
    try{
        const user = await User.create({ name, email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user: user });
    }
    catch(err) {
        const errors = handleErrors(err)
        console.log(err)
        res.status(400).json({ err });
    }
}

const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({ user: user }); 
    }
    catch(error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

const logout = async(req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.status(200).json({ status: true }); 
}

module.exports = { signUp, signIn, logout, checkCurrentUser }