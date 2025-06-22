const express = require('express');
const { check } = require('express-validator');
const {
  createRequest,
  getRequests,
  getRequest,
  updateRequestStatus,
  addMessage
} = require('../controllers/requests');
const { protect, authorizeRoles } = require('../middleware/auth'); 

const router = express.Router();

const requestValidation = [
  check('announcement', 'L\'annonce est requise').not().isEmpty(),
  check('cargoDetails.dimensions.length', 'La longueur est requise').isNumeric(),
  check('cargoDetails.dimensions.width', 'La largeur est requise').isNumeric(),
  check('cargoDetails.dimensions.height', 'La hauteur est requise').isNumeric(),
  check('cargoDetails.weight', 'Le poids est requis').isNumeric(),
  check('cargoDetails.type', 'Le type de marchandise est requis').not().isEmpty(),
  check('cargoDetails.description', 'La description est requise').not().isEmpty(),
  check('price', 'Le prix est requis').isNumeric()
];

const statusValidation = [
  check('status', 'Le statut est requis')
    .isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled'])
];

const messageValidation = [
  check('content', 'Le contenu du message est requis').not().isEmpty()
];

router
  .route('/')
  .get(protect, getRequests)
  .post(protect, authorizeRoles('conducteur'), requestValidation, createRequest);

router
  .route('/:id')
  .get(protect, getRequest);

router
  .route('/:id/status')
  .put(protect, authorizeRoles('conducteur'), statusValidation, updateRequestStatus);

router
  .route('/:id/messages')
  .post(protect, messageValidation, addMessage);

module.exports = router;
