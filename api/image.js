// api/image.js
// قصتي أنا - Comic Image Generation API
// Generates comic-style panel images using gpt-image-1

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { panelDescription, childInfo, panelNumber, panelType } = req.body;

    if (!childInfo || !panelType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { name, age, hobby, goal } = childInfo;

    // Build a child-friendly comic art prompt
    const artStyle = `
      cute children's comic book illustration style,
      bright cheerful colors (soft pink, sky blue, pastel purple, light yellow),
      big friendly eyes, round cute face, expressive cartoon character,
      age ${age || 6} child named ${name},
      warm happy atmosphere, sparkles and stars in background,
      professional comic panel art, clean outlines,
      suitable for children ages 4-8,
      no text in image, no speech bubbles, image only
    `;

    let imagePrompt = "";

    if (panelType === "cover") {
      imagePrompt = `
        Children's comic book cover illustration.
        Main character: A happy cute child named ${name}, age ${age}, who loves ${hobby || "playing"}.
        The child is standing confidently, looking heroic and joyful.
        Background: Magical colorful world with stars, hearts, and playful elements.
        The child is wearing a hero cape or has a special item related to ${hobby || "their hobby"}.
        ${artStyle}
      `;
    } else {
      imagePrompt = `
        Children's comic panel illustration, panel ${panelNumber || 1}.
        Scene: ${panelDescription || `A cute child named ${name} on an adventure`}
        Main character: A happy cute child named ${name}, age ${age}.
        Include elements related to: ${hobby || "playing"} and ${goal || "achieving dreams"}.
        ${artStyle}
      `;
    }

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt.trim(),
      n: 1,
      size: "1024x1024",
      quality: "medium",
    });

    // gpt-image-1 returns base64 data
    const imageData = response.data[0];

    if (imageData.b64_json) {
      return res.status(200).json({
        success: true,
        image: `data:image/png;base64,${imageData.b64_json}`,
        type: "base64",
      });
    } else if (imageData.url) {
      return res.status(200).json({
        success: true,
        image: imageData.url,
        type: "url",
      });
    } else {
      throw new Error("No image data in response");
    }
  } catch (error) {
    console.error("Image generation error:", error);

    // Return a styled placeholder on error so the UI doesn't break
    return res.status(200).json({
      success: false,
      image: null,
      error: error.message,
      fallback: true,
    });
  }
}
