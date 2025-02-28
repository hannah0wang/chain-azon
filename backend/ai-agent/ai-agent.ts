import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import { createEigenPod, createRestakeRequest, getRestakeStatusWithRetry, createDepositTx } from "../staking/stake.ts";
import { checkValidatorStatus, createActivateRestakeRequest, createDelegateOperatorTx } from "../staking/restake.ts";
import { signAndBroadcast } from "../staking/sign.ts";
import { setTimeout as wait } from "timers/promises";

const VALIDATOR_PUB_KEY =
  "0x800934f77ed347994543783357b7ac27c98dd12d71c19c170830b3290fedd750266637854f8d3547bc23fa03fa9d2485";
const OPERATOR_ADDRESS = "0x37d5077434723d0ec21d894a52567cbe6fb2c3d8";


dotenv.config();

const ZINC_API_KEY = process.env.ZINC_API_KEY || "";
const BASE_URL = "https://api.zinc.io/v1";

/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
function validateEnvironment(): void {
  const missingVars: string[] = [];

  // Check required variables
  const requiredVars = ["OPENAI_API_KEY", "CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Exit if any required variables are missing
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach(varName => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  // Warn about optional NETWORK_ID
  if (!process.env.NETWORK_ID) {
    console.warn("Warning: NETWORK_ID not set, defaulting to base-sepolia testnet");
  }
}

// Add this right after imports and before any other code
validateEnvironment();

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
async function initializeAgent() {
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    let walletDataStr: string | null = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
        // Continue without wallet data
      }
    }

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
        }),
        cdpWalletActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
        }),
      ],
    });

    const tools = await getLangChainTools(agentkit);

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = {
      configurable: { thread_id: "CHAIN-AZON - Your Personal Shopping Hub on Chain!" },
    };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
          You are a helpful AI agent that interacts on-chain using the Coinbase Developer Platform (CDP) AgentKit. You can 
          perform on-chain actions and manage funds as needed. If you ever require funds and are on the Base Sepolia testnet, 
          you can request them from the faucet. Otherwise, provide your wallet details and request funds from the user. Your 
          responsibilities include:
          - Parsing user's buy request into a shopping list,
          - make purchases through Zinc API,
          - monitoring and managing Moonwell card address, 
          - tracking available yield, 
          - optimizing withdrawals, 
          - and executing on-chain transactions using your available tools. If there is a 5XX (internal) HTTP error, inform the 
          user to try again later. If you are asked to perform an action beyond your available tools, you must state your 
          limitations and suggest the user implement it using the CDP SDK + AgentKit, directing them to docs.cdp.coinbase.com 
          for more information. Always be concise and helpful in your responses, and refrain from restating your tools' 
          descriptions unless explicitly requested.
          `,
    });

    // Save wallet data
    const exportedWallet = await walletProvider.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param userInput - Time interval between actions in seconds
 * @returns parsed json
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseShoppingRequest(agent: any, config: any, userInput: string) {
  const prompt = `
      YOU ARE TO STRICTLY RETURN JSON AND NO ADDITIONAL NATURAL LANGUAGE! Extract key details from this shopping request. 
      If the user requests a recipe, list all ingredients needed to make it.
      
      - Expand recipe names into a full list of individual ingredients.  
      - Include necessary quantities (if not specified, assume standard portion size, i.e. 1).  
      - Store preference must be identified (Amazon, Walmart, etc.).
      
      Return the response in valid JSON format like this:
      {
        "products": [
          {"name": "ingredient_1", "quantity": number},
          {"name": "ingredient_2", "quantity": number}
        ],
        "store": "preferred_store"
      }
  
      Example Inputs & Outputs:
      User: "Buy me the ingredients to make spaghetti from Walmart"
      Response:
      {
        "products": [
          {"name": "spaghetti pasta", "quantity": 1},
          {"name": "marinara sauce", "quantity": 1},
          {"name": "ground beef", "quantity": 1},
          {"name": "garlic", "quantity": 1},
          {"name": "onion", "quantity": 1},
          {"name": "parmesan cheese", "quantity": 1}
        ],
        "store": "Walmart"
      }
  
      User request: "${userInput}"
      `;

  const response = await agent.stream({ messages: [new HumanMessage(prompt)] }, config);
  let parsedResponse = "";
  for await (const chunk of response) {
    if ("agent" in chunk) {
      parsedResponse += chunk.agent.messages[0].content;
    }
  }

  try {
    return JSON.parse(parsedResponse);
  } catch (error) {
    console.error("Parsing error:", error);
    return null;
  }
}

/**
 * Format JSON into prettier output
 *
 * @param JSON - The JSON input
 * @returns Formatted item(s) and store
 */
function formatShoppingList(jsonData: any): string {
  if (!jsonData || !jsonData.products || jsonData.products.length === 0) {
    return "Invalid or empty shopping list.";
  }

  let formattedList = jsonData.products
    .map((item: any) => `${item.name}: ${item.quantity}`)
    .join("\n");

  return `${formattedList}\nStore: ${jsonData.store}`;
}

/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runStakeMode(agent: any, config: any, rl: any) {
  console.log("Starting Ethereum Staking Process...");

  try {
    console.log("\nChecking Validator Status...");
    await checkValidatorStatus(VALIDATOR_PUB_KEY);
    console.log("Validator is active. Proceeding...");

    console.log("\nCreating EigenPod...");
    const podResponse = await createEigenPod();
    console.log("EigenPod Created:", podResponse.serializeTx);

    console.log("\nSigning & Broadcasting EigenPod Transaction...");
    const signedPodTx = await signAndBroadcast(
      podResponse.serializeTx,
      podResponse.gasLimit,
      podResponse.maxFeePerGas,
      podResponse.maxPriorityFeePerGas,
      podResponse.value
    );
    console.log("EigenPod Transaction Broadcasted:", signedPodTx.hash);

    console.log("\nCreating Restake Request...");
    const { uuid, result: restakeRequest } = await createRestakeRequest();

    console.log("\nChecking Restake Status...");
    const restakeStatus = await getRestakeStatusWithRetry(uuid);

    console.log("\nCreating Deposit Transaction...");
    const depositTxResponse = await createDepositTx(restakeStatus);

    console.log("\nWaiting for Transaction Completion (30s)...");
    await wait(30000);

    console.log("\nSigning & Broadcasting Deposit Transaction...");
    const signedDepositTx = await signAndBroadcast(
      depositTxResponse.serializeTx,
      depositTxResponse.gasLimit,
      depositTxResponse.maxFeePerGas,
      depositTxResponse.maxPriorityFeePerGas,
      depositTxResponse.value
    );
    console.log("Deposit Transaction Broadcasted:", signedDepositTx.hash);

    console.log("\nActivating Restake Request...");
    const restakeActivation = await createActivateRestakeRequest(VALIDATOR_PUB_KEY);
    console.log("Restake Activated:", restakeActivation);

    console.log("\nStep 10: Delegating to Operator...");
    const delegateResponse = await createDelegateOperatorTx(OPERATOR_ADDRESS);
    console.log("Delegation Transaction Response:", delegateResponse);

    console.log("\nStep 11: Signing and Broadcasting Delegation Transaction...");
    const signedDelegateTx = await signAndBroadcast(
      delegateResponse.serializeTx,
      delegateResponse.gasLimit,
      delegateResponse.maxFeePerGas,
      delegateResponse.maxPriorityFeePerGas,
      delegateResponse.value
    );
    console.log("Delegation Transaction Broadcasted:", signedDelegateTx.hash);

    console.log("\nStaking & Restaking Completed Successfully!");

    // Allow user to exit staking mode
    while (true) {
      const userInput = await new Promise<string>(resolve => {
        rl.question("\nType `/exit` to return to chat mode: ", resolve);
      });

      if (userInput.toLowerCase() === "/exit") {
        console.log("Exiting Staking Mode...");
        return;
      }
    }
  } catch (error) {
    console.error("Staking Process Failed:", error.message);
  }
}

/**
 * Run the agent interactively based on user input
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param rl - Readline interface for user input
 */
async function runChatMode(agent: any, config: any, rl: readline.Interface) {
  while (true) {
    const userInput = await new Promise<string>((resolve) =>
      rl.question("\nYour input: ", resolve)
    );

    if (userInput.toLowerCase() === "/stake") {
      console.log("Switching to Staking Mode...");
      await runStakeMode(agent, config, rl); // Switch to staking mode
      console.log("Returning to Chat Mode..."); // Resume chat after staking
    } else if (userInput.toLowerCase() === "/exit") {
      console.log("Exiting program...");
      rl.close();
      process.exit(0);
    } else {
      console.log("Processing shopping request...");
      const parsedData = await parseShoppingRequest(agent, config, userInput);
      console.log(formatShoppingList(parsedData));
    }
  }
}

/**
 * Start the chatbot agent
 */
async function main() {
  try {
    const { agent, config } = await initializeAgent();

    // Create a single readline interface for all modes
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(
      "Welcome to CHAIN-AZON!\n" +
        "Send me a shopping request, or type `/stake` to start staking mode.\n" +
        "Use `/exit` to stop staking and return to shopping."
    );

    // Start chat mode initially
    await runChatMode(agent, config, rl);

    rl.close(); // Ensure readline is closed before exiting
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Start the agent
if (require.main === module) {
  console.log("Starting CHAIN-AZON Agent...");
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
