import { googleAI, gemini20Flash} from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const ai = genkit({
  plugins: [googleAI()],
});

export const specialtyInfoStreamingFlow = ai.defineFlow(
  {
    name: 'specialtyInfoFlow',
    inputSchema: z.string().describe('The medical specialty to research (e.g., Cardiology).'),
    streamSchema: z.string(),
    outputSchema: z.object({ 
      specialty: z.string(),
      summary: z.string().describe('The full, summarized information about the specialty.'),
    }),
  },
  async (specialty, { sendChunk }) => {
    const prompt = `
      Please provide a concise summary of the advantages and disadvantages of specializing in ${specialty}.
      Format your response clearly, using bullet points for each advantage and disadvantage.
      Ensure the information is accurate and relevant for medical professionals considering this specialty.
    `;

    let fullText = '';

    try {
      const response = ai.generateStream({
        model: gemini20Flash,
        prompt,
      });

      for await (const chunk of response.stream) {
        fullText += chunk.text;
        sendChunk(chunk.text);
      }

      return {
        specialty,
        summary: fullText, // Use accumulated fullText
      };
    } catch (error) {
      console.error("Streaming error:", error);
      sendChunk(`ERROR: An error occurred while generating the information. Please try again.  Details: ${error}`); // Send error to client
      return {
        specialty,
        summary: `ERROR: An error occurred while generating the information.  See console for details.`,
      };
    }
  }
);