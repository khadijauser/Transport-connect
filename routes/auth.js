const express = require('express');
const { check } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  createAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
  check('firstName', 'Le prénom est requis').not().isEmpty(),
  check('lastName', 'Le nom est requis').not().isEmpty(),
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('phone', 'Le numéro de téléphone est requis').not().isEmpty(),
  check('password', 'Veuillez entrer un mot de passe de 6 caractères ou plus').isLength({ min: 6 })
];

const loginValidation = [
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Le mot de passe est requis').exists()
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/create-admin', registerValidation, createAdmin);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router; 