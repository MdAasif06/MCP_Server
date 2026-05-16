import Groq from "groq-sdk";
import readLine from "node:readline/promises";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const expenseDB = [];
const incomeDB = [];

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getTotalExpense = ({ from, to }) => {
  // console.log("calling getTotalExpense tool");
  // console.log("from:", from);
  // console.log("to:", to);
  const expense = expenseDB.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);

  return `${expense}INR`;
};
const addExpense = ({ name, amount }) => {
  // console.log(`Adding ${amount}to expense DB for ${name}`);
  expenseDB.push({ name, amount });
  return `added to database success`;
};

const addIncome = ({ name, amount }) => {
  incomeDB.push({ name, amount });
  return `new income added in database`;
};

const getMoneyBalance = () => {
  const totalIncome = incomeDB.reduce((acc, curr) => {
    acc + curr.amount;
  }, 0);
  const totalExpense = expenseDB.reduce((acc, curr) => acc + curr.amount, 0);
  return `${totalIncome - totalExpense}INR`;
};

const callAgent = async () => {
  const messages = [
    {
      role: "system",
      content: `You are Polenesia,a personal finance assistent.
      Your task is to assist user with their expenses,
      balance and financial planning
      you have access to following tool:
      1. getTotalExpense({from,to}:string //Get total expense for the period)
      2. addExpense({name,amount}:string //Add new expense to the expenseDB)
      3. addIncome({name,amount}:string //Add new income to the database)
      4. addIncome( ():string //Given total balance in my database)
      current datetime:${new Date().toUTCString()}`,
    },
  ];

  // this is for user loop
  while (true) {
    const question = await rl.question("User: ");
    if (question === "bye") {
      // console.log("chat end")
      break;
    }
    messages.push({
      role: "user",
      content: question,
    });
    // this is agent loop
    while (true) {
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        tools: [
          {
            type: "function",
            function: {
              name: "getTotalExpense",
              description: "Get the total expense from date to date",
              parameters: {
                type: "object",
                properties: {
                  from: {
                    type: "string",
                  },
                  to: {
                    type: "string",
                  },
                },
                required: ["from", "to"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "addExpense",
              description: "Add new expense entry to the expense databse",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the expense",
                  },
                  amount: {
                    type: "number",
                    description: "Amount of the expense",
                  },
                },
                required: ["name", "amount"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "addIncome",
              description: "Add new income entry in database",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the income",
                  },
                  amount: {
                    type: "number",
                    description: "Amount of the income",
                  },
                },
                required: ["name", "amount"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "getMoneyBalance",
              description: "Given total balance in my database",
            },
          },
        ],
      });

      // console.log(JSON.stringify(completion.choices[0], null, 2));
      messages.push(completion.choices[0].message);
      const toolCalls = completion.choices[0].message.tool_calls;
      if (!toolCalls) {
        console.log(`Assistent:${completion.choices[0].message.content}`);
        break;
      }
      for (const tool of toolCalls) {
        const functionName = tool.function.name;
        const functionArgs = tool.function.arguments;

        let result = "";
        if (functionName === "getTotalExpense") {
          result = getTotalExpense(JSON.parse(functionArgs));
        } else if (functionName === "addExpense") {
          result = addExpense(JSON.parse(functionArgs));
        } else if (functionName === "addIncome") {
          result = addIncome(JSON.parse(functionArgs));
        } else if (functionName === "getMoneyBalance") {
          result = getMoneyBalance(JSON.parse(functionArgs));
        }
        messages.push({
          role: "tool",
          content: result,
          tool_call_id: tool.id,
        });
        // console.log(JSON.stringify(completion2.choices[0]));
      }
      // console.log("#####################################");
      // console.log("messages", messages);
      // console.log("#####################################");
      // console.log("DB", expenseDB);
    }
  }
  rl.close();
};

/**
 * get total expenses
 */
// const getTotalExpense = ({ from, to }) => {
//   console.log("calling the getTotalExpense tool");
//   return "2000 INR";
// };
callAgent();
