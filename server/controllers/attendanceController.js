const Attendance = require('../models/Attendance');

const index = async (req, res) => {
    Attendance.find().sort({ createdAt: -1 })
        .then((result) => {
            res.status(200).json({ attendance: result });
        })
        .catch((err) => {
            console.log(err); 
        });
}

const userAttendance = async (req, res) => {
    const { email, date} = req.query;
    const existingRecord = await Attendance.findOne({ email, date });

    if (existingRecord) {
        return res.status(200).json({
            status: true,
            attendance: existingRecord,
        });
    }
}

const mark = async (req, res) => {
    try {
        const { email, date } = req.body;

        // Check if the user already marked attendance for the day
        const existingRecord = await Attendance.findOne({ email, date });

        if (existingRecord) {
            return res.status(400).json({
                status: false,
                message: "Attendance already marked for today.",
            });
        }

        // Else, save the new attendance record
        const attendance = new Attendance(req.body);
        await attendance.save();

        return res.status(200).json({ status: true, message: "Attendance marked successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: false,
            message: "Server Error",
        });
    }
}

module.exports = { index, mark, userAttendance }