import express from 'express';

import { onlyAuthorized } from '../controllers/authController';
import {
  createReservation,
  getAllReservations,
  getReservation,
  deleteReservation,
  updateReservation,
} from '../controllers/reservationController';

const router = express.Router();

router.use(onlyAuthorized);

router.post('/', createReservation);
router.get('/:id', getReservation);
router.patch('/:id', updateReservation);
router.delete('/:id', deleteReservation);
router.get('/', getAllReservations);

export default router;
