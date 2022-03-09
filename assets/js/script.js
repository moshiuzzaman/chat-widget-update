let chatListsDiv = document.getElementById("cems__all__chatlist");
let chatboxChattingDiv = document.getElementById("cems__chatbox__chatting");
let chatlistHeaderText = document.getElementById("cems__chatlist__header__text");
let chatboxMessagesDiv = document.getElementById("cems__chatbox__messages");

let scrollBottom = () => {
  var chatEl = document.getElementById("cems__chatbox__messages");
  chatEl.scrollTop = chatEl.scrollHeight;
};
let usersToggle = (data) => {
  let element = `
    <div class="cems__chat__list" id='${data.chat_uid}' onclick={showMesseges(this.id)}>
    <div class="cems__friend__icon">
      <p>${data.name.toUpperCase().charAt(0)}</p>
    </div>
    <div class="cems__chatlist__content">
      <h4 class="cems__chatlist__friendName">${data.name}</h4>
    </div>
  </div>
    `;
  return (chatListsDiv.innerHTML += element);
};
let chatsToggle = (data) => {
  let lastMessageDetails = data.messages.pop();
  console.log(lastMessageDetails);
  let lastMessage = "";
  if (lastMessageDetails != undefined) {
    data.messages.push(lastMessageDetails);
    if (lastMessageDetails.messageType == 2) {
      if (lastMessageDetails.text.substring(0, 27) === "FiLe-https://tradazine.com/") {
        lastMessage = `You : Send a file`;
      } else {
        lastMessage = `You : ${lastMessageDetails.text}`;
      }
    } else {
      if (lastMessageDetails.type !== "TEXT") {
        lastMessage = ` Send a file`;
      } else {
        lastMessage = lastMessageDetails.text;
      }
    }
  }

  let isUnread = unreadMessageId.find((id) => id == data.chat_uid);
  let setclass = "";
  if (isUnread != undefined) {
    setclass = "unseen__message";
  }
  let timeStamp = "";
  if (lastMessageDetails !== undefined) {
    if (lastMessageDetails.timeStamp !== null && lastMessageDetails.timeStamp !== undefined) {
      timeStamp = lastMessageDetails.timeStamp.split("|")[1];
    }
  }

  let element = `
    <div class="cems__chat__list ${setclass}" id='${data.chat_uid}' onclick={showMesseges(this.id)}>
      <div class="cems__friend__icon">
        <h3>${data.name.toUpperCase().charAt(0)}</h3>
      </div>
      <div class="cems__chatlist__content">
        <div class="cems__chatlist_fNameAndMessage">
          <h4 class="cems__chatlist__friendName">${data.name}</h4>
          <p class="chatListLastMessage"> ${lastMessage}</p>
        </div>
        <div class="cems__chatlist__time">
         <p  class="chatListLastMessageTime"> ${timeStamp}</p>
        </div>
      </div>
      
    </div>
    `;
  return (chatListsDiv.innerHTML += element);
};
let gotoChatList = () => {
  let className = calleeId;
  chatListsDiv.innerHTML = "";
  chatlistHeaderText.innerText = "Chats";
  if (chatListData.length < 1) {
    chatListsDiv.innerHTML = `<p class="cems__no_found">No Chats found</p>`;
  } else {
    chatListData.map((data) => {
      chatsToggle(data);
    });
  }
};
let gotoUsers = () => {
  chatbox.gotoUsers();
  chatListsDiv.innerHTML = "";
  chatlistHeaderText.innerText = "Users";
  if (friendList.length < 1) {
    chatListsDiv.innerHTML = `<p class="cems__no_found">No Friend found</p>`;
  } else {
    friendList.map((data) => {
      usersToggle(data);
    });
  }
};
async function showMesseges(id) {
  inMessages = true;
  let exactData = chatListData.find((data) => data.chat_uid == id);
  if (exactData == undefined) {
    exactData = friendList.find((data) => data.chat_uid == id);
    exactData.messages = [];
  }
  calleeId = exactData.chat_uid;
  unreadMessageId = unreadMessageId.filter((id) => id != exactData.chat_uid);
  calleeName = exactData.name;

  chatboxChattingDiv.innerHTML = chatboxChating(exactData);
  sendMessageWithEnterKey();
  chatbox.gotoChat();
  filesend();
  imageAndFileQuery();
  let onlineStatus = await agoraFunction.checkPeerOnlineStatus(exactData.chat_uid);
  let onlineOrOflineIcon = document.getElementById("cems__onlineOrOfflineIcon");
  let onlineOrOflineText = document.getElementById("cems__onlineOrOfflineText");
  if (onlineStatus) {
    onlineOrOflineIcon.classList.remove("cems__offlineIcon");
    onlineOrOflineIcon.classList.add("cems__onlineIcon");
    onlineOrOflineText.classList.remove("cems__offlineText");
    onlineOrOflineText.classList.add("cems__onlineText");
    onlineOrOflineText.innerText = "Active now";
  } else {
    onlineOrOflineIcon.classList.add("cems__offlineIcon");
    onlineOrOflineIcon.classList.remove("cems__onlineIcon");
    onlineOrOflineText.classList.add("cems__offlineText");
    onlineOrOflineText.classList.remove("cems__onlineText");
    onlineOrOflineText.innerText = "Offline";
  }
  if (exactData.messages.length) {
    controlSentOrReciveMessage(exactData);
  }
}

let backToChatList = () => {
  inMessages = false;
  gotoChatList();
  chatbox.backTochatList();
};

let controlSentOrReciveMessage = (data) => {
  console.log(data);
  let chatboxMessages = document.createElement("ul");

  chatboxMessages.innerHTML = "";

  data.messages.map((m) => {
    console.log(m);
    let chatboxMessageTime = (type) => {
      chatboxMessages.innerHTML += `<div class="cems__messages__time-${type}">${m.timeStamp}</div>`;
    };
    let message = m.text;

    if (m.messageType == 2) {
      if (m.type === "FILE" || m.type === "IMAGE") {
        let fileLink = m.mediaUrl;
        let fileName = m.mediaName;
        if (m.type === "IMAGE") {
          chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--operator_image">
<a href="${fileLink}" download target="_blank">
        <img src="${fileLink}" alt="" style="width:125px">
        </a>
      </div>`;
          chatboxMessageTime("operator");
        } else {
          chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--operator"  >
      <a href="${fileLink}" download target="_blank">
      <img src="https://img.icons8.com/carbon-copy/100/000000/file.png" style="width:70px"/><br>
      <a href="${fileLink}" download target="_blank" style="color:#ffecec">${fileName}</a>
      </a>
      </div>`;
          chatboxMessageTime("operator");
        }
      } else {
        chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--operator">${m.text}</div>`;
        chatboxMessageTime("operator");
      }
    } else {
      if (m.type === "FILE" || m.type === "IMAGE") {
        let fileLink = m.mediaUrl;
        let fileName = m.mediaName;
        if (m.type === "IMAGE") {
          chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--visitor_image" >
          <a href="${fileLink}" download target="_blank">
          <img src="${fileLink}" alt="" style="width:125px">
          </a>
      </div>`;
          chatboxMessageTime("visitor");
        } else {
          chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--visitor"  >
      <a href="${fileLink}" download target="_blank">
      <img src="https://img.icons8.com/carbon-copy/100/000000/file.png" style="width:70px"/><br>
          <a href="${fileLink}" download target="_blank">${fileName}</a>
      </a>
      </div>`;
          chatboxMessageTime("visitor");
        }
      } else {
        chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--visitor">${m.text}</div>`;
        chatboxMessageTime("visitor");
      }
    }
  });
  document.getElementById("cems__chatbox__messages").innerHTML = chatboxMessages.innerHTML;
  scrollBottom();
  return chatboxMessages.innerHTML;
};
let getFileByMediaId = (mediaId) => {};
// Convert the Blob to an image file

let finalFileMessageOutput = (time, type, mediaMessage, src) => {
  let createTimeOutput = document.createElement("div");
  createTimeOutput.className = "cems__messages__time-operator";
  createTimeOutput.innerHTML = `${time}`;
  let fileLink = src;
  let fileName = mediaMessage.fileName;
  let createMessageOutputDiv = document.createElement("div");
  if (type === "IMAGE") {
    createMessageOutputDiv.className = "cems__messages__item cems__messages__item--operator_image";
    createMessageOutputDiv.innerHTML = `<a href="${fileLink}"  target="_blank">
    <img src="${fileLink}" alt="" style="width:125px">
    </a>`;
  } else {
    createMessageOutputDiv.className = "cems__messages__item cems__messages__item--operator";
    createMessageOutputDiv.innerHTML = `<a href="${fileLink}"  target="_blank">
    <img src="https://img.icons8.com/carbon-copy/100/000000/file.png" style="width:70px"/><br>
    <a href="${fileLink}" download target="_blank" style="color:#ffecec">${fileName}</a>
    </a>`;
  }
  document.getElementById("cems__chatbox__messages").appendChild(createMessageOutputDiv);
  document.getElementById("cems__chatbox__messages").appendChild(createTimeOutput);
};
let percent;

let createFileMessageOutput = async (mediaMessage, time, type) => {
  let fileBlob = await rtmClient.downloadMedia(mediaMessage.mediaId, {
    onOperationProgress: ({ currentSize, totalSize }) => {
      downloadPercent = Math.round((currentSize / totalSize) * 50);
      percent = 50 + downloadPercent;
      console.log(percent);
    },
  });
  console.log(agoraFunction);
  agoraFunction.blobToImage(fileBlob, async (file) => {
    message = {
      text: "",
      messageType: type,
      time: time,
      mediaId: mediaMessage.mediaId,
      mediaUrl: file.src,
      mediaName: mediaMessage.fileName,
    };
    chatListDataStore(message, clickFriendId, allDetails.userName, "sent");
    removeSelectFile();
    var image = new Image();
    image.src = file.src;
    mediaMessage.description = image;
    console.log(mediaMessage);
    await rtmClient
      .sendMessageToPeer(mediaMessage, clickFriendId)
      .then((sendResult) => {
        if (sendResult.hasPeerReceived) {
          console.log("message recived");
        } else {
          console.log("message send");
        }
        finalFileMessageOutput(time, type, mediaMessage, file.src);
      })
      .catch((err) => {
        console.log(err.message);
        alert(err.message);
      });

    document.getElementById("sendMessageBtn").disabled = false;
    document.getElementById("sendMessageBtn").innerHTML = '<img src="https://img.icons8.com/material/96/03a9f4/filled-sent.png">';
  });
};
let createTextMessageOutput = (message, time, type) => {
  let createTimeOutput = document.createElement("div");
  createTimeOutput.className = "cems__messages__time-operator";
  createTimeOutput.innerHTML = `${time}`;

  if (type === "IMAGE" || type === "FILE") {
    createFileMessageOutput(message, time, type);
  } else {
    let createMessageOutputDiv = document.createElement("div");
    createMessageOutputDiv.className = "cems__messages__item cems__messages__item--operator";
    createMessageOutputDiv.innerHTML = `${message}`;
    document.getElementById("cems__chatbox__messages").appendChild(createMessageOutputDiv);
    document.getElementById("cems__chatbox__messages").appendChild(createTimeOutput);
  }
};
let sendMessageWithEnterKey = () => {
  let cems__input__message = document.getElementById("cems__input__message");
  cems__input__message.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      console.log("first");
      event.preventDefault();
      sendMessage();
    }
  });
};
let isImage = false;
let sendFileMessage = async (id, message = null) => {
  document.getElementById("sendMessageBtn").disabled = true;
  document.getElementById("sendMessageBtn").innerHTML = '<div class="bs__loader"></div>';
  id = clickFriendId;
  let currentDateTime = getCurrentDateTime();
  const fileToBlob = async (file) => new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type });
  let blobF = await fileToBlob(selectFile);
  let mediaMessage = await rtmClient.createMediaMessageByUploading(
    blobF,
    {
      messageType: isImage ? "IMAGE" : "FILE",
      fileName: selectFile.name,
    },
    {
      onOperationProgress: ({ currentSize, totalSize }) => {
        percent = Math.round((currentSize / totalSize) * 50);
        console.log(percent);
      },
    }
  );
  console.log(mediaMessage);
  createFileMessageOutput(mediaMessage, currentDateTime, isImage ? "IMAGE" : "FILE");
};
let sendMessage = async (id, message = null) => {
  id = clickFriendId;
  let currentDateTime = getCurrentDateTime();
  console.log(message);
  if (message == null) {
    typeMessage = document.getElementById("cems__input__message").value;
    message = {
      text: typeMessage,
      type: "TEXT",
      time: currentDateTime,
      mediaUrl: undefined,
      mediaId: undefined,
      mediaName: undefined,
    };
    document.getElementById("cems__input__message").value = "";
  }

  if (message.text.length == 0 && selectFile == undefined) {
    alert("write something");
  } else {
    if (selectFile != undefined) {
      sendFileMessage();
    }
    if (message.text.length == 0) {
    } else {
      let exactMessagesData = chatListDataStore(message, id, allDetails.userName, "sent");

      createTextMessageOutput(message.text, currentDateTime, message.type);
      var chatEl = document.getElementById("cems__chatbox__messages");
      chatEl.scrollTop = chatEl.scrollHeight;
      await agoraFunction.sendPeerMessage(message, exactMessagesData.chat_uid);
    }
  }
};
let filesend = () => {
  document.getElementById("cems_file_upload").addEventListener("change", function (e) {
    selectFile = e.target.files[0];
    console.log(selectFile);
    if (selectFile === undefined) {
      document.getElementById(
        "cems_send_message"
      ).innerHTML = `<input id="cems__input__message" type="text" placeholder="Write a message..." autocomplete="off"/>`;
    } else {
      let fileName = e.target.files[0].name;
      let fileExtention = fileName.split(".").pop().toLowerCase();
      if (fileName.length > 30) {
        fileName = fileName.substring(0, 30) + "..." + fileExtention;
      }
      document.getElementById("bs__image_fileSelect").style.left = "-416px";
      document.getElementById("bs_input_file_output").style.left = "16px";
      console.log(fileExtention);
      if (fileExtention === "txt" || fileExtention === "pdf") {
        isImage = false;
        document.getElementById("bs_input_file_show_image").src = "https://img.icons8.com/material-two-tone/96/60A5FA/file.png";
        document.getElementById("bs_input_file_show_name").innerText = fileName;
      } else {
        isImage = true;
        console.log(URL.createObjectURL(selectFile));
        document.getElementById("bs_input_file_show_image").src = URL.createObjectURL(selectFile);
        document.getElementById("bs_input_file_show_name").innerText = "";
      }
    }
  });
};
let chatListDataStore = (message, id, name, type) => {
  console.log(message);

  let messageType;
  if (type == "sent") {
    messageType = 2;
  } else {
    messageType = 3;
  }

  let exactMessagesData = chatListData.find((d) => d.chat_uid == id);
  if (exactMessagesData == undefined) {
    exactMessagesData = friendList.find((data) => data.id == id);
    if (exactMessagesData === undefined) {
      exactMessagesData = friendList.find((data) => data.chat_uid == id);
      exactMessagesData.messages = [
        {
          type: message.messageType,
          messageType: messageType,
          text: message.text,
          timeStamp: message.time,
          username: name,
          mediaUrl: message.mediaUrl,
          mediaId: message.mediaId,
          mediaName: message.mediaName,
        },
      ];
    } else {
      exactMessagesData.messages = [
        {
          type: message.messageType,
          messageType: messageType,
          text: message.text,
          timeStamp: message.time,
          username: name,
          mediaUrl: message.mediaUrl,
          mediaId: message.mediaId,
          mediaName: message.mediaName,
        },
      ];
    }

    chatListData.unshift(exactMessagesData);
    document.getElementById("cems__chatbox__messages").innerHTML = "";
  } else {
    let withoutExactMessagesData = chatListData.filter((d) => d.chat_uid != id);
    if (exactMessagesData.messages.length == 0) {
      document.getElementById("cems__chatbox__messages").innerHTML = "";
    }
    exactMessagesData.messages.push({
      type: message.messageType,
      messageType: messageType,
      text: message.text,
      timeStamp: message.time,
      username: name,
      mediaUrl: message.mediaUrl,
      mediaId: message.mediaId,
      mediaName: message.mediaName,
    });
    chatListData = [exactMessagesData, ...withoutExactMessagesData];
  }
  return exactMessagesData;
};
// let newChatListStore = (message, id, name, type, time) => {
//   let messageType;
//   if (type == "sent") {
//     messageType = 2;
//   } else {
//     messageType = 3;
//   }

//   let exactMessagesData = newChatList.find((d) => d.chat_uid == id);
//   if (exactMessagesData == undefined) {
//     console.log(friendList)
//     exactMessagesData = friendList.find((data) => data.chat_uid == id);

//     exactMessagesData.messages = [
//       {
//         messageType: messageType,
//         text: message.text,
//         timeStamp: time,
//         username: name,
//       },
//     ];
//     newChatList.unshift(exactMessagesData);
//   } else {
//     let withoutExactMessagesData = newChatList.filter((d) => d.id != id);

//     exactMessagesData.messages.push({
//       messageType: 2,
//       text: message.text,
//       timeStamp: time,
//       username: allDetails.userName,
//     });

//     newChatList = [exactMessagesData, ...withoutExactMessagesData];
//   }
// };
let imageAndFileQuery = () => {
  document.getElementById("bs__imageSelect").addEventListener("click", () => {
    document.getElementById("cems_file_upload").setAttribute("accept", "image/*");
  });
  document.getElementById("bs__anyFileSelect").addEventListener("click", () => {
    document.getElementById("cems_file_upload").setAttribute("accept", " .pdf");
  });
};

let showSelectFileVisibility = false;
let removeSelectFile = () => {
  selectFile = undefined;
  document.getElementById("bs_input_file_output").style.left = "-416px";
  showSelectFileVisibility = false;
  document.getElementById("selectFilePlusIcon").style.transform = "rotate(0deg)";
  document.getElementById("bs__image_fileSelect").style.left = "-416px";
};
let showSelectFile = () => {
  if (showSelectFileVisibility == false) {
    showSelectFileVisibility = true;
    console.log(selectFile);
    document.getElementById("bs__image_fileSelect").style.left = "16px";
    document.getElementById("selectFilePlusIcon").style.transform = "rotate(45deg)";
  } else {
    removeSelectFile();
  }
};
let chatboxChating = (data) => {
  clickFriendId = data.chat_uid;
  return `
  <div class="cems__chatbox__header">
    <div class="cems__chat__details">
    <div id="cems__chatbox_backButton--header" onclick=backToChatList()>
    <img src="https://img.icons8.com/material-outlined/96/000000/back--v1.png"/>
    </div>
    <div class="cems__chatHead__friend__icon">
      <p>${data.name.toUpperCase().charAt(0)}</p>
      <div id='cems__onlineOrOfflineIcon' class='cems__offlineIcon'></div>
    </div>
    <div class="cems__chatbox__content--header">
      <h4 class="cems__chatbox__heading--header">${data.name}</h4>
      <p id='cems__onlineOrOfflineText' class="cems__offlineText">Offline</p>
    </div>
  </div>
  <div class="cems__chat__callicon">
  <img  class="cems__chat__VideoCallicon" src="https://img.icons8.com/material-outlined/96/60A5FA/video-call.png" onclick=agoraFunction.audioVideoCall('video')>
  <img class="cems__chat__audioCallicon" src="https://img.icons8.com/windows/96/60A5FA/phone-disconnected--v1.png" onclick=agoraFunction.audioVideoCall('')>
  </div>
</div>
<div id="cems__chatbox__messages" class="cems__messageFor${data.chat_uid}">
  ${!data.messages.length ? `<p class="cems__no_found">No message found</p>` : `<p class="cems__no_found">Loading....</p>`}
</div>
<div id="bs__image_fileSelect">
  <div id="bs__imageSelect">
  <label for="cems_file_upload">
  <img src="https://img.icons8.com/material-outlined/24/60A5FA/add-image.png"/>
  <p>Image</p>
  </div>
</label>
   <div id="bs__anyFileSelect">
   
<label for="cems_file_upload">
   <img src="https://img.icons8.com/ios/50/60A5FA/add-file.png"/>
   <p>File</p>
</label>
  </div>
  
</div>
<div id="bs_input_file_output">
  <img id="selectFileRemoveIcon" src="https://img.icons8.com/windows/96/60A5FA/plus.png " onclick=removeSelectFile()>
  <div id='bs_input_file_show'>
  <img id='bs_input_file_show_image' src=""/>
  <p id='bs_input_file_show_name'></p>
  </div>
</div>

<div class="cems__chatbox__footer_inmessage">
<img id="selectFilePlusIcon" src="https://img.icons8.com/windows/96/60A5FA/plus.png " onclick=showSelectFile()>
<input type="file" id="cems_file_upload"  name="cems_file_upload" style="display:none;">
  
  <div id="cems_send_message">
  <input id="cems__input__message" type="text" placeholder="Write a message..." autocomplete="off"/>
  </div>
  <button id="sendMessageBtn" class="cems__chatbox__send--footer" onclick=sendMessage()>
  <img src="https://img.icons8.com/fluency-systems-regular/96/60A5FA/sent.png" onmouseover="this.src='https://img.icons8.com/fluency-systems-filled/96/60A5FA/sent.png'" onmouseout="this.src='https://img.icons8.com/fluency-systems-regular/96/60A5FA/sent.png'"/>
  </button>
  
</div>
  `;
};

// modal script************************
var modal = document.getElementById("cems__myModal");

// Get the button that opens the modal
var btn = document.getElementById("cems__myBtn");

// Get the <span> element that closes the modal

// When the user clicks the button, open the modal