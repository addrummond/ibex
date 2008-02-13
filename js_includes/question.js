Question.obligatory = ["q", "as"];

__Question_callback__ = null;
__Questions_answers__ = null;

function Question(div, options, finishedCallback, utils) {
    this.name = "Question";
    this.options = options;

    div.className = "question";

    this.question = options.q;
    this.answers = options.as;

    this.hasCorrect = dget(options, "hasCorrect", false);
    // hasCorrect is either false, indicating that there is no correct answer,
    // true, indicating that the first answer is correct, or an integer giving
    // the index of the correct answer, OR a string giving the correct answer.
    // Now we change it to either false or an index.
    if (this.hasCorrect === true)
        this.hasCorrect = 0;
    if (typeof(this.hasCorrect) == "string") {
        var foundIt = false;
        for (var i = 0; i < this.answers.length; ++i) {
            if (this.answers[i].toLowerCase() == this.hasCorrect.toLowerCase()) {
                this.hasCorrect = i;
                foundIt = true;
                break;
            }
        }
        assert(foundIt, "Value of 'hasCorrect' option not recognized in Question");
    }
    this.showNumbers = dget(options, "showNumbers", true);
    this.presentAsScale = dget(options, "presentAsScale", false);
    this.randomOrder = dget(options, "randomOrder", ! (this.hasCorrect === false));
    this.timeout = dget(options, "timeout", null);

    if (! (this.hasCorrect === false))
        assert(typeof(this.hasCorrect) == "number" && this.hasCorrect < this.answers.length,
               "Bad index for correct answer in Question");

    if (this.randomOrder) {
        this.orderedAnswers = new Array(this.answers.length);
        for (var i = 0; i < this.answers.length; ++i)
            this.orderedAnswers[i] = this.answers[i];
        fisherYates(this.orderedAnswers);
    }
    else {
        this.orderedAnswers = this.answers;
    }

    this.setFlag = function(correct) {
        if (! correct) {
            utils.setValueForNextElement("failed", true);
        }
    }

    this.qp = document.createElement("p");
    this.qp.appendChild(document.createTextNode(this.question));
    this.xl;
    if (! this.presentAsScale)
        this.xl = document.createElement(this.showNumbers ? "ol" : "ul");
    else
        this.xl = document.createElement("p");
    __Question_answers__ = new Array(this.answers.length);
    for (var i = 0; i < this.orderedAnswers.length; ++i) {
        var li;
        if (! this.presentAsScale)
            li = document.createElement("li")
        else
            li = document.createElement("span");
        var ans = typeof(this.orderedAnswers[i]) == "string" ? this.orderedAnswers[i] : this.orderedAnswers[i][1];
        var a = document.createElement("a");
        var t = this; // 'this' doesn't behave as a lexically scoped variable so can't be
                      // captured in the closure defined below.
        a.href = "javascript:__Question_callback__(" + i + ");";
        __Question_answers__[i] = ans;
        __Question_callback__ = function (i) {
            var ans = __Question_answers__[i];
            var correct = "NULL";
            if (! (t.hasCorrect === false)) {
                var correct_ans = typeof(t.answers[t.hasCorrect]) == "string" ? t.answers[t.hasCorrect] : t.answers[t.hasCorrect][1];
                correct = (ans == correct_ans ? 1 : 0);
                t.setFlag(correct);
            }
            finishedCallback([[url_encode_removing_commas(t.question),
                               url_encode_removing_commas(ans),
                               correct]]);
        };
        a.appendChild(document.createTextNode(ans));
        li.appendChild(a);
        this.xl.appendChild(li);
        if (this.presentAsScale && i < this.orderedAnswers.length - 1)
            this.xl.appendChild(document.createTextNode(" | "));
    }
    div.appendChild(this.qp);
    div.appendChild(this.xl);

    if (this.timeout) {
        var t = this;
        utils.setTimeout(function () {
            t.setFlag(false);
            finishedCallback([[url_encode_removing_commas(t.question), "NULL", "NULL"]]);
        }, this.timeout);
    }

    // TODO: A bit of code duplication in this function.
    this.handleKey = function(code, time) {
        if ((! this.presentAsScale) && this.showNumbers &&
            ((code >= 48 && code <= 57) || (code >= 96 && code <= 105))) {
            // Convert numeric keypad codes to ordinary keypad codes.
            var n = code >= 96 ? code - 96 : code - 48;
            if (n > 0 && n <= this.orderedAnswers.length) {
                var ans = typeof(this.orderedAnswers[n-1]) == "string" ? this.orderedAnswers[n-1] : this.orderedAnswers[n-1][1];
                var correct = "NULL";
                if (! (this.hasCorrect === false)) {
                    var correct_ans = typeof(this.answers[this.hasCorrect]) == "string" ? this.answers[this.hasCorrect] : this.answers[this.hasCorrect][1];
                    correct = (correct_ans == ans ? 1 : 0);
                    this.setFlag(correct);
                }
                finishedCallback([[url_encode_removing_commas(this.question),
                                   url_encode_removing_commas(ans),
                                   correct]]);
            }
        }
        // Letters (and numbers in the case of scales).
        else if ((code >= 65 && code <= 90) || (this.presentAsScale && ((code >= 48 && code <= 57) || (code >= 96 && code <= 105)))) {
            // Convert numeric keypad codes to ordinary keypad codes.
            code = (code >= 96 && code <= 105) ? code - 48 : code;
            for (var i = 0; i < this.answers.length; ++i) {
                var ans = null;
                if (typeof(this.answers[i]) == "string") {
                    if (code == this.answers[i].toUpperCase().charCodeAt(0))
                        ans = this.answers[i];
                }
                else {
                    if (code == this.answers[i][0].toUpperCase().charCodeAt(0))
                        ans = this.answers[i][1];
                }

                if (ans) {
                    var correct = "NULL";
                    if (! (this.hasCorrect === false)) {
                        var correct_ans = typeof(this.answers[this.hasCorrect]) == "string" ? this.answers[this.hasCorrect] : this.answers[this.hasCorrect][1];
                        correct = (correct_ans == ans ? 1 : 0);
                        this.setFlag(correct);
                    }
                    finishedCallback([[url_encode_removing_commas(this.question),
                                       url_encode_removing_commas(ans),
                                       correct]]);
                }
            }
        }
    }
}
