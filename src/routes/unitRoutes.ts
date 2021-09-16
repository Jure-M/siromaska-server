import express from 'express';

import { onlyAuthorized } from '../controllers/authController';
import {
  createUnit,
  getUnit,
  getAllUnits,
  deleteUnit,
  updateUnit,
} from '../controllers/unitController';

const router = express.Router();

router.use(onlyAuthorized);

router.post('/', createUnit);
router.get('/', getAllUnits);
router.get('/:id', getUnit);
router.delete('/:id', deleteUnit);
router.patch('/:id', updateUnit);

export default router;
