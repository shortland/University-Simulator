$(document).ready(() => {
  let data = JSON.parse(localStorage.getItem("player"));
  if (data == null) {
    window.location.href = "index.html";
  }
  let health = (data["thirst"] + data["hunger"]) / 2;
  let end = gameEnding(data["cash"], data["credits"], data["followers"], health);
  let game_ending_title = "Game Complete";
  let game_ending_color = "black";
  if (JSON.parse(localStorage.getItem("zombie_death"))) {
    game_ending_title = "You Died from Zombies!"
    game_ending_color = "red";
  }
  $("#ending-content").html(`
    <center style="margin-left: 150px; margin-right: 150px;">
      <h3 style="color: ` + game_ending_color + `;">` + game_ending_title + `</h3>
      <p>` + end[0] + `</p><br>
      <p>` + end[1] + `</p><br>
      <p>` + end[2] + `</p><br>
      <p>` + end[3] + `</p><br>
      <p>` + end[4] + `</p><br>
    </center>
  `);

  $("#restart").on("click", () => {
    $.ajax({
      url: "https://universitysimulator.com/UniversitySimulator/Server/index.php?method=restart&email=" + encodeURI(data["email"]),
      type: 'get',
      dataType: 'json',
      success: function (data) {
        console.log("game restarted");
        localStorage.clear();
        localStorage.setItem("needs_login", true);
        window.location.href = "index.html";
      }
    });
  });
});

function gameEnding(gold,credit,followers,health) {
  var maxcount = 0;
  var goldEnding;
  var creditEnding;
  var followersEnding;
  var healthEnding;
  var overallEnding;
  if(gold>=1000){
      maxcount++;
      goldEnding = "You were smart in saving and investing your money while also being able to provide for your family whatever the cost. Money was never an issue in your life and your family prospered as the 1% from the wealth that you had attained due to your decisions.";
  }
  else if(gold<1000 && gold >= 250){
      goldEnding = "You were able to get by in life with the money you saved from work and some assets that you had kept. A few unfortunate money losses caused some setbacks in family plans but nothing too deterring. Your family lived a normal life in the middle class.";
  }
  else{
      goldEnding = "Money was always an issue in your life and you had trouble getting by in life. You spent money on items you didn’t need rather than saving it and didn’t have enough money for the more important things in life which resulted in many hindrances and obstacles while trying to live a happy life. Your family had to scrape by because of your money problems. ";
  }

  // full credit for 11 class
  if(credit >= 44){
      maxcount++;
      creditEnding = "You graduated as a Double Major with a 4.0 GPA and as the valedictorian of your class. You were recognized around the institution as a once in a generation genius. You received offers from all the top companies and organizations in your field with unheard of starting salaries.";
  }
  // full credit for 7 class
  else if(credit >= 28 && credit < 44){
      creditEnding = "You completed your undergraduate degree with a good GPA and you were able to get a job just a few months after graduation that had a solid starting salary with the ability to work your way up in your field, you did just fine in your career.";
  }
  else{
      creditEnding = "As the saying goes, “C’s get degrees” and that’s the creed you lived by. For many years after college you had to work in the retail and fast food industry to provide for yourself while you went job hunting. You faced a life full of rejections from companies that you had applied to and had to slowly build connections to work your way up to a stable job.";
  }

  if(followers >= 100){
      maxcount++;
      followersEnding = "You lived a very happy and social lifestyle, always buying yourself things to keep you happy and always surrounding yourself with many friends to keep yourself entertained throughout your life. Your friends believed you were a good person loved your outgoing personality.";
  }
  else if(followers < 67 && followers >= 34){
      followersEnding = "You treated yourself when you believed it was right to do so and you kept a close-knit group of friends to do campus activities with. Even though you never expanded far past your small group of friends, people believed you were a decent person and respected your personality. You were never too outgoing or too shy but just right in the middle. You were a family man.";
  }
  else{
      followersEnding = "You were extremely depressed throughout college because you did not participate in any events or make many friends. You chose to save your money and not buy yourself much or anything at all. No one could really get to know you because you were a very cold person and cut yourself off from people and society, only seeking to fulfill an objective.";
  }
  if(health>=67 && health <=100){
      maxcount++;
      healthEnding = "Your health was usually never an issue in your life, you took great care of yourself and lived a healthy life until the end of your days in your 90s.";
  }
  else if(health == 42){
      healthEnding = "You have achieved the meaning of life, although it may not be an adequate amount of health, you have reached a divine realm where you will live a healthy life and prosper as a god.";
  }
  else if(health>34 && health < 67){
      healthEnding = "Although you didn’t live the healthiest life, you tried your best to keep your health well enough to perform your daily activities. You passed away at an old age from a slow developing sickness because you didn’t make health an extreme priority.";
  }
  else{
      healthEnding = "Your health was always an issue because you never prioritized it during your college life. Your life was riddled with sickness and you spent many nights in the hospital at some points. Unfortunately, you were attacked by a deadly virus because of how vulnerable your body was and died at a young age...";
  }

  if(maxcount<=4){
      overallEnding = "I was satisfied with my University life and wouldn’t make any changes.";
  }
  else if(maxcount<4 && maxcount > 2){
      overallEnding = "I think I made some right and wrong decisions which I was ultimately okay with, but I wish I could correct the things I did wrong.";
  }
  else{
      overallEnding = "I did not enjoy my University life and I wish I could start over.";
  }
  var ending = [healthEnding,goldEnding,creditEnding,followersEnding,overallEnding];
  return ending;
}