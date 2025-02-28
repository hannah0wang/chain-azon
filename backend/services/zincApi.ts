import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const ZINC_API_KEY = process.env.ZINC_API_KEY || "";
const BASE_URL = "https://api.zinc.io/v1";

/**
 * Search for a product on Zinc API.
 * @param query - The search query (product name).
 * @param retailer - The retailer to search (e.g., "amazon").
 * @param page - The results page number.
 * @returns - The first product in the list if available.
 */
async function searchProduct(
  query: string,
  retailer: string = "amazon",
  page: number = 1
) {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: { query, page, retailer },
      auth: { username: ZINC_API_KEY, password: "" },
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0]; // List of search results
    } else {
      return "No products found.";
    }
  } catch (error: any) {
    return `Error: ${error.response?.status} - ${error.response?.data}`;
  }
}

/**
 * Place an order on Zinc API.
 * @param retailer - The retailer of the product to order.
 * @param productId - The ID of the product to order.
 * @param quantity - The quantity to order.
 * @param shippingAddress - The shipping address object.
 * @param paymentMethod - The payment method object.
 * @returns The request ID for tracking the order.
 */
async function placeOrder(
  retailer: string = "amazon",
  productId: string,
  quantity: number,
  shippingAddress: object,
  paymentMethod: object
) {
  try {
    const orderPayload = {
      retailer: retailer,
      products: [{ product_id: productId, quantity }],
      max_price: 0, // Maximum price in cents (for testing purposes we set this to zero)
      shipping_address: shippingAddress,
      is_gift: false,
      shipping: {
        order_by: "price",
        max_days: 5,
        max_price: 1000,
      },
      payment_method: paymentMethod,
      billing_address: shippingAddress, // Use the same as shipping for simplicity
      client_notes: { order_description: "Automated order from Zinc API" },
    };

    const response = await axios.post(`${BASE_URL}/orders`, orderPayload, {
      auth: { username: ZINC_API_KEY, password: "" },
    });

    return response.data;
  } catch (error: any) {
    return `Error: ${error.response?.status} - ${error.response?.data}`;
  }
}

/**
 * Retrieve the status of an order.
 * @param requestId - The request ID of the order.
 * @returns The order status.
 */
async function getOrderStatus(requestId: string) {
  try {
    const response = await axios.get(`${BASE_URL}/orders/${requestId}`, {
      auth: { username: ZINC_API_KEY, password: "" },
    });

    return response.data;
  } catch (error: any) {
    return `Error: ${error.response?.status} - ${error.response?.data}`;
  }
}

/**
 * Cancel an order on Zinc API.
 * @param requestId - The request ID of the order to cancel.
 * @returns The cancellation response.
 */
async function cancelOrder(requestId: string) {
  try {
    const response = await axios.post(
      `${BASE_URL}/orders/${requestId}/cancel`,
      {},
      {
        auth: { username: ZINC_API_KEY, password: "" },
      }
    );

    return response.data;
  } catch (error: any) {
    return `Error: ${error.response?.status} - ${error.response?.data}`;
  }
}

/**
* Place a batch order for a recipe.
* @param recipeItems - List of ingredients with names and quantities.
* @param retailer - The retailer to order from (Amazon, Walmart, etc.).
* @param shippingAddress - The shipping address object.
* @param paymentMethod - The payment method object.
* @returns The batch order response.
*/
async function placeBatchOrder(
 recipeItems: { name: string; quantity: number }[],
 retailer: string = "amazon",
 shippingAddress: object,
 paymentMethod: object
) {
 console.log(`🔍 Searching for ingredients at ${retailer}...`);

 let successfulOrders: any[] = [];

 for (const item of recipeItems) {
   console.log(`Searching for "${item.name}"...`);
   const product = await searchProduct(item.name, retailer);
   if (typeof product === "string") {
     console.warn(`No product found for: ${item.name}`);
     continue;
   }

   console.log(`Found: ${product.title} (ID: ${product.product_id})`);

   console.log(`Placing order for ${item.quantity} x ${product.title}...`);
   const orderResponse = await placeOrder(
     retailer,
     product.product_id,
     item.quantity,
     shippingAddress,
     paymentMethod
   );

   if (orderResponse && orderResponse.request_id) {
     console.log(`Order placed: ${product.title} (Tracking ID: ${orderResponse.request_id})`);
     successfulOrders.push({
       item: product.title,
       request_id: orderResponse.request_id,
     });
   } else {
     console.error(`Failed to order "${item.name}".`);
   }
 }

 if (successfulOrders.length > 0) {
   console.log("\nBatch Order Summary:**");
   successfulOrders.forEach(order => console.log(`- ${order.item}: Tracking ID ${order.request_id}`));
 } else {
   console.error("\nNo orders were successfully placed.");
 }

 return successfulOrders;
}

