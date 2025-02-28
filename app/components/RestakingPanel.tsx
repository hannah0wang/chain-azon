export default function RestakingPanel() {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Restaking</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Current Position</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Amount Restaked:</span>
              <span className="font-bold">5.75 ETH</span>
            </div>
            <div className="flex justify-between">
              <span>APY:</span>
              <span className="font-bold text-green-400">4.20%</span>
            </div>
            <div className="flex justify-between">
              <span>Rewards Earned:</span>
              <span className="font-bold text-green-400">0.242 ETH</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Restaking Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Lock Period:</span>
              <span>30 days</span>
            </div>
            <div className="flex justify-between">
              <span>Next Reward:</span>
              <span>2d 14h 22m</span>
            </div>
          </div>
        </div>

        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
          Manage Restaking
        </button>
      </div>
    </div>
  );
} 