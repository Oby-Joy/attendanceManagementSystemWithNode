const User = require('../models/User');

const index = (req, res) => {
    User.find()
        .then((users) => {
            res.status(200).json({ users })
        })
        .catch((err) => {
            console.log(err)
        })
}

module.exports = { index }