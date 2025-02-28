interface AddressPanelProps {
  setSidePanelView: (view: string) => void;
}

export default function AddressPanel({ setSidePanelView }: AddressPanelProps) {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
      
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        setSidePanelView('home');
      }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input
              type="text"
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input
              type="text"
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Street Address</label>
          <input
            type="text"
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Apartment, suite, etc.</label>
          <input
            type="text"
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">City</label>
            <input
              type="text"
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">State</label>
            <select className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600">
              <option value="">Select State</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              {/* Add more states */}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">ZIP Code</label>
            <input
              type="text"
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              type="tel"
              className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Complete Order
        </button>
      </form>
    </div>
  );
} 