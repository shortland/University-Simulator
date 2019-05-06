function question(text,options,answer) {
    this.text = text;
    this.options = options;
    this.answer = answer;
}

question.prototype.isAnsCorrect = function(option){
    return option === this.answer;
}