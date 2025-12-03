const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, contentController.getOwnContents);
router.get('/:id', auth, contentController.getOne);
router.post('/', auth, contentController.create);
router.put('/:id', auth, contentController.update);
router.delete('/:id', auth, contentController.delete);

module.exports = router;
