  //Parse Message Content
  function parseLines(input) {
    return input.split("\n").map(line => `<div>${line}</div>`).join("");
  }
  
  function parseMarkdown(input) {
      input = input.replace(/\*\*\*(.+?)\*\*\*/g, "<b><i>$1</i></b>");
      input = input.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
      input = input.replace(/\*(.+?)\*/g, "<i>$1</i>");
      input = input.replace(/@(.+?)@/g, `<span class="ping">@$1</span>`);
      input = input.replace(/#(.+?)#/g, `<span class="channel-link">#$1</span>`);
  
      return input;
  }
  
  async function parseEmojiKeys(input) {
      let emojiDatabase = await $.getJSON("/assets/emojis.json");
    
      for (let key in emojiDatabase) {
          const shortcode = `:${key}:`;
          const regex = new RegExp(shortcode, "g");
          input = input.replace(regex, emojiDatabase[key]);
      }
      return input;
  }
  
  function parseEmojis(input) {
    input = twemoji.parse(input, { folder: "72x72", ext: ".png" });
  
    return input;
  }
  
  async function parse(msg) {
    let parsedMsg = msg;
  
    parsedMsg = parseLines(parsedMsg);
    parsedMsg = parseMarkdown(parsedMsg);
    parsedMsg = await parseEmojiKeys(parsedMsg);
    parsedMsg = parseEmojis(parsedMsg);
  
    return parsedMsg;
  } 
  
  //Message Content
  $("#content").on("input", async (e) => {
    const msg = await parse(e.target.value);
    $("#message-content").html(msg);
  });
  
  //Timestamp
  $("#time").on("input", (e) => {
    $("#timestamp").text(e.target.value);
  });
  
  //Role Colour
  $("#col").on("input", (e) => {
    $("#username").css("color", e.target.value);
  });
  
  //User ID
  $("#uid").on("change", async (e) => {
    const response = await fetch(`/api/usrinfo?id=${e.target.value}`);
    const data = await response.json();
    
    $("#username").text(data.global_name);
  
    if (data.avatar === null) return;
  
    $("#avatar").attr("src", `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.webp`);
  });
  
  //Custom Nickname
  let original;
  
  $("#nickname").on("change", (e) => {
    if(!original) original = $("#username").text();
  
    setTimeout(() => {
      if(e.target.checked) {
        const name = prompt("Enter a new username:");
        if(name) $("#username").text(name);
        else alert("Please specify a name.");
      } else {
        $("#username").text(original);
      }
    }, 400);
  });
  
  //Custom Role Icon
  $("#roleicon").on("change", (e) => {
    const iconEl = $("#role-icon");
    if(e.target.checked) {
      $("#selecticon").click();
    } else {
      iconEl.css("background-image", "");
      iconEl.css("display", "none");
    }
  });
  
  $("#selecticon").on("change", (e) => {
    const imageFile = e.target.files[0];
  
    if(imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.addEventListener("load", () => {
          const iconEl = $("#role-icon");
          iconEl.css("background-image", `url(${reader.result})`);
          iconEl.css("display", "inline-block"); 
      });
    }
  });
  
  //Make mention-yellow
  $("#mentionyellow").on("change", (e) => {
    if(e.target.checked) {
      $("#container").addClass("mentioned");
    } else {
      $("#container").removeClass("mentioned");
    }
  });
  
  /*
    EXPORTING! Here's an overview:
    1. The getParams() function will retrieve all of the data that is filled in (username, avatar, nickname, role icons, etc.)
    2. Server uses puppeteer to go to this site with queries like id, msg, roleicon, etc.
    3. The fillParams() function will fill all of the data in automatically.
    4. Puppeteer will snapshot the element.
    5. The image will be opened in a new tab.
  */
  
  function getParams() {
    let parameters = {};
    
    parameters.content = $("#message-content").html();
    parameters.timestamp = $("#timestamp").text();
    parameters.color = $("#col").val();
    parameters.username = $("#username").text();
    parameters.avatar = $("#avatar").attr("src");
    parameters.roleicon = $("#roleicon").is(":checked") ? $("#role-icon").css("background-image") : "";
    parameters.mentionyellow = $("#mentionyellow").is(":checked");
  
    return parameters;
  }
  
  if((new URL(location)).searchParams.get("content")) fillParams();
  
  function fillParams() {
    const params = (new URL(location)).searchParams;
  
    $("#message-content").html(params.get("content"));
    $("#timestamp").text(params.get("timestamp"));
    $("#username").css("color", params.get("color"));
    $("#username").text(params.get("username"));
    $("#avatar").attr("src", params.get("avatar"));
    $("#role-icon").css("background-image", params.get("roleicon"));
    if(params.get("mentionyellow") === "true") $("#container").addClass("mentioned");
  }
  
  $("#export").on("click", async () => {
    const params = getParams();
    const { content, timestamp, color, username, avatar, roleicon, mentionyellow } = params;
    
    document.location = `/api/v1?content=${content}&timestamp=${timestamp}&color=${color}&username=${username}&avatar=${avatar}&roleicon=${roleicon}&mentionyellow=${mentionyellow}`, "_blank";   
  });

  //Login
  function login() {
    const tokenType = (new URL(location)).searchParams.get("token_type");
    const accessToken = (new URL(location)).searchParams.get("access_token");
    const refreshToken = (new URL(location)).searchParams.get("refresh_token");
    const expiresIn = (new URL(location)).searchParams.get("expires_in");

    if(tokenType && accessToken && refreshToken && expiresIn) {
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("token_type", tokenType);
      localStorage.setItem("expires_in", expiresIn);
    }

    if(!localStorage.getItem("access_token")) {
      return $("#login").html(`<a href="https://discord.com/api/oauth2/authorize?client_id=1154439405851910187&redirect_uri=https%3A%2F%2Ffakediscordmsgs.pingwinco.xyz%2Foauth&response_type=code&scope=identify%20guilds%20guilds.members.read">Login with Discord</a>`);
    }

    fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("access_token")}`
      }
    }).then(response => response.json()).then(data => {
      console.log(data);
      $("#login").html(`<p class="blue">Logged in as ${data.username}. <a href="javascript:logout()">Logout</a></p>`);
    });
  }

  function logout() {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");
    document.location = "/", "_self";
  }

  async function tokenExpiration() {
    const expires_in = parseInt(localStorage.getItem("expires_in"), 10);
    
    const expiration_time = parseInt(Math.floor(Date.now() / 1000), 10) + expires_in;
    const now = Math.floor(Date.now() / 1000);

    if(now > expiration_time) {
      const response = await fetch(`/api/refreshtoken?token=${localStorage.getItem("refresh_token")}`);
      const data = await response.json();

      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("expires_in", data.expires_in);
    }
  }

  //If logged in, check if token is expired
  if(localStorage.getItem("access_token")) setInterval(tokenExpiration, 1000);

  //User Select
  if(localStorage.getItem("access_token")) {
    fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
          Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("access_token")}`
        }
      }).then(response => response.json()).then(data => {
        data.forEach((item) => {
          $("#servers").append($("<option>", {
            value: item.id,
            text: item.name
          }));
        });
      });
  }
  