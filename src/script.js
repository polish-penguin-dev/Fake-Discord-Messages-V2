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

  