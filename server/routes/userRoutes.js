const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// Semua route dilindungi auth
router.get('/', auth, userController.getAll);
router.get('/:id', auth, userController.getOne);
router.post('/', auth, userController.create);
router.put('/:id', auth, userController.update);
router.delete('/:id', auth, userController.delete);

module.exports = router;
