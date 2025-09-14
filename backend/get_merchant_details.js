import Merchant from './models/Merchant.js';

async function getMerchantDetails() {
  try {
    const merchant = await Merchant.findById(4);
    if (merchant) {
      console.log('🏪 Happy Kids merchant details:');
      console.log('ID:', merchant.id);
      console.log('Email:', merchant.email || 'Not set');
      console.log('Shop Name:', merchant.shop_name);
      console.log('Phone:', merchant.phone);
      console.log('Owner:', merchant.owner_name);
      console.log('Address:', merchant.address);
    } else {
      console.log('❌ Merchant with ID 4 not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

getMerchantDetails();