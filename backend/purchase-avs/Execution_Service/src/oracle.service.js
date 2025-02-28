require('dotenv').config();
const axios = require("axios");



  //use the order hash to look at IPFS for the items ordered and other details
  //returns products and quantity
  
  async function orderHash(cid) {
    try {
      const { data } = await axios.get("https://othentic.mypinata.cloud/ipfs/" + cid);
      

      console.log("orderHash", data);
      return data;
      
    } catch (err) {
      return null;
    }
  }


  function transformZincResponse(zincResponse) {
    // Create a map to store product_id counts
    const productMap = new Map();
    if (!zincResponse || !Array.isArray(zincResponse.tracking)) {
      console.error("Invalid Zinc response: Missing tracking data.");
      return null;
    }

    // Loop through the tracking array
    zincResponse.tracking.forEach(item => {
        const productId = item.product_id;
        productMap.set(productId, (productMap.get(productId) || 0) + 1);
    });

    // Convert the map to an array of objects
    const transformedProducts = Array.from(productMap, ([product_id, quantity]) => ({
        product_id,
        quantity
    }));

    return transformedProducts;
}

  //calls zinc's api to check the reciept ordered
  //eg:  curl "https://api.zinc.io/v1/orders/hash" -u ZINC_API_KEY

  async function zincReceipt(hash) {
    const apiKey = process.env.ZINC_API_KEY;
    try {
      const { data } = await axios.get("https://othentic.mypinata.cloud/ipfs/" + hash);
      console.log("zincReceipt", data);
      const transformedProducts = transformZincResponse(data);
      console.log(transformedProducts);

      // const response = await axios.get(`https://api.zinc.io/v1/orders/${hash}`, {
      //   headers: {
      //     Authorization: `Bearer ${apiKey}`
      //   }
      // });

      return transformedProducts;
    } catch (error) {
      console.error('Error fetching zinc receipt:', error);
    }
    return null;
  }
  //compares the two reciepts and returns anything that is different
  async function compareReceipts(ipfsHash, zincHash) {
    const ipfsProducts = await orderHash(ipfsHash);
    const zincProducts = await zincReceipt(zincHash);



    // Ensure both responses are valid
    if (!ipfsProducts || !zincProducts) {
        console.log('One of the receipts is null/undefined');
        return false;
    }

    // Check if the number of unique products is the same
    if (ipfsProducts.length !== zincProducts.length) {
        console.log('Different number of products:');
        console.log(`IPFS products length: ${ipfsProducts.length}`);
        console.log(`Zinc products length: ${zincProducts.length}`);
        return false;
    }

    // Create a lookup map from Zinc receipt for quick comparison
    const zincProductMap = new Map(
        zincProducts.map(product => [product.product_id, product.quantity])
    );

    console.log('Zinc Product Map:', Object.fromEntries(zincProductMap));

    // Compare each product in the IPFS list with the Zinc receipt
    const allMatch = ipfsProducts.every(ipfsProduct => {
        const zincQuantity = zincProductMap.get(ipfsProduct.product_id);

        if (zincQuantity === undefined) {
            console.log(`Product ID ${ipfsProduct.product_id} not found in Zinc receipt`);
            return false;
        }
        if (ipfsProduct.quantity !== zincQuantity) {
            console.log(`Quantity mismatch for product ${ipfsProduct.product_id}:`);
            console.log(`IPFS quantity: ${ipfsProduct.quantity}`);
            console.log(`Zinc quantity: ${zincQuantity}`);
            return false;
        }
        return true;
    });

    return allMatch;
}
  

module.exports = {
  compareReceipts,  
}