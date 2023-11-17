import chromium from "chrome-aws-lambda";
import fetch from "node-fetch";
import express from "express";
const app = express();

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
  
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();

  await page.goto(`https://fakediscordmessages-v2.polish-penguin-dev.repl.co?content=${content}&timestamp=${timestamp}&color=${color}&username=${username}&avatar=${avatar}&roleicon=${roleicon}&mentionyellow=${mentionyellow}`);

  await page.waitForTimeout(50);

  const elementHandle = await page.$("#container");
  const snapshot = await elementHandle.screenshot();

  await browser.close();

  res.send(snapshot);
});

app.use(express.static(process.cwd() + "/src"));

app.listen(3000, () => {
  console.log("Listening on port 3000");
});