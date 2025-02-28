interface CreditCardPanelProps {
  setSidePanelView: (view: string) => void;
}

export default function CreditCardPanel({ setSidePanelView }: CreditCardPanelProps) {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Payment Details</h2>
      
      {/* Order Summary */}
      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>$15.98</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>$1.28</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>$4.99</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-gray-600">
            <span>Total</span>
            <span>$22.25</span>
          </div>
        </div>
      </div>

      {/* Credit Card Form */}
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        setSidePanelView('address');
      }}>
        <div>
          <label className="block text-sm mb-1">Card Number</label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Expiry Date</label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">CVV</label>
            <input
              type="text"
              placeholder="123"
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Cardholder Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Continue to Shipping
        </button>
      </form>
    </div>
  );
}
