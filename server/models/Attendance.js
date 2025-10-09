const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    check_in: {
        type: String,
        required: true
    },
    notes: {
        type: String,
    }
});

const Attendance = mongoose.model('attendances', attendanceSchema);

module.exports = Attendance;