class InteractiveChatbox {
  constructor(chatToggleButton, chatbox, icons, chatSection, chatList) {
    this.args = {
      chatToggleButton: chatToggleButton,
      chatbox: chatbox,
      chatSection,
      chatList,
    };
    this.icons = icons;
    this.showChatbox = false;
    this.isBack = true;
    this.inChatList = true;
  }

  display() {
    const { chatToggleButton, chatbox } = this.args;
    chatToggleButton.addEventListener("click", () => this.toggleState(chatbox));
    this.chatListOrUserEffect();
    this.unreadMessageCountDisplay();
  }

  chatListOrUserEffect() {
    let chatDiv = document.querySelector(".chatlist__footer__chatIcon");
    let userDiv = document.querySelector(".chatlist__footer__userIcon");
    let unreadMessageCountP = document.getElementById("unreadMessageCountP");
    let unreadMessageCountDiv = document.getElementById("unreadMessageCount");
    if (this.inChatList) {
      chatDiv.src = "https://img.icons8.com/ios-filled/100/000000/communication.png";
      userDiv.src = "https://img.icons8.com/ios/50/000000/user.png";
      // unreadMessageCountDiv.style.background = "white";
      // unreadMessageCountP.style.color = "red";
    } else {
      chatDiv.src = "https://img.icons8.com/ios/100/000000/communication.png";
      userDiv.src = "https://img.icons8.com/ios-filled/100/000000/user.png";
      // unreadMessageCountP.style.color = "white";
      // unreadMessageCountDiv.style.background = "black";
    }
  }
  unreadMessageCountDisplay() {
    let unreadMessageCountDiv = document.getElementById("unreadMessageCount");
    console.log(unreadMessageCountDiv);
    unreadMessageId.length === 0
      ? (unreadMessageCountDiv.style.display = "none")
      : ((unreadMessageCountDiv.style.display = "flex"),
        (unreadMessageCountDiv.innerHTML = `<p id="unreadMessageCountP">${unreadMessageId.length}</p>`));
  }
  gotoUsers() {
    this.inChatList = false;
    this.chatListOrUserEffect();
  }
  toggleState(chatbox) {
    this.showChatbox = !this.showChatbox;
    this.showOrHideChatBox(chatbox, this.args.chatToggleButton);
  }
  chatInitWithUid(chatbox) {
    if (!this.showChatbox) {
      chatbox.classList.remove("cems__chatbox--active");
      this.toggleIcon(false, this.args.chatToggleButton);
    }
    this.showChatbox = true;
    this.showOrHideChatBox(chatbox, this.args.chatToggleButton);
  }
  chatboxoff() {
    this.showChatbox = false;
    this.toggleIcon(false, this.args.chatToggleButton);
    this.args.chatbox.classList.remove("cems__chatbox--active");
  }
  showOrHideChatBox(chatbox, chatToggleButton) {
    if (this.showChatbox) {
      chatbox.classList.add("cems__chatbox--active");
      this.toggleIcon(true, chatToggleButton);
    } else if (!this.showChatbox) {
      chatbox.classList.remove("cems__chatbox--active");
      this.toggleIcon(false, chatToggleButton);
    }
  }

  toggleIcon(showChatbox, chatToggleButton) {
    const { isClicked, isNotClicked } = this.icons;
    if (showChatbox) {
      chatToggleButton.children[0].innerHTML = isClicked;
    } else if (!showChatbox) {
      chatToggleButton.children[0].innerHTML = isNotClicked;
    }
  }
  gotoChat() {
    const { chatSection, chatList } = this.args;
    this.isBack = !this.isBack;
    if (!this.isBack) {
      chatSection.classList.remove("cems__hide__section");
      chatList.classList.add("cems__hide__section");
      var chatEl = document.getElementById("cems__chatbox__messages");
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  }
  backTochatList() {
    this.inChatList = true;
    this.chatListOrUserEffect();
    this.unreadMessageCountDisplay();
    const { chatSection, chatList } = this.args;
    this.isBack = !this.isBack;
    if (this.isBack) {
      chatList.classList.remove("cems__hide__section");
      chatSection.classList.add("cems__hide__section");
    }
  }
}
const chatToggleButton = document.querySelector(".cems__chatbox__button");
const chatContent = document.querySelector(".cems__chatbox__support");
const chatList = document.getElementById("cems__chatbox__chatlists");
const chatSection = document.getElementById("cems__chatbox__chatting");

const icons = {
  isClicked: '<img class="arrowIcon" src="https://img.icons8.com/ios-glyphs/90/ffffff/expand-arrow--v1.png"/>',
  isNotClicked:
    '<img class="chatIcon" src="https://img.icons8.com/external-kiranshastry-lineal-kiranshastry/64/ffffff/external-chat-multimedia-kiranshastry-lineal-kiranshastry.png"/>',
};
const chatbox = new InteractiveChatbox(chatToggleButton, chatContent, icons, chatSection, chatList);
chatbox.display();
chatbox.toggleIcon(false, chatToggleButton);

let getAuthToken = async (email, pass) => {
  try {
    const response = await axios.post(`https://tradazine.com/api/v1/login?username=${email}&password=${pass}`);
    let res = {
      token: response.data.access_token,
      uid: response.data.chat_uid,
      name: response.data.name,
    };
    allDetails.access_token = response.data.access_token;
    return await res;
  } catch (error) {
    return (res = {
      token: null,
      uid: email,
      name: email,
    });
    console.error(error.message);
  }
};
let bsChatInit = async (email, pass, appId, tokenUrl, appCertificate, rington, callerTune) => {
  backToChatList();
  let authData = await getAuthToken(email, pass);
  await agoraFunction.init(authData.uid, authData.name, appId, authData.token, rington, callerTune, tokenUrl, appCertificate);
};
let chatInitWithUid = (id) => {
  const chatContent = document.querySelector(".cems__chatbox__support");
  chatbox.chatInitWithUid(chatContent);
  inMessages = true;
  showMesseges(id.toString());
};
let logoutFromAgora = () => {
  chatbox.chatboxoff();
  agoraFunction.logout();
};
