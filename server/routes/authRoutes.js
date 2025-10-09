const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get("/current-user", authController.checkCurrentUser);
router.get("/logout", authController.logout);
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);

module.exports = router;