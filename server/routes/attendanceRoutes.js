const { Router } = require('express');
const attendanceController = require('../controllers/attendanceController');

const router = Router();

router.get('', attendanceController.index);
router.get('/user-attendance', attendanceController.userAttendance);
router.post('/mark', attendanceController.mark);

module.exports = router; 