import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callAgent = async () => {
  const messages = [
    {
      role: "system",
      content: `You are Polenesia,a personal finance assistent.
           Your task is to assist user with their expenses,
           balance and financial planning
           current datetime:${new Date().toUTCString()}`,
    },
  ];
  messages.push({
    role: "user",
    content: "can you tell me my expense of this months",
  });
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
                description: "From date to get the expense.",
              },
              to: {
                type: "string",
                description: "to date to get the expense",
              },
            },
          },
        },
      },
    ],
  });
  // console.log(completion.choices[0].message)

  console.log(JSON.stringify(completion.choices[0], null, 2));
  // const pretty = completion.choices[0].message.content.replace(/\\n/g, "\n");
  // console.log(pretty)
  messages.push(completion.choices[0].message)
  const toolCalls = completion.choices[0].message.tool_calls;
  if (!toolCalls) {
    console.log(`Assistent:${completion.choices[0].message.content}`);
    return;
  }
  for (const tool of toolCalls) {
    const functionName = tool.function.name;
    const functionArgs = tool.function.arguments;

    let result = "";
    if (functionName === "getTotalExpense") {
      result = getTotalExpense(JSON.parse(functionArgs));
    }
    messages.push({
      role:"tool",
      content:result,
      tool_call_id:tool.id
    })

    const completion2 = await groq.chat.completions.create({
      messages:messages,
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
                  description: "From date to get the expense.",
                },
                to: {
                  type: "string",
                  description: "to date to get the expense",
                },
              },
            },
          },
        },
      ],
    });
    console.log(JSON.stringify(completion2.choices[0]));
  }
  console.log("#####################################")
  console.log("messages",messages)
};
callAgent();

/**
 * get total expenses
 */
const getTotalExpense = ({ from, to }) => {
  console.log("calling the getTotalExpense tool");
  return `1000`;
};
