Question.obligatory = ["q", "as"];

function Question(div, options, finishedCallback) {
    this.name = "Question";

    this.finishedCallback = finishedCallback;

    div.className = "question";

    this.question = options.get("q");
    this.answers = options.get("as");
    this.hasCorrect = options.dget("hasCorrect", false);
    this.showNumbers = options.dget("showNumbers", true);
    this.randomOrder = options.dget("randomOrder", true);

    if (this.randomOrder) {
        this.orderedAnswers = new Array(this.answers.length);
        for (var i = 0; i < this.answers.length; ++i)
            this.orderedAnswers[i] = this.answers[i];
        fisherYates(this.orderedAnswers);
    }
    else {
        this.orderedAnswers = this.answers;
    }

    this.qp = document.createElement("p");
    this.qp.appendChild(document.createTextNode(this.question));
    this.xl = document.createElement(this.showNumbers ? "ol" : "ul");
    for (var i = 0; i < this.orderedAnswers.length; ++i) {
        var li = document.createElement("li")
        if (typeof(this.orderedAnswers[i]) == "string") {
            li.appendChild(document.createTextNode(this.orderedAnswers[i]));
        }
        else if (this.orderedAnswers[i].length == 2) {
            li.appendChild(document.createTextNode(this.orderedAnswers[i][1]));
        }
        else {
            assert(false, "Badly formatted 'as' array");
        }
        this.xl.appendChild(li);
    }
    div.appendChild(this.qp);
    div.appendChild(this.xl);

    // TODO: A bit of code duplication in this function.
    this.handleKey = function(code, time) {
        alert(code);
        if (this.showNumbers &&
            ((code >= 48 && code <= 57) || (code >= 96 && code <= 105))) {
            // Convert numeric keypad codes to ordinary keypad codes.
            var n = code >= 96 ? code - 96 : code - 48;
            if (n > 0 && n <= this.orderedAnswers.length) {
                var ans = typeof(this.orderedAnswers[n-1]) == "string" ? this.orderedAnswers[n-1] : this.orderedAnswers[n-1][1];
                var correct = "NULL";
                if (this.hasCorrect) {
                    var correct_ans = typeof(this.answers[0]) == "string" ? this.answers[0] : this.answers[0][1];
                    correct = correct_ans == ans ? 1 : 0;
                }
                this.finishedCallback([[htmlencode(ans), correct]]);
            }
        }
        // Letters.
        else if (code >= 65 && code <= 90) {
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
                    if (this.hasCorrect) {
                        var correct_ans = typeof(this.answers[0]) == "string" ? this.answers[0] : this.answers[0][1];
                        correct = correct_ans == ans ? 1 : 0;
                    }
                    this.finishedCallback([[htmlencode(ans), correct]]);
                }
            }
        }
    }
}
