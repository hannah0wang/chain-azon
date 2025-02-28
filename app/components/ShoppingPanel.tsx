import AmazonCard from './AmazonCard';
import { EXAMPLE_PRODUCTS } from '../data/amazonProducts';

interface ShoppingPanelProps {
  setSidePanelView: (view: string) => void;
}

export default function ShoppingPanel({ setSidePanelView }: ShoppingPanelProps) {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Shopping</h2>
      <div className="space-y-4">
        <AmazonCard {...EXAMPLE_PRODUCTS[0]} />
        <AmazonCard {...EXAMPLE_PRODUCTS[0]} />
        <button
          onClick={() => setSidePanelView('credit-card')}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Finish Buying
        </button>
      </div>
    </div>
  );
} 