import { PlayerDataHandler } from './ModuleLoader.js';

export class JNotify {
  constructor({} = {}) {
    this.prevInteractantName;
    this.PDHandler;
  }

  toastPlayerInteraction(interactant, x) {
    // console.log(interactant, x);
    if (x.type != "Sprite") {
      return;
    }
    $("#toastNotification").show();
    if (this.prevInteractantName != interactant.name) { // it's a different person, so finish the old animation quick
      $("#toastNotification").finish();
    }
    $("#toastNotification").html(
      "<center style='color:black'>" + interactant.story.next.line + "</center>"
    ).fadeOut(interactant.story.next.timeout);
    this.prevInteractantName = interactant.name;
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

  toast({timeout = 3000, html, color = "green"} = {}) {
    $("#toastNotification").show();
    $("#toastNotification").html(
      "<center style='color:" + color + "'>" + html + "</center>"
    ).fadeOut(timeout);
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