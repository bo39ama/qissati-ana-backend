// api/cover.js
// قصتي أنا - Cover Image Generation with optional photo reference
// Generates story cover using gpt-image-1, optionally with child's photo as reference

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { childInfo, photoBase64 } = req.body;
    const { name, age, hobby, goal, phrase, language } = childInfo || {};

    const isArabic = language === "arabic";
    const titleText = isArabic ? `مغامرات ${name}` : `The Adventures of ${name}`;

    const coverPrompt = `
      Children's comic book cover art, professional illustration.
      Title story: "${titleText}"
      
      Main character: A cute happy child, age ${age || 6}, named ${name}.
      The child looks joyful, confident, and heroic.
      ${hobby ? `The child's hobby is ${hobby} - include visual elements related to this.` : ""}
      ${goal ? `The child's dream is ${goal} - show this aspirationally.` : ""}
      
      Art style requirements:
      - Bright cheerful children's comic book style
      - Soft colors: pink, sky blue, pastel purple, yellow, peach
      - Big friendly cartoon eyes, round cute face
      - Stars ⭐ sparkles, hearts ❤️, and magical elements in background  
      - Colorful gradient sky background
      - The child in the center/foreground, looking happy and brave
      - Premium book cover composition
      - No text or letters in the image
      - Suitable for children ages 4-8
      - Warm, inviting, emotional design
    `;

    let response;

    // If a photo is provided, use it as reference with image editing
    if (photoBase64) {
      // Convert base64 to buffer for API
      const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Use images.edit to reference the child's appearance
      const formData = new FormData();
      const blob = new Blob([buffer], { type: "image/png" });
      formData.append("image", blob, "child.png");
      formData.append("prompt", coverPrompt);
      formData.append("model", "gpt-image-1");
      formData.append("size", "1024x1024");
      formData.append("quality", "medium");

      response = await openai.images.edit({
        model: "gpt-image-1",
        image: blob,
        prompt: coverPrompt,
        size: "1024x1024",
        quality: "medium",
      });
    } else {
      // Generate without photo reference
      response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: coverPrompt,
        n: 1,
        size: "1024x1024",
        quality: "medium",
      });
    }

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
    console.error("Cover generation error:", error);
    return res.status(500).json({
      error: "Failed to generate cover",
      details: error.message,
    });
  }
}
