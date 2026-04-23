// api/story.js
// قصتي أنا - Story Generation API
// Generates personalized comic story text using GPT-4o

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
    const { name, age, hobby, goal, phrase, language } = req.body;

    if (!name || !age || !language) {
      return res.status(400).json({ error: "Missing required fields: name, age, language" });
    }

    const isArabic = language === "arabic";

    const systemPrompt = isArabic
      ? `أنت كاتب قصص أطفال محترف متخصص في القصص الكوميكية المخصصة للأطفال من عمر 4-8 سنوات.
اكتب قصصاً ممتعة وتحفيزية وملهمة، بأسلوب بسيط وجميل يناسب الأطفال الصغار.
القصة يجب أن تكون شخصية وتشعر الطفل بأنه البطل الحقيقي.`
      : `You are a professional children's story writer specializing in personalized comic stories for ages 4-8.
Write fun, motivating, and inspiring stories in simple, beautiful language suitable for young children.
The story should feel personal and make the child feel like the real hero.`;

    const userPrompt = isArabic
      ? `اكتب قصة كوميكية مخصصة للطفل بالمعلومات التالية:
- الاسم: ${name}
- العمر: ${age} سنوات
- الهواية: ${hobby || "اللعب"}
- الهدف: ${goal || "النجاح"}
- العبارة المفضلة: ${phrase || "أنا أستطيع!"}

اكتب القصة على شكل 8 لوحات (panels) كوميكية بهذا الهيكل:
1. المقدمة - تعريف البطل (${name})
2. التحدي - مشكلة تواجه ${name}
3. النصيحة - شخص حكيم يساعد ${name}
4. التأمل والخيال - ${name} يحلم ويتخيل
5. العمل - ${name} يبدأ المحاولة بهوايته (${hobby || "اللعب"})
6. التقدم - ${name} يتحسن ويتطور
7. النتيجة - ${name} ينجح ويحقق هدفه (${goal || "النجاح"})
8. الرسالة الختامية - رسالة ملهمة مرتبطة بالعبارة: "${phrase || "أنا أستطيع!"}"

لكل لوحة اكتب:
- رقم اللوحة
- وصف المشهد البصري (بشكل مفصل للرسام، بالعربية)
- النص الذي يظهر في اللوحة (جملة أو جملتان بسيطتان)
- الحوار إن وجد

الأسلوب: بسيط، دافئ، مشجع، مناسب لعمر ${age} سنوات
اللغة: عربية فصحى مبسطة
أضف نجوم ⭐ وقلوب ❤️ وعناصر مرحة في النصوص`
      : `Write a personalized comic story for a child with these details:
- Name: ${name}
- Age: ${age} years old
- Hobby: ${hobby || "playing"}
- Goal: ${goal || "success"}
- Favorite phrase: "${phrase || "I can do it!"}"

Write the story as 8 comic panels with this structure:
1. Introduction - Meet the hero (${name})
2. Challenge - A problem ${name} faces
3. Advice - A wise friend helps ${name}
4. Reflection - ${name} dreams and imagines
5. Action - ${name} starts trying using their hobby (${hobby || "playing"})
6. Progress - ${name} improves and grows
7. Result - ${name} succeeds and achieves their goal (${goal || "success"})
8. Final Message - An inspiring message connected to: "${phrase || "I can do it!"}"

For each panel write:
- Panel number
- Visual scene description (detailed, for the illustrator)
- Text shown in the panel (1-2 simple sentences)
- Dialogue if any

Style: Simple, warm, encouraging, suitable for age ${age}
Add stars ⭐ hearts ❤️ and fun elements to the text`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    });

    const storyText = completion.choices[0].message.content;

    // Parse panels from the story text
    const panels = parseStoryPanels(storyText, isArabic);

    return res.status(200).json({
      success: true,
      story: storyText,
      panels: panels,
      childInfo: { name, age, hobby, goal, phrase, language },
    });
  } catch (error) {
    console.error("Story generation error:", error);
    return res.status(500).json({
      error: "Failed to generate story",
      details: error.message,
    });
  }
}

function parseStoryPanels(storyText, isArabic) {
  // Simple panel extraction - split by panel numbers
  const panels = [];
  const lines = storyText.split("\n").filter((l) => l.trim());

  let currentPanel = null;

  for (const line of lines) {
    const panelMatch = line.match(/^\d+[\.:\-]/);
    if (panelMatch) {
      if (currentPanel) panels.push(currentPanel);
      currentPanel = {
        number: panels.length + 1,
        title: line.replace(/^\d+[\.:\-]\s*/, "").trim(),
        description: "",
        text: "",
      };
    } else if (currentPanel) {
      if (line.includes("النص:") || line.includes("Text:")) {
        currentPanel.text = line.replace(/النص:|Text:/i, "").trim();
      } else if (line.includes("المشهد:") || line.includes("Scene:") || line.includes("الوصف:")) {
        currentPanel.description = line.replace(/المشهد:|Scene:|الوصف:/i, "").trim();
      } else {
        currentPanel.description += " " + line.trim();
      }
    }
  }

  if (currentPanel) panels.push(currentPanel);

  // Ensure we have 8 panels
  return panels.slice(0, 8);
}
