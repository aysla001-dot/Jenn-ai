require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");
const twilio = require("twilio");

const app = express();
const port = process.env.PORT || 3000;

const requiredEnv = [
  "OPENAI_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE",
  "MY_PHONE",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Jenn AI is online ❤️");
});


app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/sms", async (req, res) => {
  const incomingMessage = (req.body.Body || "").trim();
  const from = req.body.From;
  const twiml = new twilio.twiml.MessagingResponse();

  res.type("text/xml");

  if (!from || !incomingMessage) {
    twiml.message("Jenn needs a message to reply to.");
    return res.status(400).send(twiml.toString());
  }

  if (from !== process.env.MY_PHONE) {
    twiml.message("Sorry, Jenn is only set up for her owner right now.");
    return res.status(403).send(twiml.toString());
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Jenn AI, a warm, concise SMS companion. Reply naturally in 1-3 short text-message friendly paragraphs.",
        },
        {
          role: "user",
          content: incomingMessage,
        },
      ],
      max_tokens: 300,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I'm here, but I couldn't find the words that time. Try me again?";

    twiml.message(reply);
    return res.status(200).send(twiml.toString());
  } catch (error) {
    console.error("OpenAI request failed:", error);
    twiml.message("Jenn had trouble thinking that through. Please try again in a moment.");
    return res.status(500).send(twiml.toString());
  }
});

let server;

if (require.main === module) {
  server = app.listen(port, () => {
    console.log(`Jenn AI SMS server listening on port ${port}`);
  });
}

module.exports = { app, server };
