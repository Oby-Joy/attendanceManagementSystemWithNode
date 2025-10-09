const { Router } = require('express');
const settingsController = require('../controllers/settingsController');

const router = Router();

router.get('/settings', settingsController.index);
router.post('/add-setting', settingsController.store);
router.put('/update-setting/:id', settingsController.update);
router.delete('/delete-setting/:id', settingsController.destroy);

module.exports = router;