/* This software is licensed under a BSD license; see the LICENSE file for details. */

//
// TODO: Replace this controller with something that's not such a horrible mess!
// 

(function () {

var __Question_callback__ = null;
var __Questions_answers__ = null;

define_ibex_controller({
name: "Question",

jqueryWidget: {
    _init: function () {
        this.cssPrefix = this.options._cssPrefix;
        this.utils = this.options._utils;
        this.finishedCallback = this.options._finishedCallback;

        var questionField = "Question (NULL if none).";
        var answerField = "Answer";
        var correctField = "Whether or not answer was correct (NULL if N/A)";
        var timeField = "Time taken to answer.";

        this.question = dget(this.options, "q");
        this.answers = this.options.as;

        this.hasCorrect = dget(this.options, "hasCorrect", false);
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
        this.showNumbers = dget(this.options, "showNumbers", true);
        this.presentAsScale = dget(this.options, "presentAsScale", false);
        this.randomOrder = dget(this.options, "randomOrder", ! (this.hasCorrect === false || this.presentAsScale));
        this.timeout = dget(this.options, "timeout", null);
        this.instructions = dget(this.options, "instructions");
        this.leftComment = dget(this.options, "leftComment");
        this.rightComment = dget(this.options, "rightComment");
        this.autoFirstChar = dget(this.options, "autoFirstChar", false);
        this.presentHorizontally = dget(this.options, "presentHorizontally", false);

        if (! (this.hasCorrect === false))
            assert(typeof(this.hasCorrect) == "number" && this.hasCorrect < this.answers.length,
                   "Bad index for correct answer in Question");

        if (this.randomOrder) {
            assert(typeof(this.answers[0]) != "object",
                  "Cannot set 'randomOrder' option to a list of keys when keys are included with the 'as' option.");
            assert(typeof(this.answers[0]) != "object" || this.answers.length == this.randomOrder.length,
                   "Length of 'randomOrder' doesn't match length of 'as'.");

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
                this.utils.setValueForNextElement("failed", true);
            }
        }

        if (this.question) {
            this.qp = $(document.createElement("p"))
            .addClass(this.cssPrefix + "question-text")
            .css('text-align', conf_centerItems ? 'center' : 'left')
            .append(this.question);
        }
        this.xl = $(document.createElement(((!this.presentAsScale && !this.presentHorizontally) && this.showNumbers) ? "ol" : "ul"))
            .css('margin-left', "2em").css('padding-left', 0);
        __Question_answers__ = new Array(this.answers.length);

        if ((this.presentAsScale || this.presentHorizontally) && this.leftComment) {
            var lcd = $(document.createElement("li"))
                      .addClass(this.cssPrefix + "scale-comment-box")
                      .append(this.leftComment);
            this.xl.append(lcd);
        }
        for (var i = 0; i < this.orderedAnswers.length; ++i) {
            var li;
            li = $(document.createElement("li"));
            if (this.presentAsScale || this.presentHorizontally) {
                li.addClass(this.cssPrefix + "scale-box");
                var t = this;
                 // IE doesn't support :hover for anything other than links, so we
                 // have to use JS.
                 (function (li) {
                     li.mouseover(function () {
                         li.css('border-color', "black")
                           .css('cursor', 'pointer');
                     });
                     li.mouseout(function () {
                         li.css('border-color', "#9ea4b1")
                           .css('cursor', "default");
                     });
                 })(li);
            }
            else {
                li.addClass(this.cssPrefix + "normal-answer");
            }
            (function(i) {
                li.click(function () { __Question_callback__(i); });
            })(i);
            var ans = typeof(this.orderedAnswers[i]) == "string" ? this.orderedAnswers[i] : this.orderedAnswers[i][1];
            var t = this; // 'this' doesn't behave as a lexically scoped variable so can't be
                          // captured in the closure defined below.
            var a = $(document.createElement("span")).addClass(this.cssPrefix + "fake-link");
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
                t.finishedCallback([[[questionField, t.question ? csv_url_encode(t.question) : "NULL"],
                                     [answerField, csv_url_encode(ans)],
                                     [correctField, correct],
                                     [timeField, answerTime - t.creationTime]]]);
            };
            this.xl.append(li.append(a.append(ans)));
        }
        if ((this.presentAsScale || this.presentHorizontally) && this.rightComment) {
            this.xl.append($(document.createElement("li"))
                           .addClass(this.cssPrefix + 'scale-comment-box')
                           .append(this.rightComment));
        }

        if (! (this.qp === undefined))
            this.element.append(this.qp);

        // Again, using tables to center because IE sucks.
        var table = $("<table" + (conf_centerItems ? " align='center'" : "") + ">");
        var tr = $(document.createElement("tr"));
        var td = $("<td" + (conf_centerItems ? " align='center'" : "") + ">")
        if (conf_centerItems)
            td.attr('align', 'center');
        this.element.append(table.append(tr.append(td.append(this.xl))));

        if (this.instructions) {
            this.element.append($(document.createElement("p"))
                                .addClass(this.cssPrefix + "instructions-text")
                                .css('text-align', conf_centerItems ? 'center' : 'left')
                                .text(this.instructions));
        }

        if (this.timeout) {
            var t = this;
            this.utils.setTimeout(function () {
                var answerTime = new Date().getTime();
                t.setFlag(false);
                t.finishedCallback([[[questionField, t.question ? csv_url_encode(t.question) : "NULL"],
                                     [answerField, "NULL"], [correctField, "NULL"],
                                     [timeField, answerTime - t.creationTime]]]);
            }, this.timeout);
        }

        // TODO: A bit of code duplication in this function.
        var t = this;
        this.safeBind($(document), 'keydown', function(e) {
            var code = e.keyCode;
            var time = new Date().getTime();

            var answerTime = new Date().getTime();
            if ((! t.presentAsScale && !t.presentHorizontally) && t.showNumbers &&
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
                    t.finishedCallback([[[questionField, t.question ? csv_url_encode(t.question) : "NULL"],
                                         [answerField, csv_url_encode(ans)],
                                         [correctField, correct],
                                         [timeField, answerTime - t.creationTime]]]);

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
                var ans = null;

                if (typeof(t.randomOrder) != "object") {
                    for (var i = 0; i < t.answers.length; ++i) {
                        if (t.autoFirstChar && typeof(t.answers[i]) == "string" && code == t.answers[i].toUpperCase().charCodeAt(0)) {
                            ans = t.answers[i];
                            break;
                        }
                        else if ($.isArray(t.answers[i]) && code == t.answers[i][0].toUpperCase().charCodeAt(0)) {
                            ans = t.answers[i][1];
                            break;
                        }
                    }
                }
                else {
                    for (var i = 0; i < t.randomOrder.length; ++i) {
                        if (code == t.randomOrder[i].toUpperCase().charCodeAt(0)) {
                            ans = t.orderedAnswers[i];
                            break;
                        }
                    }
                }

                if (ans) {
                    var correct = "NULL";
                    if (! (t.hasCorrect === false)) {
                        var correct_ans = typeof(t.answers[t.hasCorrect]) == "string" ? t.answers[t.hasCorrect] : t.answers[t.hasCorrect][1];
                        correct = (correct_ans == ans ? 1 : 0);
                        t.setFlag(correct);
                    }
                    t.finishedCallback([[[questionField, t.question ? csv_url_encode(t.question) : "NULL"],
                                         [answerField, csv_url_encode(ans)],
                                         [correctField, correct],
                                         [timeField, answerTime - t.creationTime]]]);
                    
                    return false;
                }
            }

            return true;
        });

        // Store the time when this was first displayed.
        this.creationTime = new Date().getTime();
    }
},

properties: {
    obligatory: ["as"],
    htmlDescription: function(opts) {
        return $(document.createElement("div")).text(opts.q || "");
    }
}
});

})();


