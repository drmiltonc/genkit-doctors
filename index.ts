import { genkit } from "genkit/beta";
import { googleAI, gemini20Flash } from "@genkit-ai/googleai";

import { createInterface } from "node:readline/promises";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

async function main() {
  const chat = ai.chat();
  console.log("You're chatting with Gemini. Ctrl-C to quit.\n");
  const readline = createInterface(process.stdin, process.stdout);
  while (true) {
    const userInput = await readline.question("> ");
    const response = chat.sendStream(userInput);

    for await (const chunk of response.stream) {
        console.log(chunk.text);
      }

  }
}

main();