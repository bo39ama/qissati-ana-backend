import OpenAI from "openai";
import { buildStoryPrompt } from "../prompts/storyPrompt.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    if (!data?.name || !data?.age || !data?.language) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = buildStoryPrompt(data);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...(data.photo
              ? [{ type: "input_image", image_url: data.photo }]
              : [])
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "comic_story",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              cover: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" }
                },
                required: ["title", "subtitle"]
              },
              panels: {
                type: "array",
                minItems: 8,
                maxItems: 8,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    number: { type: "number" },
                    title: { type: "string" },
                    text: { type: "string" },
                    imagePrompt: { type: "string" }
                  },
                  required: ["number", "title", "text", "imagePrompt"]
                }
              },
              footer: { type: "string" }
            },
            required: ["cover", "panels", "footer"]
          }
        }
      }
    });

    const story = JSON.parse(response.output_text);

    return res.status(200).json({
      cover: story.cover,
      panels: story.panels,
      footer: story.footer
    });
  } catch (error) {
    console.error("Story API error:", error);
    return res.status(500).json({ error: "Story generation failed" });
  }
}
