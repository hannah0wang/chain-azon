import { ActionPrompt, ACTION_PROMPTS } from '../data/actionPrompts';
import AmazonCard from './AmazonCard';
import { EXAMPLE_PRODUCTS } from '../data/amazonProducts';

interface HomePanelProps {
  setInput: (value: string) => void;
}

export default function HomePanel({ setInput }: HomePanelProps) {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="space-y-2 mb-6">
        {ACTION_PROMPTS.map((action, index) => (
          <div 
            key={index}
            className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => {
              setInput(action.prompt);
            }}
          >
            <h3 className="font-semibold">{action.title}</h3>
            <p className="text-sm text-gray-300">{action.prompt}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Featured Product</h2>
      <AmazonCard {...EXAMPLE_PRODUCTS[0]} />
    </div>
  );
} 