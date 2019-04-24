/**
 * Interactions all with the DOM.
 * No interactions with Phaser directly.
 */
export class JNotify {
  constructor({} = {}) {

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
        $("#prompt").false();
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