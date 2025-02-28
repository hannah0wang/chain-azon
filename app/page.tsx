"use client";

import { useState, useEffect, useRef } from "react";
import { useAgent } from "./hooks/useAgent";
import ReactMarkdown from "react-markdown";
import { useConnectWallet } from '@web3-onboard/react'
import { ethers } from 'ethers'
import { Card } from "./card";
import HomePanel from './components/HomePanel';
import CreditCardPanel from './components/CreditCardPanel';
import AddressPanel from './components/AddressPanel';
import ShoppingPanel from './components/ShoppingPanel';
import RestakingPanel from './components/RestakingPanel';
import DepositingPanel from './components/DepositingPanel';

const EXAMPLE_IMAGES = [
  {
    id: 1,
    title: "AI Generated 1",
    url: "/placeholder1.jpg", // Replace with your actual image paths
    description: "An AI generated artwork showcasing digital creativity"
  },
  {
    id: 2,
    title: "AI Generated 2",
    url: "/placeholder2.jpg",
    description: "Another stunning AI creation"
  },
  // Add more images as needed
];

export default function Home() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [input, setInput] = useState("");
  const { messages, sendMessage, isThinking } = useAgent();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidePanelView, setSidePanelView] = useState('home');

  // create an ethers provider
  let ethersProvider

  if (wallet) {
    ethersProvider = new ethers.providers.Web3Provider(wallet.provider, 'any')
  }

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    const message = input;
    setInput("");
    await sendMessage(message);
    // Update the side panel based on the message content
    const nextState = determineNextState(message);
    setSidePanelView(nextState);
  };

  const determineNextState = (query) => {
    // Define valid states
    const VALID_STATES = {
      shopping: true,
      restaking: true,
      depositing: true,
      home: true
    };
    
    // Convert query to lowercase for easier matching
    query = query.toLowerCase();
    
    // Shopping state triggers
    if (query.includes('buy') || query.includes('purchase') || query.includes('shop') || query.includes('cart') || query.includes('price')) {
      return 'shopping';
    }
    
    // Restaking state triggers
    else if (query.includes('stake') || query.includes('restake') || query.includes('staking') || query.includes('reward')) {
      return 'restaking';
    }
    
    // Depositing state triggers
    else if (query.includes('deposit') || query.includes('fund') || query.includes('transfer') || query.includes('send')) {
      return 'depositing';
    }
    
    // Default to home state if uncertain
    else {
      return 'home';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Main Content with Side Panel */}
      <div className="flex-1 flex">
        {/* Chat Section */}
        <div className="flex-1 p-2 flex items-center justify-center">
          {!wallet ? (
            // Signed Out View
            <div className="h-[85vh] flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Welcome to Chain-Mart</h2>
                <p className="mb-6">Connect your wallet to start shopping</p>
                <button
                  disabled={connecting}
                  onClick={() => connect()}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    connecting
                      ? "bg-gray-600 cursor-not-allowed text-gray-300"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  }`}
                >
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          ) : (
            // Signed In View - Chat Interface
            <div className="w-full max-w-4xl h-[85vh] bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col text-black">
              {/* Chat Messages */}
              <div className="flex-grow overflow-y-auto space-y-3 p-2">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500">Start chatting with AgentKit...</p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl shadow ${
                        msg.sender === "user"
                          ? "bg-gray-600 text-white self-end"
                          : "bg-gray-100 dark:bg-gray-700 self-start"
                      }`}
                    >
                      <ReactMarkdown components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="text-gray-600 dark:text-gray-400 underline hover:text-gray-800 dark:hover:text-gray-300"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                      }}>{msg.text}</ReactMarkdown>
                    </div>
                  ))
                )}

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="text-right mr-2 text-gray-500 italic">🤖 Thinking...</div>
                )}

                {/* Invisible div to track the bottom */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <div className="flex items-center space-x-2 mt-2 px-4">
                <input
                  type="text"
                  className="flex-grow p-3 rounded-lg border dark:bg-black dark:border-gray-600 
                    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-w-[600px]"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
                  disabled={isThinking}
                />
                <button
                  onClick={onSendMessage}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    isThinking
                      ? "bg-gray-600 dark:bg-gray-700 cursor-not-allowed text-gray-300 dark:text-gray-500"
                      : "bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-600 text-white shadow-md"
                  }`}
                  disabled={isThinking}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {wallet && (
          <div className="w-80 p-4 border-l border-gray-700 overflow-y-auto">
            {/* Panel Content */}
            <div>
              {sidePanelView === 'home' && <HomePanel setInput={setInput} />}
              {sidePanelView === 'credit-card' && <CreditCardPanel setSidePanelView={setSidePanelView} />}
              {sidePanelView === 'address' && <AddressPanel setSidePanelView={setSidePanelView} />}
              {sidePanelView === 'shopping' && <ShoppingPanel setSidePanelView={setSidePanelView} />}
              {sidePanelView === 'restaking' && <RestakingPanel />}
              {sidePanelView === 'depositing' && <DepositingPanel />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
