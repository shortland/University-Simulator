function quiz(questions){
    this.score = 0;
    this.questions= questions;
    this.index = 0;
}

quiz.prototype.indexAddOne=function(){
    this.index ++;
}

quiz.prototype.indexToZero=function(){
    this.index = 0;
}

quiz.prototype.getIndex= function(){
    return this.questions[this.index];
}

quiz.prototype.isDone= function(){
    return this.questions.length <= this.index;
}

quiz.prototype.choose = function(ans){
    console.log(this.index);
    if(this.isDone()){
        console.log("do nothing");
    }
    else if (this.getIndex().isAnsCorrect(ans)){
        this.score++;
        this.index +=1;
        $("#main").css("background","#6bbd3c");
    }
    else{
        this.index +=1;
        $("#main").css("background","#b61111");
    }
    
}