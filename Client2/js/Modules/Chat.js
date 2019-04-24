export class Chat {
  constructor({} = {}) {
    this.initChat();
  }

  initChat() {
    $("#chat-box").on("keydown", function (e) {
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
          return;
        }
        if (e.keyCode == 13) {
          console.log($("#chat-box").val());
          alert("Not yet implemented!");
          $("#chat-box").hide();
          $("#chat-box").val("");
          $("#chat-box").blur();
          return;
        }
        $("#chat-box").val($("#chat-box").val() + String.fromCharCode(e.keyCode).toLowerCase());
      }
    });
  }
  
}