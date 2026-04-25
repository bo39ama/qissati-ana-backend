// api/image.js — قصتي أنا
// Generates high-quality comic panel images using gpt-image-1

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
    } = childInfo || {};

    const ageNum = parseInt(age) || 6;

    const artStyle =
      ageNum <= 8
        ? "bright playful cartoon, cute child character, big friendly eyes, soft pastel colors, sparkles, stars, children's storybook illustration"
        : ageNum <= 13
        ? "clean modern cartoon style, school-age child, consistent face, soft vibrant colors, children's comic illustration"
        : "semi-realistic cartoon style, soft cinematic lighting, calm inspiring colors, youth character illustration";

    const characterProfile = `
Main character:
A ${ageNum}-year-old child named ${name}.
Keep the same character design in every panel:
same hairstyle, same face shape, same skin tone, same outfit style, same age, same friendly expression style.
The character should look like one consistent child across the whole comic.
`;

    const scenes = {
      1: `${name} is happy at home or in a cozy room, excited about ${hobby || "a favorite activity"}, warm joyful mood`,
      2: `${name} faces a gentle challenge, thoughtful and slightly worried but still hopeful`,
      3: `${name} receives kind advice from a friendly adult mentor, emotional warm moment`,
      4: `${name} imagines becoming ${goal || "successful"}, magical dream atmosphere, stars and soft clouds`,
      5: `${name} practices ${hobby || "skills"} with determination and energy, action scene`,
      6: `${name} improves step by step, proud and focused, progress feeling`,
      7: `${name} celebrates success and achieving the goal of ${goal || "success"}, confetti and joyful celebration`,
      8: `${name} smiles confidently, hand on heart, inspiring final scene, glowing background`,
    };

    const scene =
      panelType === "cover"
        ? `${name} standing heroically like the star of a children's comic cover, joyful confident pose, magical pastel background`
        : scenes[panelNumber] || panelDescription || `${name} in a joyful comic story scene`;

    const prompt = `
Create ONE clean children's comic panel illustration.

${characterProfile}

Scene:
${scene}

STRICT RULES:
- No text inside the image.
- No Arabic words.
- No English words.
- No speech bubbles.
- No captions.
- No logos.
- No watermark.
- Do not crop the face.
- Show the child clearly.
- Leave safe space around the character.
- Clean background.
- Professional premium children's comic style.
- The image must look like part of a branded personalized comic story.

Style:
${artStyle}

High quality, polished, colorful, warm, child-friendly, consistent character, clear composition.
`.replace(/\s+/g, " ").trim();

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "medium",
    });

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
