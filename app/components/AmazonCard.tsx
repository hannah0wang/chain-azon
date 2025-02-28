interface AmazonCardProps {
  imageUrl: string;
  name: string;
  price: string;
  productUrl: string;
}

export default function AmazonCard({ imageUrl, name, price, productUrl }: AmazonCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <a href={productUrl} target="_blank" rel="noopener noreferrer">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
        />
      </a>
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{name}</h3>
        <div className="flex justify-between items-center">
          <p className="text-green-400 font-bold">{price}</p>
          <button 
            onClick={() => {
              // TODO: Connect to cart functionality
              console.log(`Adding to cart: ${name}`);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// Example usage:
/*
<AmazonCard
  imageUrl="https://images-na.ssl-images-amazon.com/images/I/61K0YbuLi-L.jpg"
  name="Nuby Garden Fresh Fruitsicle Frozen Pop Tray"
  price="$7.99"
  productUrl="https://amazon.com/dp/B00KFP6NHO"
/>
*/ 