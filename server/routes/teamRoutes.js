const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/authMiddleware');

// Semua route dilindungi auth
router.get('/', auth, teamController.getAll);
router.get('/:id', auth, teamController.getOne);
router.post('/', auth, teamController.create);
router.put('/:id', auth, teamController.update);
router.delete('/:id', auth, teamController.delete);

module.exports = router;
