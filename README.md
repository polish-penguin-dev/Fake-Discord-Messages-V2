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

The V1 API uses queries. 

```
https://fakediscordmsgs.pingwinco.xyz/api/v1

?content=... (Message Content)
&timestamp =... (Message Timestamp)
&color=... (Message Color/HEX)
&username=... (Username to display)
&avatar=... (Path to image)
&roleicon=... (Path to image/base64)
&mentionyellow... (true/false is it yellow as if you were mentioned)
```

Example:

```ansi
https://fakediscordmsgs.pingwinco.xyz/api/v1?[2;36m[1;36mcontent=[0m[2;36m[2;37mexample[0m[2;36m[0m[1;2m[0m[2;35m[1;35m&timestamp=[0m[2;35m[0mToday at 12:54[1;2m[1;34m&color=[1;37m[0m[1;34m[0m[0morange[1;2m[1;32m&username=[0m[0mpenguins184[2;31m[1;31m&avatar=[0m[2;31m[0m/assets/defaultprofile.png
```

## /api/v2

The V2 API uses post.

**Coming Soon**