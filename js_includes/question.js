/* This software is licensed under a BSD license; see the LICENSE file for details. */

Question.name = "Question";
Question.obligatory = ["as"];

__Question_callback__ = null;
__Questions_answers__ = null;

function Question(div, options, finishedCallback, utils) {
    var questionField = "Question (NULL if none).";
    var answerField = "Answer";
    var correctField = "Whether or not answer was correct (NULL if N/A)";
    var timeField = "Time taken to answer.";

    this.div = div;
    this.options = options;

    div.className = "question";

    this.question = dget(options, "q");
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
    this.instructions = dget(options, "instructions");
    this.leftComment = dget(options, "leftComment");
    this.rightComment = dget(options, "rightComment");

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

    if (this.question) {
        this.qp = document.createElement("p");
        this.qp.className = "question-text";
        this.qp.appendChild(document.createTextNode(this.question));
    }
    this.xl = document.createElement(((! this.presentAsScale) && this.showNumbers) ? "ol" : "ul");
    this.xl.style.marginLeft = 0;
    this.xl.style.paddingLeft = 0;
    __Question_answers__ = new Array(this.answers.length);

    if (this.presentAsScale && this.leftComment) {
        var lcd = document.createElement("li");
        lcd.className = "scale-comment-box";
        lcd.appendChild(document.createTextNode(this.leftComment));
        this.xl.appendChild(lcd);
    }
    for (var i = 0; i < this.orderedAnswers.length; ++i) {
        var li;
        li = document.createElement("li");
        if (this.presentAsScale) {
            li.className = "scale-box";
            // IE doesn't support :hover for anything other than links, so we
            // have to use JS.
            (function (li) {
                li.onmouseover = function () {
                    li.style.borderColor = "black";
                    // With IE < 6, we have to use "hand" instead of "pointer".
                    var isOldIE = false;
                    /*@cc_on @if (@_jscript_version <= 5.5) isOldIE = true; @end @*/
                    li.style.cursor = (isOldIE ? "hand" : "pointer");
                };
                li.onmouseout = function () { li.style.borderColor = "#9ea4b1"; li.style.cursor = "default"; };
            })(li);
         }
        else {
            li.className = "normal-answer";
        }
        //li.onclick = new Function("__Question_callback__(" + i + ");");
        (function(i) {
            li.onclick = function () { __Question_callback__(i); };
        })(i);
        var ans = typeof(this.orderedAnswers[i]) == "string" ? this.orderedAnswers[i] : this.orderedAnswers[i][1];
        var t = this; // 'this' doesn't behave as a lexically scoped variable so can't be
                      // captured in the closure defined below.
        var a = document.createElement("span");
        a.className = "fake-link";
        //a.href = "javascript:__Question_callback__(" + i + ");";
        __Question_answers__[i] = ans;
        __Question_callback__ = function (i) {
            var answerTime = new Date().getTime();
            var ans = __Question_answers__[i];
            var correct = "NULL";
            if (! (t.hasCorrect === false)) {
                var correct_ans = typeof(t.answers[t.hasCorrect]) == "string" ? t.answers[t.hasCorrect] : t.answers[t.hasCorrect][1];
                correct = (ans == correct_ans ? 1 : 0);
                t.setFlag(correct);
            }
            finishedCallback([[[questionField, t.question ? url_encode_removing_commas(t.question) : "NULL"],
                               [answerField, url_encode_removing_commas(ans)],
                               [correctField, correct],
                               [timeField, answerTime - t.creationTime]]]);
        };
        a.appendChild(document.createTextNode(ans));
        li.appendChild(a);

        this.xl.appendChild(li);
    }
    if (this.presentAsScale && this.rightComment) {
        var rcd = document.createElement("li");
        rcd.className = "scale-comment-box";
        rcd.appendChild(document.createTextNode(this.rightComment));
        this.xl.appendChild(rcd);
    }

    if (! (this.qp === undefined))
        div.appendChild(this.qp);

    // Again, using tables to center because IE sucks.
    var table = document.createElement("table");
    if (conf_centerItems)
        table.align = "center";
    var tbody = document.createElement("tbody");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    if (conf_centerItems)
        td.align = "center";
    table.appendChild(tbody);
    tbody.appendChild(tr);
    tr.appendChild(td);
    td.appendChild(this.xl);
    div.appendChild(table);

    if (this.instructions) {
        var p = document.createElement("p");
        p.className = "instructions-text"
        if (conf_centerItems)
            p.style.textAlign = "center";
        p.appendChild(document.createTextNode(this.instructions));
        div.appendChild(p);
    }

    if (this.timeout) {
        var t = this;
        utils.setTimeout(function () {
            var answerTime = new Date().getTime();
            t.setFlag(false);
            finishedCallback([[[questionField, t.question ? url_encode_removing_commas(t.question) : "NULL"],
                               [answerField, "NULL"], [correctField, "NULL"],
                               [timeField, answerTime - t.creationTime]]]);
        }, this.timeout);
    }

    // TODO: A bit of code duplication in this function.
    var t = this;
    this.handleKey = function(code, time) {
        var answerTime = new Date().getTime();
        if ((! t.presentAsScale) && t.showNumbers &&
            ((code >= 48 && code <= 57) || (code >= 96 && code <= 105))) {
            // Convert numeric keypad codes to ordinary keypad codes.
            var n = code >= 96 ? code - 96 : code - 48;
            if (n > 0 && n <= t.orderedAnswers.length) {
                var ans = typeof(t.orderedAnswers[n-1]) == "string" ? t.orderedAnswers[n-1] : t.orderedAnswers[n-1][1];
                var correct = "NULL";
                if (! (t.hasCorrect === false)) {
                    var correct_ans = typeof(t.answers[t.hasCorrect]) == "string" ? t.answers[t.hasCorrect] : t.answers[t.hasCorrect][1];
                    correct = (correct_ans == ans ? 1 : 0);
                    t.setFlag(correct);
                }
                finishedCallback([[[questionField, t.question ? url_encode_removing_commas(t.question) : "NULL"],
                                   [answerField, url_encode_removing_commas(ans)],
                                   [correctField, correct],
                                   [timeField, answerTime = t.creationTime]]]);

                return false;
            }
            else {
                return true;
            }
        }
        // Letters (and numbers in the case of scales).
        else if ((code >= 65 && code <= 90) || (t.presentAsScale && ((code >= 48 && code <= 57) || (code >= 96 && code <= 105)))) {
            // Convert numeric keypad codes to ordinary keypad codes.
            code = (code >= 96 && code <= 105) ? code - 48 : code;
            for (var i = 0; i < t.answers.length; ++i) {
                var ans = null;
                if (typeof(t.answers[i]) == "string") {
                    if (code == t.answers[i].toUpperCase().charCodeAt(0))
                        ans = t.answers[i];
                }
                else {
                    if (code == t.answers[i][0].toUpperCase().charCodeAt(0))
                        ans = t.answers[i][1];
                }

                if (ans) {
                    var correct = "NULL";
                    if (! (t.hasCorrect === false)) {
                        var correct_ans = typeof(t.answers[t.hasCorrect]) == "string" ? t.answers[t.hasCorrect] : t.answers[t.hasCorrect][1];
                        correct = (correct_ans == ans ? 1 : 0);
                        t.setFlag(correct);
                    }
                    finishedCallback([[[questionField, t.question ? url_encode_removing_commas(t.question) : "NULL"],
                                       [answerField, url_encode_removing_commas(ans)],
                                       [correctField, correct],
                                       [timeField, answerTime - t.creationTime]]]);

                    return false;
                }
            }
        }

        return true;
    }

    // Store the time when this was first displayed.
    this.creationTime = new Date().getTime();
}

Question.htmlDescription = function(opts) {
    return document.createTextNode(opts.q);
}

