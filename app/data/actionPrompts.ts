export interface ActionPrompt {
  title: string;
  prompt: string;
}

export const ACTION_PROMPTS: ActionPrompt[] = [
  { title: "Go Shopping", prompt: "I'm looking to shop for..." },
  { title: "Manage Restaking", prompt: "I want to restake my..." },
  { title: "Make a Deposit", prompt: "I'd like to deposit..." },
]; 