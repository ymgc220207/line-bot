import express from "express";
import { middleware, messagingApi, WebhookEvent } from "@line/bot-sdk";
import cors from "cors";

const { MessagingApiClient } = messagingApi;

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

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

  let message = "";
  if (event.message.type === "text") {
    message = event.message.text;
  }

  const client = new MessagingApiClient({
    channelAccessToken: config.channelAccessToken,
  });

  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: "text", text: message }],
  });
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
