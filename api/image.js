// api/image.js — قصتي أنا
// Generates comic panel images using child photo as visual reference

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
    const {
      panelDescription,
      childInfo,
      panelNumber,
      panelType,
    } = req.body;

    const {
      name,
      age,
      hobby,
      goal,
      photo,
    } = childInfo || {};

    const ageNum = parseInt(age) || 6;

    const artStyle =
      ageNum <= 8
        ? "bright playful children's book cartoon, cute friendly character, big expressive eyes, soft pastel colors, warm joyful mood"
        : ageNum <= 13
        ? "clean modern cartoon, consistent character design, school-age child, vibrant but soft colors"
        : "semi-realistic youth illustration, soft cinematic lighting, calm inspiring colors";

    const scenes = {
      1: `${name} happy at home or in a cozy room, excited about ${hobby || "a favorite activity"}`,
      2: `${name} facing a gentle challenge, thoughtful and slightly worried but hopeful`,
      3: `${name} receiving kind advice from a friendly adult or mentor, warm emotional moment`,
      4: `${name} imagining the dream of becoming ${goal || "successful"}, magical dream atmosphere`,
      5: `${name} practicing ${hobby || "skills"} with determination and energy`,
      6: `${name} improving step by step, proud and focused, progress feeling`,
      7: `${name} celebrating success and achieving the goal of ${goal || "success"}, joyful celebration`,
      8: `${name} smiling confidently, inspiring final message feeling, glowing background`,
    };

    const scene =
      panelType === "cover"
        ? `${name} standing heroically like the star of a children's comic cover, joyful confident pose, magical pastel background`
        : scenes[panelNumber] || panelDescription || `${name} in a joyful comic story scene`;

    const prompt = `
Use the uploaded child photo only as a visual reference for the main character.
Create ONE clean comic panel illustration.

Important rules:
- Keep the same main child character inspired by the uploaded photo.
- Do not copy the photo directly; transform into a polished cartoon character.
- No text inside the image.
- No Arabic text.
- No English text.
- No speech bubbles.
- No captions.
- No watermarks.
- No logos.
- Full body or half body visible, not cropped.
- Clean background.
- Leave safe space around the character.
- Professional premium comic story style.

Character:
- Child name: ${name}
- Age: ${age}
- Hobby: ${hobby || "not specified"}
- Goal: ${goal || "not specified"}

Scene:
${scene}

Style:
${artStyle}
High quality, consistent character, child-friendly, warm, premium, clear composition.
`.replace(/\s+/g, " ").trim();

    let response;

    if (photo && photo.startsWith("data:image")) {
      response = await openai.images.edit({
        model: "gpt-image-1",
        image: [{ image_url: photo }],
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "medium",
      });
    } else {
      response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "medium",
      });
    }

    const d = response.data[0];

    if (d.b64_json) {
      return res.status(200).json({
        success: true,
        image: `data:image/png;base64,${d.b64_json}`,
        type: "base64",
      });
    }

    if (d.url) {
      return res.status(200).json({
        success: true,
        image: d.url,
        type: "url",
      });
    }

    throw new Error("No image data returned");
  } catch (e) {
    console.error("Image error:", e);
    return res.status(200).json({
      success: false,
      image: null,
      error: e.message,
      fallback: true,
    });
  }
}
