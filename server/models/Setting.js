const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    longitude: {
        type: Number,
        required: [true, "Please enter a location"],
    },
    latitude: {
        type: Number,
        required: [true, "Please enter a location"],
    },
    time: {
        type: String,
        required: true
    }
});

const Setting = mongoose.model('settings', settingSchema);

module.exports = Setting;