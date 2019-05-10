$(document).ready(() => {
  if (!feature.localStorage) {
    $("#loginForm").css({
      "color": "#FFFFFF",
      "background-color": "rgba(0, 0, 0, 0.6)",
      "padding": "10px",
      "width": "300px",
      "margin-top": "40px"
    });

    $("#loginForm").html(`
      <h3>Sorry!</h3>
      <p>Private-Browsing-Mode disables a browser-feature called "localStorage", which is necessary for this site.</p>
      <p>Disable private browsing to login or create your account.</p>
      <p>Sorry for any inconvenience.</p>
    `);
  }

  $("#showRegister").on("click", () => {
    $("#loginForm").hide();
    $("#registerForm").show();
  });

  $("#showLogin").on("click", () => {
    $("#registerForm").hide();
    $("#loginForm").show();
  });

  // Clear existing data
  if (localStorage.getItem("player") == null) {
    localStorage.clear();
  } else {
    // TODO: refresh the localstorage data via server data... cookies...
    window.location.href = "player.html";
  }

  // Login
  $("#login").on("click", () => {
    postData(`https://universitysimulator.com/UniversitySimulator/Server/login.php`, {
      password: $("#password").val(),
      email: $("#username").val(),
    })
    .then(data => {
      if (data.status == "ok") {
        if (data.data.username == "") {
          let username = prompt("What would you like to be called?");
          while (username == "" || username == null) {
            username = prompt("What would you your player name to be?");
          }
          data.data.username = username;
          let player = data.data;
          postData("https://universitysimulator.com/UniversitySimulator/Server/index.php?method=save_user&email=" + player.email, player)
          .then(data => {
            console.log(data);
            localStorage.setItem("player", JSON.stringify(player));
            setTimeout(() => {
              window.location.href = "https://universitysimulator.com/UniversitySimulator/Client/player.html";
            }, 100);
          })
          .catch(error => {
            alert("An unknown error occured");
          });
        } else {
          localStorage.setItem("player", JSON.stringify(data.data));
          setTimeout(() => {
            window.location.href = "https://universitysimulator.com/UniversitySimulator/Client/player.html";
          }, 100);
        }
      } else if (data.status == "unverified") {
        $("#unverified").show();
      } else {
        $("#incorrectPassword").show();
      }
      console.log(data);
    })
    .catch(error => {
      console.log("Login error:", error);
      alert("An unknown error occured");
    });
  });

  $("#register").on("click", () => {
    postData(`https://universitysimulator.com/UniversitySimulator/Server/register.php`, {
      password: $("#Rpassword").val(),
      email: $("#Remail").val(),
    })
    .then(data => {
      if (data.status == "ok") {
        $("#registerForm").html("<p>Successfully registered account.</p><p>Please check your email and verify your account (may need to check spam folder)</p>");
      } else {
        $("#emailUsed").show();
      }
    })
    .catch(error => {
      console.log("Register error:", error);
      alert("An unknown error occured");
    });
  });

  function postData(url = ``, data = {}) {
    return fetch(url, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    }).then(response => response.json());
  }
  
});