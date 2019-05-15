import { PlayerDataHandler } from './ModuleLoader.js';

export class JNotify {
  constructor({} = {}) {
    this.prevInteractantName;
    this.PDHandler;
  }

  toast({timeout = 3000, html, color = "green", position = "bottom", important = false} = {}) {
    if (important) {
      $("#toastNotification").finish();
      localStorage.setItem("importantToast", true);
      $("#toastNotification").css({"z-index": 8});
    }
    if (position == "center") {
      $("#toastNotification").css({"top": "calc(100% / 2 - 100px)"});
      $("#toastNotification").show();
      $("#toastNotification").html(
        "<center style='color:" + color + "'>" + html + "</center>"
      ).fadeOut(timeout, () => {
        $("#toastNotification").css({"top": ""});
        localStorage.setItem("importantToast", false);
      });
    } else if (position == "bottom") {
      $("#toastNotification").css({"bottom": "100px"});
      $("#toastNotification").show();
      $("#toastNotification").html(
        "<center style='color:" + color + "'>" + html + "</center>"
      ).fadeOut(timeout, () => {
        $("#toastNotification").css({"bottom": ""});
        localStorage.setItem("importantToast", false);
      });
    } else {
      $("#toastNotification").css({"bottom": "100px"});
      $("#toastNotification").show();
      $("#toastNotification").html(
        "<center style='color:" + color + "'>" + html + "</center>"
      ).fadeOut(timeout, () => {
        $("#toastNotification").css({"bottom": ""});
        localStorage.setItem("importantToast", false);
      });
    }
  }

  toastPlayerInteraction(interactant, x) {
    // console.log(interactant, x);
    if (x.type != "Sprite") {
      return;
    }
    
    if (this.prevInteractantName != interactant.name && JSON.parse(localStorage.getItem("importantToast")) != true) { // it's a different person, so finish the old animation quick
      $("#toastNotification").finish();
      $("#toastNotification").show();

      const JN = new JNotify;
      JN.toast({
        html: interactant.story.next.line, 
        timeout: interactant.story.next.timeout, 
        color: "black"
      });
      
      this.prevInteractantName = interactant.name;
    }
  }

  storyPlayerInteraction(interactant) {
    if ($("#prompt").is(":visible")) {
      return;
    }
    let PDH = this.PDHandler = new PlayerDataHandler();
    let yes_no = "<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
    let yes = "<br><br>[Y] Yes";
    let no = "<br><br>[N] No";
    if (interactant.story.next != null || interactant.price != null) {
      recursiveStory(interactant, PDH, interactant.story.next);
    }

    function recursiveStory(interactant, PDH, story) {
      if ($("#prompt").is(":visible")) {
        return;
      }
      setTimeout(() => {
        if ($("#prompt").is(":visible")) {
          return;
        }
      }, 2000);

      console.log("called recursiveStory()");
      $("#prompt").show();
      let choice;
      if (story.Y != null && story.N != null) {
        choice = yes_no;
      } else if (story.Y == null && story.N != null) {
        choice = no;
      } else if (story.Y != null && story.N == null) {
        choice = yes;
      } else {
        choice = "<br><br>[Y] Exit";
      }
      $("#prompt").html(
        "<center>" + story.line + choice + "</center>"
      );

      $(document).on("keypress", event => {
        if ($("#prompt").is(":visible")) {
          if (choice == "<br><br>[Y] Exit") {
            $("#prompt").hide();
            $(document).off("keypress");
            return;
          }

          if (event.keyCode == 121) {
            if (interactant["price"] > 0) {
              if ((-1 * parseInt(interactant["price"])) + PDH.getStats()["cash"] < 0) {
                $("#prompt").hide();
                $(document).off("keypress");
                $("#toastNotification").finish();
                $("#toastNotification").show();
                $("#toastNotification").html(
                  "<center style='color:red'>Not enough cash!</center>"
                ).fadeOut(3000);
                return;
              }
              PDH.addStats({stats: {cash: (-1 * parseInt(interactant["price"]))}});
              PDH.addInventory({itemList: [interactant.name]});
              $("#prompt").hide();
              $(document).off("keypress");
              recursiveStory(interactant, PDH, story.Y.next);
            } else {
              $("#prompt").hide();
              $(document).off("keypress");
              recursiveStory(interactant, PDH, story.Y.next);
            }
          } else if (event.keyCode == 110) {
            $("#prompt").hide();
            $(document).off("keypress");
            recursiveStory(interactant, PDH, story.N.next);
          }
        }
      });
    }
  }

  prompt({show = true, html}) {
    if (!$("#prompt").is(":visible")) {
      if (show) {
        $("#prompt").show();
      } else {
        $("#prompt").hide();
      }
      $("#prompt").html(
        "<center>" + html + "</center>"
      );
    }
  }

  promptHide() {
    $("#prompt").hide();
  }
}