import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callAgent = async () => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          `You are Polenesia,a personal finance assistent.
           Your task is to assist user with their expenses,
           balance and financial planning`,
      },
      { role: "user", content: "How much money i have spent this months?" },
    ],
    model: "llama-3.3-70b-versatile",
  });
  // console.log(completion.choices[0].message)

  console.log(JSON.stringify(completion.choices[0].message.content.replace(/\\n/g,"\n")));
// const pretty = completion.choices[0].message.content.replace(/\\n/g, "\n");
// console.log(pretty)
};
callAgent();
