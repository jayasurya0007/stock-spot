//routes/search.js

import express from 'express';
import { 
  searchProducts, 
  getMapData, 
  searchMerchantsByCity, 
  searchMerchantsByLocation,
  getMerchantProducts 
} from '../controllers/searchController.js';

const router = express.Router();

router.post('/', searchProducts);
router.get('/map-data', getMapData);
router.post('/merchants/city', searchMerchantsByCity);
router.post('/merchants/location', searchMerchantsByLocation);
router.get('/merchants/:merchantId/products', getMerchantProducts);

export default router;