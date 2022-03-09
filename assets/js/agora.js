class agoraFuntionality {
  constructor(getModalSection) {
    this.sections = {
      getModalSection: getModalSection,
      getCallingType: null,
    };
    this.localTracks = {
      localAudioTrack: null,
      localVideoTrack: null,
    };
    this.mute = false;
    this.rtcClient = null;
    this.uid = "";
    this.userName = "";
    this.appId = "";
    this.rtmToken = "";
    this.channelId = "";
    this.rtcToken = "";
    this.rtmClient = "";
    this.status = "ofline";
    this.remoteInvitation = null;
    this.localInvitation = null;
    this.rington = "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3";
    this.collerTune = "https://audio.jukehost.co.uk/2OdnBtHkBRWn76r6YiNesNpb5PTNEg5b";
    this.tokenUrl = "http://47.241.99.15:5000";
    this.appCertificate = "";
  }
  hidecall(res) {
    this.stopCallerTune();
    this.stopRington();
    this.sections.getCallingType.innerHTML = res;
    document.getElementsByClassName("cems__callButtons")[0].style.display = "none";
    setTimeout(() => {
      this.status = "online";
      this.sections.getModalSection.style.display = "none";
    }, 1000);
  }
  playRington() {
    this.rington.play();
  }
  stopRington() {
    this.rington.pause();
    this.rington.currentTime = 0;
  }
  playCallerTune() {
    this.callerTune.play();
  }
  stopCallerTune() {
    this.callerTune.pause();
    this.currentTime = 0;
  }
  async logout() {
    this.rtmClient.logout().then(() => {
      document.getElementById("cems__chatbox__button").classList.add("cems__hide__section");
    });
  }
  async login(uid, name, appId, access_token) {
    this.uid = uid;
    this.appId = appId;
    this.userName = name;
    this.rtmToken = await this.createAgoraRtmToken(uid);
    this.rtmClient = AgoraRTM.createInstance(appId);
    rtmClient = this.rtmClient;
    await this.rtmClient
      .login({ uid, token: this.rtmToken })
      .then(async () => {
        // let data=await getChatData(access_token,uid)
        this.peerMessageRecive();
        this.RemoteInvitationReceived();
        this.status = "online";
        allDetails.userName = name;
        allDetails.userId = uid;
        allDetails.access_token = access_token;
        document.getElementById("cems__chatbox__button").classList.remove("cems__hide__section");
        fetchData(uid);
        gotoChatList();
        friendList = await getFriendListData(access_token, uid);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  init(uid, name, appId, access_token, rington, callerTune, tokenUrl, appCertificate) {
    if (tokenUrl != undefined) {
      this.tokenUrl = tokenUrl;
    }
    if (rington != undefined) {
      this.rington = new Audio(rington);
    }
    if (callerTune != undefined) {
      this.callerTune = new Audio(callerTune);
    }
    this.appCertificate = appCertificate;
    this.login(uid.toString(), name, appId, access_token);
  }
  async createAgoraRtmToken(userName) {
    try {
      const response = await axios.get(
        `${this.tokenUrl}/token/?username=${userName}&channelName=${userName}&appID=${this.appId}&appCertificate=${this.appCertificate}`
      );
      return await response.data.rtmToken;
    } catch (error) {
      console.error(error);
    }
  }
  async createAgoraRtcToken(id) {
    this.callid = id;
    console.log(`${this.tokenUrl}/rtc-uid-token/?uid=${id}&channelName=${this.channelId}&appID=${this.appId}&appCertificate=${this.appCertificate}`);
    try {
      const response = await axios.get(
        `${this.tokenUrl}/rtc-uid-token/?uid=${id}&channelName=${this.channelId}&appID=${this.appId}&appCertificate=${this.appCertificate}`
      );
      return await response.data.token;
    } catch (error) {
      console.error(error);
    }
  }
  async sendPeerMessage(message, peerId) {
    console.log(message);
    scrollBottom();
    if (message.type == "call") {
      return;
    }
    await this.rtmClient.sendMessageToPeer({ text: message.text }, peerId.toString()).then((sendResult) => {
      if (sendResult.hasPeerReceived) {
        console.log("message recived");
      } else {
        console.log("message send");
      }
    });
  }
  async checkPeerOnlineStatus(peerId) {
    return await this.rtmClient.queryPeersOnlineStatus([peerId.toString()]).then((res) => {
      return res[peerId.toString()];
    });
  }
  peerMessageRecive() {
    this.rtmClient.on("MessageFromPeer", async function (message, peerId, proper) {
      let withOutUnreadMessageId = unreadMessageId.filter((id) => id != peerId);
      unreadMessageId = [...withOutUnreadMessageId, peerId];

      message.messageType !== "call" && reciveMessageStoreAndOutput(message, peerId);
      chatbox.unreadMessageCountDisplay();
      chatbox.inChatList = true;
      chatbox.chatListOrUserEffect();
    });
  }
  scrollTop() {
    var chatEl = document.getElementById("cems__chatbox__messages");
    chatEl.scrollTop = chatEl.scrollHeight;
  }
  audioVideoCall = async (type) => {
    if (this.localInvitation != null) {
      this.localInvitation.removeAllListeners();
      this.localInvitation = null;
    }
    this.localInvitation = this.rtmClient.createLocalInvitation(calleeId.toString());

    this.localInvitationEvents();
    this.channelId = this.uid;
    this.localInvitation._channelId = this.uid;
    this.localInvitation._content = type;
    this.calltype = type;
    this.localInvitation.send();
    this.sections.getModalSection.innerHTML = outgoinCallOutput(type);
    this.sections.getCallingType = document.getElementById("callingType");
    this.status = "busy";
    this.sections.getModalSection.style.display = "flex";
    sendMessage(calleeId, { text: `You gave ${calleeName} a ${type} call `, type: "call" });
    this.rtcToken = await this.createAgoraRtcToken(1);
    this.joinReciveCallReciver(this.calltype);
  };

  localInvitationEvents = () => {
    // Send call invitation

    this.localInvitation.on("LocalInvitationReceivedByPeer", (r) => {
      this.sections.getCallingType.innerHTML = `Calling ${calleeName}`;
      this.playCallerTune();
    });
    this.localInvitation.on("LocalInvitationAccepted", (r) => {
      this.stopCallerTune();
      this.joinReciveCallSender(this.calltype);
      recivedCallOutput(this.calltype);
    });

    this.localInvitation.on("LocalInvitationCanceled", (r) => {
      console.log("LocalInvitationCanceled" + r);
    });

    this.localInvitation.on("LocalInvitationRefused", (r) => {
      this.hidecall(`${calleeName} busy now`);
    });
    this.localInvitation.on("LocalInvitationFailure", (r) => {
      this.hidecall(r);
    });
  };

  cancelOutgoingCall() {
    this.localInvitation.cancel();
    this.stopCallerTune();
    this.status = "online";
    this.sections.getModalSection.style.display = "none";
  }

  async RemoteInvitationReceived() {
    this.rtmClient.on("RemoteInvitationReceived", async (remoteInvitation) => {
      if (this.status != "online") {
        remoteInvitation.refuse();
        return;
      }
      if (this.remoteInvitation != null) {
        this.remoteInvitation.removeAllListeners();
        this.remoteInvitation = null;
      }
      this.remoteInvitation = remoteInvitation;
      this.channelId = remoteInvitation._channelId;
      this.rtcToken = await this.createAgoraRtcToken(2);
      this.calltype = remoteInvitation._content.toLowerCase();
      this.caller = friendList.find((f) => f.chat_uid === remoteInvitation.callerId);
      incomingCallOutput(this.caller.name, this.calltype);
      this.playRington();
      this.sections.getCallingType = document.getElementById("callingType");
      this.status = "busy";
      this.sections.getModalSection.style.display = "flex";
      this.peerEvents();
      reciveMessageStoreAndOutput({ text: `${this.caller.name} called You`, type: "call" }, remoteInvitation.callerId);
      this.joinReciveCallReciver(this.calltype);
    });
  }

  peerEvents = () => {
    this.remoteInvitation.on("RemoteInvitationReceived", (r) => {
      console.log("RemoteInvitationReceived" + r);
    });
    this.remoteInvitation.on("RemoteInvitationAccepted", (r) => {
      this.stopRington();
      this.joinReciveCallSender(this.calltype);
      recivedCallOutput(this.calltype);
    });
    this.remoteInvitation.on("RemoteInvitationCanceled", (r) => {
      this.hidecall(`${this.caller.name} canceled the call`);
    });
    this.remoteInvitation.on("RemoteInvitationRefused", (r) => {
      // this.hidecall();
      console.log("RemoteInvitationRefused " + r);
    });
    this.remoteInvitation.on("RemoteInvitationFailure", (r) => {
      // this.hidecall(r);
    });
  };
  cancelIncomingCall() {
    this.remoteInvitation.refuse();
    this.status = "online";
    this.sections.getModalSection.style.display = "none";
  }
  reciveIncomingCall() {
    this.remoteInvitation.accept();
  }
  // ********** video *************

  async joinReciveCallReciver(type) {
    this.rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    this.rtcClient.on("user-published", async (user, mediaType) => {
      await this.rtcClient.subscribe(user, mediaType);
      console.log("subscribe success");
      if (type == "video") {
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack;
          const fricon = document.getElementById("cems__call__reciver");
          remoteVideoTrack.play(fricon);
        }
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
      this.rtcClient.on("user-unpublished", async (user, mediaType) => {
        console.log("unpublish", user, mediaType);
      });
      this.rtcClient.on("user-info-updated", async (user, msg) => {
        console.log("updated", user, msg);
      });
      this.rtcClient.on("user-left", async (user, res) => {
        this.localTracks.localAudioTrack.close();
        this.localTracks.localVideoTrack && this.localTracks.localVideoTrack.close();
        this.localTracks.screenVideoTrack && this.localTracks.screenVideoTrack.close();
        // Leave the channe.
        await this.rtcClient.leave();
        this.sections.getModalSection.style.display = "none";
        this.status = "online";
        clearInterval(callInterval);
        mute = false;
      });
    });
  }
  async joinReciveCallSender(type) {
    await this.rtcClient.join(this.appId, this.channelId, this.rtcToken, this.callid);
    this.localTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    if (type == "video") {
      this.localTracks.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      await this.rtcClient.publish([this.localTracks.localAudioTrack, this.localTracks.localVideoTrack]);
      const mycon = document.getElementById("cems__call__sender");
      this.localTracks.localVideoTrack.play(mycon);
    } else {
      await this.rtcClient.publish([this.localTracks.localAudioTrack]);
    }

    console.log("publish success!");
  }

  muteAudio() {
    this.localTracks.localAudioTrack.close();
  }
  async unmuteAudio() {
    this.localTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await this.rtcClient.publish([this.localTracks.localAudioTrack]);
  }
  async screenshareOn() {
    this.localTracks.screenVideoTrack = await AgoraRTC.createScreenVideoTrack();
    if (this.localTracks.localVideoTrack) {
      await this.rtcClient.unpublish([this.localTracks.localVideoTrack]);
      this.localTracks.localVideoTrack.close();
    }
    await this.rtcClient.publish([this.localTracks.screenVideoTrack]);
    const mycon = document.getElementById("cems__call__sender");
    this.localTracks.screenVideoTrack.play(mycon);
    let getscreenShareBtn = document.getElementById("cems_shareScreenBtn");
    getscreenShareBtn.src = `https://img.icons8.com/ios-filled/80/0998f5/screensharing.png`;
    this.localTracks.screenVideoTrack.on("track-ended", async () => {
      screenshare();
    });
  }
  async screenshareOff() {
    this.rtcClient.unpublish([this.localTracks.screenVideoTrack]);
    this.localTracks.screenVideoTrack.close();
    this.localTracks.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await this.rtcClient.publish([this.localTracks.localVideoTrack]);
    const mycon = document.getElementById("cems__call__sender");
    this.localTracks.localVideoTrack.play(mycon);
  }
  async leaveReciveCall() {
    this.localTracks.localVideoTrack && this.localTracks.localVideoTrack.close();
    this.localTracks.screenVideoTrack && this.localTracks.screenVideoTrack.close();
    this.localTracks.localAudioTrack.close();
    // Leave the channel.
    await this.rtcClient.leave();
    this.sections.getModalSection.style.display = "none";
    this.status = "online";
    clearInterval(callInterval);
    mute = false;
  }
  fileOrBlobToDataURL = (obj, cb) => {
    var a = new FileReader();
    a.readAsDataURL(obj);
    a.onload = function (e) {
      cb(e.target.result);
    };
  };
  blobToImage = (blob, cb) => {
    this.fileOrBlobToDataURL(blob, function (dataurl) {
      var img = new Image();
      img.src = dataurl;
      cb(img);
    });
  };
  reciveFileControl = async (mediaId) => {
    let fileBlob = await rtmClient.downloadMedia(mediaId, {
      onOperationProgress: ({ currentSize, totalSize }) => {
        let downloadPercent = Math.round((currentSize / totalSize) * 50);
        percent = 50 + downloadPercent;
        console.log(percent);
      },
    });
    return fileBlob;
  };
}

let getModalSection = document.getElementById("cems__myModal");
let agoraFunction = new agoraFuntionality(getModalSection);

let cancelOutgoingCall = () => {
  agoraFunction.cancelOutgoingCall();
};
let reciveIncomingCall = () => {
  agoraFunction.reciveIncomingCall();
};
let cancelIncoingCall = () => {
  agoraFunction.cancelIncomingCall();
};
let cancelRecivedCall = () => {
  agoraFunction.leaveReciveCall();
};
let screenShare = false;
let screenshare = () => {
  let getscreenShareBtn = document.getElementById("cems_shareScreenBtn");
  if (screenShare !== false) {
    agoraFunction.screenshareOff();
    getscreenShareBtn.src = `https://img.icons8.com/dotty/80/0998f5/screensharing.png`;
  } else {
    agoraFunction.screenshareOn();
  }
  screenShare = !screenShare;
};
let createRecivedMessageOutput = (message, peerId) => {
  console.log(message);
  let createMessageOutput = document.createElement("div");
  let createTimeOutput = document.createElement("div");
  createTimeOutput.className = "cems__messages__time-visitor";
  createTimeOutput.innerHTML = `${message.time}`;
  if (message.messageType !== "TEXT") {
    let fileLink = message.mediaUrl;
    let fileName = message.mediaName;

    if (message.messageType === "IMAGE") {
      createMessageOutput.className = "cems__messages__item cems__messages__item--visitor_image";
      createMessageOutput.innerHTML = ` <a href="${fileLink}" download target="_blank">
      <img src="${fileLink}" alt="" style="width:125px">
      </a>`;
    } else {
      createMessageOutput.className = "cems__messages__item cems__messages__item--visitor";
      createMessageOutput.innerHTML = ` <a href="${fileLink}" download target="_blank">
      <img src="https://img.icons8.com/carbon-copy/100/000000/file.png" style="width:70px"/><br>
          <a href="${fileLink}" download target="_blank">${fileName}</a>
      </a>`;
    }
  } else {
    createMessageOutput.className = "cems__messages__item cems__messages__item--visitor";
    createMessageOutput.innerHTML = `${message.text}`;
  }
  let className = peerId;
  let isClass = document.getElementsByClassName(`cems__messageFor${className}`)[0];
  if (inMessages == true) {
    if (isClass != undefined) {
      unreadMessageId = unreadMessageId.filter((uid) => uid != peerId);
      isClass.appendChild(createMessageOutput);
      isClass.appendChild(createTimeOutput);
    }
  }
};
let mute = false;
let mutecontrol = () => {
  let getMuteButton = document.getElementById("muteMicrophone");
  if (mute !== false) {
    agoraFunction.unmuteAudio();
    getMuteButton.src =
      "https://img.icons8.com/external-kiranshastry-lineal-kiranshastry/100/0998f5/external-microphone-interface-kiranshastry-lineal-kiranshastry.png";
  } else {
    agoraFunction.muteAudio();
    getMuteButton.src = "https://img.icons8.com/material-rounded/96/000000/block-microphone.png";
  }
  mute = !mute;
};
let videoshare = false;
let videoControl = () => {
  let getVideoMuteBtn = document.getElementById("cems_videomuteBtn");
  if (videoshare == false) {
    getVideoMuteBtn.innerHTML = `<svg class="cems__reciveBtn" onclick=videoControl() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#e74c3c"></path><g fill="#ffffff"><path d="M41.77143,51.6c-5.42046,0 -9.82857,4.40811 -9.82857,9.82857v49.14286c0,5.42046 4.40811,9.82857 9.82857,9.82857h63.88571c5.42046,0 9.82857,-4.40811 9.82857,-9.82857v-14.33973l16.58571,13.26473c0.88949,0.70766 1.97554,1.075 3.07143,1.075c0.7224,0 1.45263,-0.16516 2.1308,-0.48951c1.70526,-0.81577 2.78348,-2.53769 2.78348,-4.42478v-39.31429c0,-1.88709 -1.07822,-3.61369 -2.78348,-4.43438c-1.70034,-0.81086 -3.72795,-0.58434 -5.20223,0.59509l-16.58571,13.26473v-14.33973c0,-5.42046 -4.40811,-9.82857 -9.82857,-9.82857z"></path></g></g></svg>`;
  } else {
    getVideoMuteBtn.innerHTML = `<svg class="cems__reciveBtn" onclick=videoControl() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2aa826"></path><g fill="#ffffff"><path d="M53.93429,61.06c-3.92983,0 -7.12571,3.19588 -7.12571,7.12571v35.62857c0,3.92983 3.19588,7.12571 7.12571,7.12571h46.31714c3.92983,0 7.12571,-3.19588 7.12571,-7.12571v-10.39631l12.02464,9.61693c0.64488,0.51305 1.43227,0.77937 2.22679,0.77937c0.52374,0 1.05316,-0.11974 1.54483,-0.35489c1.23631,-0.59143 2.01802,-1.83983 2.01802,-3.20796v-28.50286c0,-1.36814 -0.78171,-2.61992 -2.01802,-3.21492c-1.23275,-0.58787 -2.70276,-0.42365 -3.77162,0.43144l-12.02464,9.61693v-10.39631c0,-3.92983 -3.19588,-7.12571 -7.12571,-7.12571z"></path></g></g></svg>`;
  }
  videoshare = !videoshare;
};
let recivedCallOutput = (type) => {
  let output = `
  <div id="cems__callsection">
       
       ${
         type == "video"
           ? `<div id="cems__recivedcall__content">
          <div id="cams__call__timer" style='position: absolute; color:white'><span id="minutes"></span>:<span id="seconds"></span></div>
         <div id="cems__call__sender">
          <div>
            <p>Your camera off</p>
          </div>
         </div>
         <div id="cems__call__reciver">
          <div>
            <p>Your friend's camera off</p>
          </div>
          </div>`
           : `<div id="cems__call__content">
         <h3 class="bs__calleeName">${calleeName}</h3>
         <div id="cams__call__timer"><span id="minutes"></span>:<span id="seconds"></span></div>
         <div  class="cems__callImage" >
         <p class="bs__calleIcon">${calleeName.toUpperCase().charAt(0)}</p>
       </div>
         `
       }
       
         <div class="cems__callButtons" ${type === "video" ? "style='position: absolute'" : ""} >
         ${type === "video" ? `<img class='bs__videoOff' src='https://img.icons8.com/material-outlined/96/0998f5/video-call.png'/>` : ""}
         <img class="bs__cancleCallBtn" onclick=cancelRecivedCall() src="https://img.icons8.com/windows/96/FF0000/phone-disconnected--v1.png">
         
        <img id="muteMicrophone" class="bs__muteAudio"  onclick=mutecontrol()  src="https://img.icons8.com/external-kiranshastry-lineal-kiranshastry/100/0998f5/external-microphone-interface-kiranshastry-lineal-kiranshastry.png"/>
        
         ${
           type == "video"
             ? `<img id="cems_shareScreenBtn"  onclick=screenshare() src="https://img.icons8.com/dotty/80/0998f5/screensharing.png"/>
           `
             : ""
         } </div>
         
       </div>
   </div>
  `;
  // <span id="cems_videomuteBtn">
  //               <svg class="cems__reciveBtn" onclick=videoControl() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2aa826"></path><g fill="#ffffff"><path d="M53.93429,61.06c-3.92983,0 -7.12571,3.19588 -7.12571,7.12571v35.62857c0,3.92983 3.19588,7.12571 7.12571,7.12571h46.31714c3.92983,0 7.12571,-3.19588 7.12571,-7.12571v-10.39631l12.02464,9.61693c0.64488,0.51305 1.43227,0.77937 2.22679,0.77937c0.52374,0 1.05316,-0.11974 1.54483,-0.35489c1.23631,-0.59143 2.01802,-1.83983 2.01802,-3.20796v-28.50286c0,-1.36814 -0.78171,-2.61992 -2.01802,-3.21492c-1.23275,-0.58787 -2.70276,-0.42365 -3.77162,0.43144l-12.02464,9.61693v-10.39631c0,-3.92983 -3.19588,-7.12571 -7.12571,-7.12571z"></path></g></g></svg>
  //          </span>
  getModalSection.innerHTML = output;
  callTimer();
};
let callInterval;
let callTimer = () => {
  var sec = 0;
  function pad(val) {
    return val > 9 ? val : "0" + val;
  }
  callInterval = setInterval(function () {
    document.getElementById("seconds").innerHTML = pad(++sec % 60);
    document.getElementById("minutes").innerHTML = pad(parseInt(sec / 60, 10));
  }, 1000);
};
let outgoinCallOutput = (type) => {
  return `
  <div id="cems__callsection">
       <div id="cems__call__content">
         <h3 class="bs__calleeName">${calleeName}</h3>
         <h4 id='callingType'> Outgoing ${type === "" ? "audio" : "video"} call... </h4>
         <div  class="cems__callImage" >
         <p class="bs__calleIcon">${calleeName.toUpperCase().charAt(0)}</p>
        </div>
         <div class="cems__callButtons" >
         ${type === "video" ? "<img class='bs__videoOff' src='https://img.icons8.com/material-outlined/96/0998f5/video-call.png'/>" : ""}
         <img class="bs__cancleCallBtn" onclick=cancelOutgoingCall() src="https://img.icons8.com/windows/96/FF0000/phone-disconnected--v1.png">
         <img class="bs__muteAudio"  src="https://img.icons8.com/external-kiranshastry-lineal-kiranshastry/100/0998f5/external-microphone-interface-kiranshastry-lineal-kiranshastry.png"/>
         </div>
       </div>
   </div>
  `;
};

let incomingCallOutput = (name, type) => {
  console.log(type);
  calleeName = name;
  let output = `
  <div id="cems__callsection">
       <div id="cems__call__content">
       <h3 class="bs__calleeName">${calleeName}</h3>
       <h4 id='callingType'> Incoming ${type === "" ? "audio" : "video"} call... </h4>
       <div  class="cems__callImage" >
       <p class="bs__calleIcon">${calleeName.toUpperCase().charAt(0)}</p>
      </div>
         <div class="cems__callButtons">
         ${type === "video" ? "<img class='bs__videoOff' src='https://img.icons8.com/material-outlined/96/0998f5/video-call.png'/>" : ""}
         <img class="bs__cancleCallBtn" onclick=cancelIncoingCall() src="https://img.icons8.com/windows/96/FF0000/phone-disconnected--v1.png">
            <img class="bs__reciveAudioCall" onclick=reciveIncomingCall() src="https://img.icons8.com/windows/96/4FBC87/phone-disconnected--v1.png">
             
         <img class="bs__muteAudio"  src="https://img.icons8.com/external-kiranshastry-lineal-kiranshastry/100/0998f5/external-microphone-interface-kiranshastry-lineal-kiranshastry.png"/>
           
         </div>
       </div>
   </div>
  `;
  getModalSection.innerHTML = output;
};

let storeMessage = (message, peerId) => {
  let peerDetails = friendList.find((d) => d.chat_uid == peerId);
  chatListDataStore(message, peerId, peerDetails.name, "recive");

  // // newChatListStore(message, peerId, peerDetails.name, "recive");
  createRecivedMessageOutput(message, peerId);
  scrollBottom();
  gotoChatList();
  var chatEl = document.getElementById("cems__chatbox__messages");
  chatEl.scrollTop = chatEl.scrollHeight;
};
let reciveMessageStoreAndOutput = async (message, peerId) => {
  let currentDateTime = getCurrentDateTime();
  if (message.messageType === "TEXT") {
    message = message;
    message.time = currentDateTime;
    storeMessage(message, peerId);
  } else {
    let blob = await agoraFunction.reciveFileControl(message.mediaId);
    await agoraFunction.blobToImage(blob, async (file) => {
      message = {
        text: "",
        messageType: message.messageType,
        time: currentDateTime,
        mediaId: message.mediaId,
        mediaUrl: file.src,
        mediaName: message.fileName,
      };
      storeMessage(message, peerId);
    });
  }
};

let getChatData = async (authToken, uid) => {
  try {
    let response = await axios.get(`https://tradazine.com/api/v1/all-chat-message/${uid}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return await response;
  } catch (err) {
    console.error(err);
  }
};
let getFriendListData = async (authToken, uid) => {
  if (authToken === null) {
    let friendList = [
      { chat_uid: "user1@gmail.com", name: "user1@gmail.com" },
      { chat_uid: "user2@gmail.com", name: "user2@gmail.com" },
      { chat_uid: "user3@gmail.com", name: "user3@gmail.com" },
      { chat_uid: "user4@gmail.com", name: "user4@gmail.com" },
    ];
    console.log(friendList, uid);

    friendList = friendList.filter((d) => d.chat_uid != uid);
    console.log(friendList);
    return friendList;
  }
  try {
    let response = await axios.get(`https://tradazine.com/api/v1/get-all-users`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    let friendlist = await response.data.data.filter((d) => d.chat_uid != uid);
    let isTecnicalHelp = friendList.find((f) => f.chat_uid === "tecnicalhelp");
    if (isTecnicalHelp === undefined) {
      friendlist.push({
        id: "technicalhelp",
        chat_uid: "technicalhelp",
        name: "technicalhelp",
      });
    }
    return await friendlist;
  } catch (err) {
    console.error(err);
  }
};
