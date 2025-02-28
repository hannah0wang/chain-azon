import { useState } from 'react';
import { VAULT_DATA } from '../data/vaultData.ts';

export default function DepositingPanel() {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(VAULT_DATA.balance);
  const [txHash, setTxHash] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const handleDeposit = async () => {
    setIsDepositing(true);
    // Simulate transaction
    setTimeout(() => {
      setTxHash('0x1234...5678'); // Example tx hash
      setBalance(`${parseFloat(balance) + parseFloat(amount)} ETH`);
      setIsDepositing(false);
    }, 2000);
  };

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Vault Deposit</h2>
      
      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <div className="flex justify-between mb-2">
          <span>Current Balance:</span>
          <span className="font-bold">{balance}</span>
        </div>
        <div className="text-sm text-gray-300 break-all">
          <span>Vault Address:</span>
          <p className="font-mono mt-1">{VAULT_DATA.address}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Deposit Amount (ETH)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            placeholder="0.0"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={!amount || isDepositing}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            !amount || isDepositing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isDepositing ? 'Processing...' : 'Deposit ETH'}
        </button>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Deposit</h3>
            
            {!txHash ? (
              <>
                <p className="mb-4">You are about to deposit {amount} ETH to the vault.</p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleDeposit}
                    disabled={isDepositing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    {isDepositing ? 'Processing...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isDepositing}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="text-green-400 text-2xl mb-2">✓</div>
                  <p>Deposit Successful!</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-300 break-all">
                    Transaction Hash:
                    <span className="block font-mono mt-1">{txHash}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTxHash('');
                    setAmount('');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 