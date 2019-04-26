export class JNotify {
  constructor({} = {}) {
    this.prevInteractantName;
  }

  toastPlayerInteraction(interactant) {
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
    let yes_no = "<br><br>[Y] Yes &nbsp;&nbsp;&nbsp;&nbsp; [N] No";
    let yes = "<br><br>[Y] Yes";
    let no = "<br><br>[N] No";
    recursiveStory(interactant.story.next);

    function recursiveStory(story) {
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

      $(document).keypress(event => {
        if (choice == "<br><br>[Y] Exit") {
          $("#prompt").hide();
          $(document).unbind("keypress");
          return;
        }
        if (event.keyCode == 121) {
          $("#prompt").hide();
          recursiveStory(story.Y.next);
        } else if (event.keyCode == 110) {
          $("#prompt").hide();
          recursiveStory(story.N.next);
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