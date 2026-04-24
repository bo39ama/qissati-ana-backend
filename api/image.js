// api/image.js — قصتي أنا
// Generates high-quality comic panel images using gpt-image-1

import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { panelDescription, childInfo, panelNumber, panelType } = req.body;
    const { name, age, hobby, goal } = childInfo || {};
    const ageNum = parseInt(age) || 6;

    let artStyle = ageNum <= 8
      ? "bright playful cartoon, chibi-style, big friendly eyes, soft pastel colors, sparkles and stars, children's book illustration"
      : ageNum <= 13
      ? "clean cartoon style, anime-inspired, vibrant colors, school and daily life setting"
      : "semi-realistic illustration, soft cinematic lighting, calm warm tones, aspirational mood";

    const base = `comic panel, professional illustration, ${artStyle}, child named ${name} age ${age}${hobby?`, loves ${hobby}`:""}${goal?`, dreams of ${goal}`:""}. No text, no speech bubbles, clean lines, high quality`;

    const scenes = {
      1:`${name} at home looking happy and excited, cheerful everyday setting, stars around`,
      2:`${name} looking worried facing a challenge, slightly dramatic but not scary, thought bubble`,
      3:`Kind adult talking to ${name}, both smiling warmly, heart symbols between them`,
      4:`${name} dreaming with eyes closed, magical thought bubble showing ${goal||"big dream"}, stars and clouds`,
      5:`${name} actively practicing ${hobby||"working hard"}, determined pose, action lines, energetic`,
      6:`${name} improving and showing skills, proud happy expression, trophy nearby`,
      7:`${name} celebrating victory achieving ${goal||"the goal"}, confetti stars everywhere, arms raised`,
      8:`${name} smiling warmly forward, hand on heart, glowing golden background, stars and hearts`
    };

    const scene = panelType==="cover"
      ? `Children's comic cover: ${name} standing heroically center, hero cape, magical colorful background, stars sparkles hearts, portrait orientation. ${base}`
      : `${scenes[panelNumber]||panelDescription||`${name} adventure scene`}. ${base}`;

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: scene.replace(/\s+/g," ").trim(),
      n: 1, size: "1024x1024", quality: "medium"
    });

    const d = response.data[0];
    if (d.b64_json) return res.status(200).json({ success:true, image:`data:image/png;base64,${d.b64_json}`, type:"base64" });
    if (d.url)     return res.status(200).json({ success:true, image:d.url, type:"url" });
    throw new Error("No image data");

  } catch(e) {
    console.error("Image error:", e);
    return res.status(200).json({ success:false, image:null, error:e.message, fallback:true });
  }
}
