# Fake Discord Messages V2
Easily create fake discord messages with this advanced tool.

```
FakeDiscordMessages V2
https://fakediscordmsgs.pingwinco.xyz/
  

This app was made with fun in mind. Do not use it with malicious intent.
I do not hold responsibility for anything made with my application.

Not affiliated with Discord, Discord Inc.
Made by penguins184
```

# Documentation

## /api/v1

The V1 API uses GET + queries. 

```
https://fakediscordmsgs.pingwinco.xyz/api/v1

?content=... (Message Content)
&timestamp=... (Message Timestamp)
&color=... (Message Color/HEX)
&username=... (Username to display)
&avatar=... (Path to image)
&roleicon=... (Path to image/base64)
&mentionyellow... (true/false is it yellow as if you were mentioned)
```

Example:

```
https://fakediscordmsgs.pingwinco.xyz/api/v1?content=This is a fake message content.&timestamp=Today at 00:00&username=Example&avatar=/assets/defaultprofile.png
```

## /api/v2

The V2 API uses POST.

```json
{
    "content": "...",
    "timestamp": "...",
    "color": "...",
    "username": "...",
    "avatar": "...",
    "roleicon": "...",
    "mentionyellow": null
}
```

Example:

```js
const response = await fetch("https://fakediscordmsgs.pingwinco.xyz/api/v2", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        content: "This is a fake message content.",
        timestamp: "Today at 00:00",
        username: "Example",
        avatar: "/assets/defaultprofile.png"
    })
});

const data = await response.blob();
const url = window.URL.createObjectURL(new Blob([data]));

console.log(url);

document.querySelector("...").src = url;
```