import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { middleware, messagingApi, WebhookEvent } from "@line/bot-sdk";
import OpenAI from "openai";

dotenv.config();

const { MessagingApiClient } = messagingApi;

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY || "",
});

const app = express();
app.use(cors());
app.use("/webhook", middleware(config));
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const event: WebhookEvent = req.body.events[0];
  if (event === undefined || event.type !== "message") {
    res.sendStatus(200);
    return;
  }

  let userMessage = "";
  if (event.message.type === "text") {
    userMessage = event.message.text;
  }

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: userMessage }],
    model: "gpt-3.5-turbo",
  });

  const client = new MessagingApiClient({
    channelAccessToken: config.channelAccessToken,
  });

  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      { type: "text", text: chatCompletion.choices[0].message.content },
    ],
  });
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
