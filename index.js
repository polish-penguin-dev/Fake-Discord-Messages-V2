import puppeteer from "puppeteer";
import fetch from "node-fetch";
import express from "express";
import cors from "cors";
import fs from "fs";
import { URL } from "url";
const app = express();

app.use(cors());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/src/index.html");
});

//Grab info about user by ID.
app.get("/api/usrinfo/", async (req, res) => {
  const id = req.query.id;

  try {
    const response = await fetch(`https://discord.com/api/v9/users/${id}`, {
      headers: {
        Authorization: `Bot ${process.env.token}`
      }
    });
    const data = await response.json();
    
    res.json(data);
  } catch(err) {
    res.send("Discord API error");
  }
});

//V1 API uses queries.
app.get("/api/v1/", async (req, res) => {
  const { content, timestamp, color, username, avatar, roleicon, mentionyellow } = req.query;
  
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ["--disable-extensions"],
    headless: "new"
  });

  console.log("Puppeteer instance started!");

  const page = await browser.newPage();

  await page.goto(`https://fakediscordmsgs.pingwinco.xyz?content=${content}&timestamp=${timestamp}&color=${color}&username=${username}&avatar=${avatar}&roleicon=${roleicon}&mentionyellow=${mentionyellow}`);

  const message = await page.waitForSelector("#container");

  const snapshot = await message.screenshot();

  await browser.close();

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", "inline; filename=snapshot.png");

  res.send(snapshot);

  console.log("Sent buffer to client!");
});

//V2 API uses post.
app.post("/api/v2/", async (req, res) => {
  const { content, timestamp, color, username, avatar, roleicon, mentionyellow } = req.body;
  
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ["--disable-extensions"],
    headless: "new"
  });

  console.log("Puppeteer instance started!");

  const page = await browser.newPage();

  await page.goto(`https://fakediscordmsgs.pingwinco.xyz?content=${content}&timestamp=${timestamp}&color=${color}&username=${username}&avatar=${avatar}&roleicon=${roleicon}&mentionyellow=${mentionyellow}`);

  const message = await page.waitForSelector("#container");

  const snapshot = await message.screenshot();

  await browser.close();

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", "inline; filename=snapshot.png");

  res.send(snapshot);

  console.log("Sent buffer to client!");
});

//Discord OAuth
app.get("/oauth", async (req, res) => {
  const code = req.query.code;
  const params = new URLSearchParams({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    grant_type: "authorization_code",
    code,
    redirect_uri: "https://fakediscordmsgs.pingwinco.xyz/oauth"
  });

  try {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params
    });

    const data = await response.json();
    
    const { update_token, access_token, token_type, expires_in } = data;
    
    res.redirect(`https://fakediscordmsgs.pingwinco.xyz?access_token=${access_token}&token_type=${token_type}&update_token=${update_token}&expires_in=${expires_in}`);
  } catch(err) {
    console.log(err);
  }
});

app.get("/api/refreshtoken", (req, res) => {
  const token = req.query.token;
  const params = new URLSearchParams({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    grant_type: "refresh_token",
    refresh_token: token
  });

  try {
    const response = fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params
    });

    const data = response.json();
    
    const { update_token, access_token, token_type } = data;
    
    res.redirect(`https://fakediscordmsgs.pingwinco.xyz?access_token=${access_token}&token_type=${token_type}&update_token=${update_token}`);
  } catch(err) {
    console.log(err);
  }
});

app.use(express.static(process.cwd() + "/src"));

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on port ${port}!`);
});

