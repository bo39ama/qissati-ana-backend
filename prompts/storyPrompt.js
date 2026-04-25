export function buildStoryPrompt(data) {
  const isArabic = data.language === "arabic";

  return `
You are the story engine for the brand "قصتي أنا".

Create a personalized children comic story based ONLY on the user details below.
Return valid JSON only. Do not return markdown.

USER DETAILS:
- Name: ${data.name}
- Age: ${data.age}
- Hobby: ${data.hobby}
- Goal: ${data.goal}
- Favorite phrase: ${data.phrase}
- Story language: ${data.language}

OUTPUT JSON FORMAT:
{
  "cover": {
    "title": "",
    "subtitle": ""
  },
  "panels": [
    { "number": 1, "title": "", "text": "", "imagePrompt": "" }
  ],
  "footer": ""
}

STORY RULES:
- Create exactly 8 panels.
- The story must follow this structure:
  1. Introduction
  2. Challenge
  3. Advice
  4. Reflection / imagination
  5. Action
  6. Progress
  7. Result
  8. Final message
- Make it positive, emotional, motivational, and child-friendly.
- Age style for 4–8: bright playful cartoon, cute expressions, big friendly eyes, stars, hearts, toys, sparkles, simple backgrounds.
- Do not mention OpenAI, AI, prompts, or backend.

LANGUAGE RULE:
${isArabic ? `
- Write the full story in Arabic.
- Natural Arabic for children.
- RTL-friendly wording.
- Cover title must be: "مغامرات ${data.name}"
- Footer must be exactly:
حوّل طفلك إلى بطل قصته الخاصة! 📖✨

⭐ قصة مخصصة باسمه وصورته
❤️ تعزز ثقته بنفسه وتحفّزه
🎁 هدية لا تُنسى من القلب

📩 اطلب الآن واجعل طفلك يعيش أجمل قصة

@qissatiana
` : `
- Write the full story in English.
- Natural English for children.
- LTR-friendly wording.
- Cover title must be: "The Adventures of ${data.name}"
- Footer must be exactly:
Turn your child into the hero of their own story! 📖✨

⭐ A personalized story with their name and photo
❤️ Builds confidence and motivation
🎁 A heartfelt gift they’ll never forget

📩 Order now and let your child live their most beautiful story

@qissatiana
`}

IMAGE PROMPT RULE:
For every panel, include a short imagePrompt describing the scene in a cheerful children comic style.
The child character should be visually inspired by the uploaded photo, but do not describe private sensitive traits.
`;
}
