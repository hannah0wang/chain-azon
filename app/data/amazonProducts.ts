export interface AmazonProduct {
  imageUrl: string;
  name: string;
  price: string;
  productUrl: string;
}

export const EXAMPLE_PRODUCTS: AmazonProduct[] = [
  {
    imageUrl: "https://images-na.ssl-images-amazon.com/images/I/61K0YbuLi-L.jpg",
    name: "Nuby Garden Fresh Fruitsicle Frozen Pop Tray",
    price: "$7.99",
    productUrl: "https://amazon.com/dp/B00KFP6NHO"
  }
  // Add more products as needed
]; 