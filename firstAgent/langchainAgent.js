import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import readLine from "node:readline/promises";
import "dotenv/config";

const expenseDB = [];
const incomeDB = [];

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const addExpenseTool = tool(
  async ({ name, amount }) => {
    expenseDB.push({ name, amount });
    return "Expense added successfully";
  },
  {
    name: "addExpenseTool",
    description: "Add a new expense",
    schema: z.object({
      name: z.string(),
      amount: z.number(),
    }),
  },
);

const getTotalExpense = tool(
  async ({ from, to }) => {
    const expense = expenseDB.reduce((acc, curr) => {
      return acc + curr.amount;
    }, 0);
    return `${expense}INR`;
  },
  {
    name: "getTotalExpense",
    description: "Get total expenses between two dates",
    schema: z.object({
      from: z.string(),
      to: z.string(),
    }),
  },
);

const addIncome = tool(
  async ({ name, amount }) => {
    incomeDB.push({ name, amount });
    return `new income added in databse`;
  },
  {
    name: "addIncome",
    description: "add new income in expense",
    schema: z.object({
      name: z.string(),
      amount: z.number(),
    }),
  },
);

const getBalanceTool = tool(
  async () => {
    const income = incomeDB.reduce((a, b) => a + b.amount, 0);
    const expense = expenseDB.reduce((a, b) => a + b.amount, 0);

    return `Balance: ${income - expense} INR`;
  },
  {
    name: "getBalanceTool",
    description: "Get current balance",
    schema: z.object({}),
  },
);

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
});

const agent = createReactAgent({
  llm,
  tools: [addExpenseTool, getBalanceTool, getTotalExpense, addIncome],
});

while (true) {
  const question = await rl.question("User: ");
  if (question === "bye") {
    break;
  }
  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });
  console.log(
    "Assistant:",
    result.messages[result.messages.length - 1].content,
  );
}
rl.close();
