# Jenn AI

Jenn AI is a simple SMS companion powered by Twilio and OpenAI.

## What it does

- Runs an Express server.
- Accepts incoming Twilio SMS webhooks at `POST /sms`.
- Sends each incoming text to OpenAI.
- Replies to the sender with Twilio MessagingResponse TwiML.
- Restricts replies to the phone number configured as `MY_PHONE`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in `.env`:

   ```bash
   OPENAI_API_KEY=your_openai_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE=+15551234567
   MY_PHONE=+15557654321
   PORT=3000
   ```

   Use E.164 phone number format, including the leading `+` and country code.

4. Start the server:

   ```bash
   npm start
   ```

5. Expose your local server with a tunnel such as ngrok:

   ```bash
   ngrok http 3000
   ```

6. In the Twilio Console, set your phone number's incoming message webhook to:

   ```text
   https://your-ngrok-url.ngrok-free.app/sms
   ```

   Use `HTTP POST`.

## Local health check

Once the server is running, visit:

```text
http://localhost:3000/health
```

You should see:

```json
{ "ok": true }
```
