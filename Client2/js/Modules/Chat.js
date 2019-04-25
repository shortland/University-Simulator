export class Chat {
  constructor({} = {}) {
    this.baseURL = window.location.protocol + "//" + window.location.host + "/StonyBrookSimu/CServer/";
    this.refreshRate = 1000; // ms
    this.updateTimestamp = Math.floor(Date.now() / 1000);
    this.initChat();
    this.initPolling();
  }

  postMessage({message: message} = {}) {
    $.getJSON(this.baseURL + "chat.php?method=save_chat&message=" + message + "&username=" + JSON.parse(localStorage.getItem("player"))["name"] + "&epoch=" + (parseInt(Math.floor(Date.now() / 1000)) + 1), data => {
      if (data["saved"] > 0) {
        console.log("Success sending message!");
      } else {
        alert("Error sending message");
      }
    });
  }

  initPolling(lastMessage = null) {
    $.getJSON(this.baseURL + "chat.php?method=get_chat&epoch=" + this.updateTimestamp, data => {
      if (data["messages"].length > 0 && lastMessage != data["messages"][0]) {
        data["messages"].forEach(message => {
          $("#pre-chat").append("<div class='child-comment'>"+message+"</div>");
          $(".child-comment").last().fadeOut(5000);
          $("#pre-chat").scrollTop($("#pre-chat")[0].scrollHeight);
        });
      }
      this.updateTimestamp = Math.floor(Date.now() / 1000);
      setTimeout(() => {this.initPolling(data["messages"][0])}, this.refreshRate);
    });
  }

  initChat() {
    $("#chat-box").on("keydown", e => {
      if (
        e.keyCode == 72 || // h
        e.keyCode == 84 || // t
        e.keyCode == 32 || // SpaceBar
        e.keyCode == 80 || // p 
        e.keyCode == 89 || // y
        e.keyCode == 78 || // n
        e.keyCode == 83 || // s
        e.keyCode == 73 || // i
        e.keyCode == 77 ||
        e.keyCode == 27 || // esc
        e.keyCode == 9 || // tab
        e.keyCode == 13 // enter
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (e.keyCode == 27) {
          $("#chat-box").hide();
          $("#chat-box").val("");
          $("#chat-box").blur();
          $("#pre-chat").removeClass("visible-box");
          $(".child-comment").hide();
          return;
        }
        if (e.keyCode == 13) {
          //console.log($("#chat-box").val());
          //alert("Not yet implemented!");
          this.postMessage({"message": $("#chat-box").val()});
          $("#chat-box").hide();
          $("#chat-box").val("");
          $("#chat-box").blur();
          $("#pre-chat").removeClass("visible-box");
          $(".child-comment").hide();
          return;
        }
        $("#chat-box").val($("#chat-box").val() + String.fromCharCode(e.keyCode).toLowerCase());
      }
    });
  }
  
}