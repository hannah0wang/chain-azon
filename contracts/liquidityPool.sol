// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DebitCardStaking {
    // Address of the AI agent which manages purchase allocations.
    address public aiAgent;
    
    // Fixed percentage for P2P allocation (e.g., 20%)
    uint256 public constant P2P_PERCENTAGE = 20;

    // Mapping to track each user's available liquidity funds.
    mapping(address => uint256) public liquidityBalance;
    // Mapping for the P2P portion
    mapping(address => uint256) public p2pBalance;

    // Events for logging actions.
    event Deposit(address indexed user, uint256 amount, uint256 liquidityAmount, uint256 p2pAmount);
    event Withdraw(address indexed user, uint256 amount);
    event Purchase(address indexed user, uint256 amount);

    modifier onlyAiAgent() {
        require(msg.sender == aiAgent, "Only AI agent allowed");
        _;
    }

    constructor(address _aiAgent) {
        aiAgent = _aiAgent;
    }

    /// @notice Deposit ETH into the contract. 20% goes to P2P, 80% to liquidity.
    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");

        // Calculate split amounts - 20% P2P, 80% liquidity
        uint256 p2pAmount = (msg.value * P2P_PERCENTAGE) / 100;
        uint256 liquidityAmount = msg.value - p2pAmount;

        // Update internal accounting
        liquidityBalance[msg.sender] += liquidityAmount;
        p2pBalance[msg.sender] += p2pAmount;

        emit Deposit(msg.sender, msg.value, liquidityAmount, p2pAmount);
    }

    /// @notice Allows a user to withdraw from their liquidity balance.
    /// @param amount The amount to withdraw.
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(liquidityBalance[msg.sender] >= amount, "Insufficient liquidity balance");

        // Update state before transferring to prevent reentrancy.
        liquidityBalance[msg.sender] -= amount;

        // Transfer ETH back to the user.
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdraw(msg.sender, amount);
    }

    /// @notice Called by the AI agent to process a purchase (spending) on behalf of a user.
    /// The function deducts the purchase amount from the user's liquidity balance and "burns" the ETH.
    /// @param user The address of the user making the purchase.
    /// @param amount The amount of ETH to spend (burn).
    function purchase(address user, uint256 amount) external onlyAiAgent {
        require(amount > 0, "Amount must be > 0");
        require(liquidityBalance[user] >= amount, "Insufficient liquidity balance for user");

        // Deduct the amount from the user's balance.
        liquidityBalance[user] -= amount;

        // "Burn" the ETH by sending it to the zero address.
        (bool success, ) = payable(address(0)).call{value: amount}("");
        require(success, "Burn failed");

        emit Purchase(user, amount);
    }

    /// @notice Fallback function to allow the contract to receive ETH.
    receive() external payable {}
}
