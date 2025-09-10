import express from 'express';
import { searchProducts, getMapData } from '../controllers/searchController.js';

const router = express.Router();

router.post('/', searchProducts);
router.get('/map-data', getMapData);

export default router;