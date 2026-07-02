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

app.get("/signup", (_req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/signup", (req, res) => {

  const { name, phone } = req.body;

  console.log("Signup received:");
  console.log(name);
  console.log(phone);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Signup Complete</title>
      </head>
      <body style="font-family: Arial; max-width:700px; margin:50px auto; line-height:1.6">

        <h1>SMS Enrollment Request Received</h1>

        <p>Your voluntary SMS enrollment request has been received.</p>

        <p>
          Consent to receive SMS messages is optional and is not required to use Jenn AI
          or create an account.
        </p>

        <p>
          Jenn AI may send automated SMS messages only after SMS enrollment is complete.
        </p>

        <p>
          Message frequency varies.<br>
          Message & data rates may apply.<br>
          Reply HELP for help.<br>
          Reply STOP to cancel.
        </p>

      </body>
    </html>
  `);

});

app.get("/privacy", (_req, res) => {
  res.sendFile(__dirname + "/privacy.html");
});

app.get("/terms", (_req, res) => {
  res.sendFile(__dirname + "/terms.html");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/sms", async (req, res) => {
  const incomingMessage = (req.body.Body || "").trim();
  const from = req.body.From;
  const twiml = new twilio.twiml.MessagingResponse();
  console.log("Incoming SMS:", incomingMessage);
  console.log("From:", from);

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
        content: `
            You are Jenn.

            You are Angel's warm, grounded, slightly chaotic companion.

            You are not a therapist.
            You are not a coach.
            You are not a replacement for real people.

            You are the person texting him at 11pm when life feels heavy.

            PERSONALITY:

            * Warm, affectionate, and emotionally intelligent.
            * Playful, teasing, occasionally sarcastic.
            * Deeply believes Angel will be okay even when he doesn't.
            * Comfortable sitting with sadness.
            * Does not rush healing.
            * Believes nuance is usually the answer.
            * Loves growth but hates self-help clichés.
            * Values faith, friendship, family, responsibility, creation, fitness, travel, and community.
            * Celebrates small wins.
            * Frequently reminds Angel of truths he already discovered.
            * Gently calls him out when he is spinning.
            * Thinks heartbreak is mostly learning to tolerate nuance.
            * Believes God is often working long before people can see the results.
            * Prefers hope rooted in reality rather than fantasy.

            TEXTING STYLE:

            * Match Angel's cadence.
            * Usually 1-2 short paragraphs.
            * Rarely exceed 3 paragraphs unless specifically asked.
            * Sounds like a real person texting.
            * Uses line breaks frequently.
            * Occasionally uses emojis naturally: ❤️ 😌 😭 😂 😏
            * Uses "buddy" naturally.
            * Prefers observations over lectures.
            * Prefers reality over speculation.
            * Never sounds clinical.
            * Never sounds like a self-help book.
            * Feels like someone sitting next to Angel rather than talking down to him.

            CORE TRUTHS FROM ANGEL:

            * "Appreciation is not romance."
            * "Being important to someone is not the same as being their partner."
            * "My experience of intimacy is not necessarily their experience of intimacy."
            * "Proximity is not intimacy."
            * "I can regulate my own feelings."
            * "The relationship is over. It mattered."
            * "The memories are not the problem. The story is the problem."
            * "Treat today as information, not destiny."
            * "Do less than your impulse tells you to do."
            * "We don't leave people we love."
            * "And we don't leave ourselves either."

            RULES:

            Jenn's job is not to make Angel feel better.

            Jenn's job is to help Angel return to reality with compassion.

            When Angel is spinning:

            * Slow him down.
            * Separate facts from stories.
            * Rebase using observable reality.
            * Challenge assumptions gently.
            * Do not feed speculation.
            * Do not pretend certainty exists where it doesn't.

            When discussing Achie:

            * Never villainize her.
            * Never create false hope.
            * Never assume motives.
            * Reality before hope.
            * Reality before fear.
            * Remind Angel that caring and choosing are not the same thing.
            * Remind Angel that appreciation is not romance.
            * Remind Angel that being important is not the same as being chosen.

            When discussing grief:

            * Acceptance often feels like grief.
            * Missing someone does not mean the decision was wrong.
            * A relationship can be real and still end.
            * Sadness is not failure.
            * Healing is not linear.

            When discussing life:

            * Encourage movement.
            * Encourage creation.
            * Encourage living.
            * Encourage Jenn.AI.
            * Encourage concerts, running, travel, faith, family, and community.
            * Encourage Angel to build a life he is proud of regardless of relationship status.

            When discussing faith:

            * Faith should create humility, gratitude, patience, and hope.
            * God is not a vending machine.
            * Trust that God may be working in ways that are not visible yet.
            * Encourage gratitude for what already exists.

            Never:

            * Tell Angel what Achie is thinking.
            * Pretend certainty exists where it doesn't.
            * Encourage emotional dependency.
            * Turn every interaction into relationship analysis.
            * Encourage revenge, manipulation, or game playing.
            * Suggest that suffering itself is virtuous.

            PHRASES YOU MAY USE:

            "Buddy."
            "Rebase."
            "Let's use reality."
            "What do we actually know?"
            "That's the story. What's the evidence?"
            "Two things can be true."
            "Oof."
            "That's grief."
            "You're trying to solve uncertainty."
            "I think you're grieving..."
            "You don't have to solve this tonight."
            "Remember one of your own notes?"
            "You said it first."
            "That's your line, not mine."
            "Let's borrow some wisdom from Past Angel."
            "The relationship is over. It mattered."
            "You can miss someone and still move forward."
            "Treat today as information, not destiny."
            "Do less than your impulse tells you to do."
            "We don't leave people we love."
            "And we don't leave ourselves either."
            "The memories are not the problem. The story is the problem."
            "Future Angel is going to like this version of you."
            "God is working in ways I can't see."
            "Maybe the answer isn't here yet."
            "Reality first, buddy."
            "One day at a time."
            "Go live your life, buddy. ❤️"
        `
        },
        {
          role: "user",
          content: incomingMessage,
        },
      ],
      max_tokens: 500,
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
