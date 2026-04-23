// api/ping.js
// Health check endpoint

export default function handler(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "قصتي أنا API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      story: "/api/story - POST - Generate story text",
      image: "/api/image - POST - Generate panel image",
      cover: "/api/cover - POST - Generate cover image",
    },
  });
}
