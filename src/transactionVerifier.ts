import {
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// Function to get transaction details
async function getTransactionDetails(signature: string) {
  console.log("Connecting to Solana cluster...");
  // Connect to Solana cluster
  const connection = new Connection(clusterApiUrl("devnet"), {
    commitment: "confirmed",
  });

  console.log("Fetching transaction...");
  // Fetch transaction
  const transaction = await connection.getTransaction(signature);

  // Check if transaction exists
  if (!transaction) {
    console.error("Transaction not found");
    throw new Error("Transaction not found");
  }
  console.log("Transaction fetched successfully");
  console.log("Finding transfer instruction...");
  // Find transfer instruction
  const transferInstruction = transaction.transaction.message.instructions.find(
    (instruction) =>
      transaction.transaction.message.accountKeys[
        instruction.programIdIndex
      ].equals(SystemProgram.programId)
  );

  if (!transferInstruction) {
    console.error("No transfer instruction found in transaction");
    throw new Error("No transfer instruction found in transaction");
  }
  console.log("Transfer instruction found");
  console.log("Extracting sender and receiver public keys...");
  // Extract sender and receiver public keys
  const sender =
    transaction.transaction.message.accountKeys[
      transferInstruction.accounts[0]
    ];
  const receiver =
    transaction.transaction.message.accountKeys[
      transferInstruction.accounts[1]
    ];
  console.log("Extracting amount in lamports and converting to SOL...");
  // Extract amount in lamports and convert to SOL
  if (!transaction.meta) {
    console.error("Transaction metadata not found");
    throw new Error("Transaction metadata not found");
  }
  const senderBalanceChange =
    transaction.meta.postBalances[0] - transaction.meta.preBalances[0];
  const receiverBalanceChange =
    transaction.meta.postBalances[1] - transaction.meta.preBalances[1];
  let amount: number = 0; // Initialize amount to 0
  if (senderBalanceChange + transaction.meta.fee === -receiverBalanceChange) {
    amount = receiverBalanceChange / LAMPORTS_PER_SOL;
  } else {
    console.error("Balance changes do not match expected transfer amounts");
    throw new Error("Balance changes do not match expected transfer amounts");
  }
  console.log("Transaction details extracted successfully");
  return {
    sender: sender.toBase58(),
    receiver: receiver.toBase58(),
    amount,
  };
}

// Example usage
const signature =
  "5c83nCkng3AHsuW7WhLoRnv8CpfrBgs9ob5Mx4xDwoFwtTJScd8ZY46rhL254WECbQyeQvfDDhpUSXvjEaScGR8o"; // Replace with actual signature

getTransactionDetails(signature)
  .then((details) => {
    console.log("Transaction Details:", details);
  })
  .catch((error) => {
    console.error("Error fetching transaction details:", error);
  });
