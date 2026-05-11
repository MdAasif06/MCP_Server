import readLine from "readline/promises";
import OpenAI from "openai";
import "dotenv/config";

const chatHistory = [];

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chatLoop() {
  while (true) {
    const question = await rl.question("You: ");

    if (question.toLowerCase() === "exit") {
      console.log("Chat ended.");
      rl.close();
      break;
    }

    chatHistory.push({
      role: "user",
      content: question,
    });

    try {
      const completion = await openai.chat.completions.create({
        // model: "inclusionai/ring-2.6-1t:free",
        model: "baidu/cobuddy:free",

        messages: chatHistory,
      });

      const reply = completion.choices[0].message.content;

      console.log("\nAI:", reply, "\n");

      chatHistory.push({
        role: "assistant",
        content: reply,
      });

    } catch (error) {
      console.log("Error:", error.message);
    }
  }
}

chatLoop();