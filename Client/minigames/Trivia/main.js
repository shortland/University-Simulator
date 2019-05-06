var questions = [
    new question("Which quad is ITS in?",["Mendi","Rosevelt","Roth","H Quad"],"Mendi"),
    new question("What's a Sea Wolf?",["idk","a kind of wolf","I'm a sea wolf","dog"],"I'm a sea wolf"),
    new question("Where is Island Soul located on campus?",["East","West","Roth","Jasmine"],"East"),
    new question("Where is the ITS center located?",["Gray","O'Neil","Almond","Irving"],"Gray"),
    new question("In SBU, what does TSA stand for?",["Transportation Security Association","idk","Taiwanese Student Association","Transportation Security Administration"],"Taiwanese Student Association"),
    new question("What's the name of this game? (not minigame)",["University Simulator","Quiz Game","Maze","Typing Game"],"University Simulator"),
    new question("Where can Halal food be purchased on campus?", ["SAC", "East Side Dining", "West Side Dining", "Jasmine"], "East Side Dining"),
    new question("Which undergraduate major has the most enrolled students in SBU?", ["Computer Science", "Biology", "Psychology", "Physics"], "Biology"),
    new question("Who is the current standing president of SBU?", ["Shirley Strum Kenny", "John H. Marburger III", "John S. Toll", "Samuel L. Stanley"], "Samuel L. Stanley"),
    new question("About how many students attend SBU?", ["26,000", "28,000", "40,000", "42,000"], "26,000")
    // new question("Who is my professor?",["McKenna","Tashbook","Stark","J Wang"],"McKenna"),
    // new question("14*14 = ?",["126","156","146","196"],"196"),
    // new question("14 in hex is?",["a","c","d","e"],"e"),
    // new question("14 in binary is?",["1001","1111","1101","1110"],"1110")
];

var quiz = new quiz(questions);
var time = 5;

function ask(){
    
    if (quiz.isDone()){
        //console.log("this is done",quiz.index);
        showEnd();
    }
    else{
        //console.log("this is in else",quiz.index);
        //show Q
        var q = $("#question").text(quiz.getIndex().text);
        //show options
        var o1 = $("#a").text(quiz.getIndex().options[0]);
        choose("a",quiz.getIndex().options[0]);
        var o2 = $("#b").text(quiz.getIndex().options[1]);
        choose("b",quiz.getIndex().options[1]);
        var o3 = $("#c").text(quiz.getIndex().options[2]);
        choose("c",quiz.getIndex().options[2]);
        var o4 = $("#d").text(quiz.getIndex().options[3]);
        choose("d",quiz.getIndex().options[3]);
        showProgress();
    }
};

function nextQuestion(){
    quiz.indexAddOne();
    ask();
}


function showProgress(){
    var index = quiz.index;
    var length = quiz.questions.length;
    $('#progress').text((index+1)+" out of "+ length + " questions");
}

function choose(id,choice){
    var button = $('#'+id);
    button.off().on("click",function(){
        quiz.choose(choice);
        time=5;
        ask();
    });
    
};

function showEnd(){
    console.log("DID SHOW END!");
    var doneHTML = "<p class = 'done'>Result</p>";
    doneHTML += "<p class = 'done'id = 'score'> Score:"+ quiz.score +"/"+questions.length+ "</p>";
    $("#main").hide();
    var max = questions.length;
    if (max*0.8 <= quiz.score) {
        $("#comment").text("Great Job!");
        localStorage.setItem("coin_win", 200);
        setTimeout(() => {window.parent.$('body').trigger('gameComplete');}, 1000);
    } else if (max*0.6 <= quiz.score) {
        $("#comment").text("Nice job, you can do better though!");
        localStorage.setItem("coin_win", 100);
        setTimeout(() => {window.parent.$('body').trigger('gameComplete');}, 1000);
    } else {
        $("#comment").text("You should study a bit more!");
        localStorage.setItem("coin_win", 0);
        setTimeout(() => {window.parent.$('body').trigger('gameComplete');}, 1000);
    }
    $("#showScore").prepend(doneHTML);
    $("#showScore").show();
};


$("#showScore").hide();
$('#game').hide();
$('#start').off().on("click",function(){
    $('#starting').hide();
    $('#game').show();
    ask();
    startTime();
});


var switchFlag = 0;
var counter = 0;
function startTime() {
    // add a zero in front of numbers<10
    if(counter ==1 ){
        $("#main").css("background","#aeaeae");
        //console.log(time);
        $('#timer').text("timer: "+time);
        if(switchFlag == 1){
            nextQuestion();
            switchFlag = 0;
        }
        if(time==1){
            time=5;
            if(!quiz.isDone()){
                switchFlag = 1;
            }
        }
        else{
            time-=1;
        }
        counter = 0;
    }
    else{
        counter = 1;
    }
    
    var t = setTimeout(function(){ startTime() }, 500);
}

$(document).ready(() => {
    $(document).on("keypress", event => {
        if (event.keyCode == 112) {
            window.location.href = "../../phone.html";
        }
    });
});
  