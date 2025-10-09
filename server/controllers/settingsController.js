const Setting = require('../models/Setting');

const index = (req, res) => {
    Setting.find().sort({ createdAt: -1 })
        .then((result) => {
            res.status(200).json({ settings: result });
        })
        .catch((err) => {
            console.log(err) 
        });
}

const store = (req, res) => {
    const setting = new Setting(req.body); 
    setting.save()
        .then((result) => {
            res.status(200).json({ settings: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
        });
}

const update = (req, res) => {
    const id = req.params.id;
    const { location, time } = req.body;

    Setting.findByIdAndUpdate(
        id,
        { time, location },
        { new: true }
    )
        .then((result) => {
            res.status(200).json({ status: true, settings: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Server Error' });
        })
    
}

const destroy = (req, res) => {
    const id = req.params.id;
    Setting.findByIdAndDelete(id)
        .then((result) => {
            res.json({ status: true });
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
        })
}

module.exports = { index, store, destroy, update }