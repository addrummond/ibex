/* This software is licensed under a BSD license; see the LICENSE file for details. */

function boolToInt(x) { if (x) return 1; else return 0; }

$.widget("ui.DashedSentence", {
    _init: function() {
        this.cssPrefix = this.options._cssPrefix;
        this.utils = this.options._utils;
        this.finishedCallback = this.options._finishedCallback;

        if (typeof(this.options.s) == "string")
            this.words = this.options.s.split(/\s+/);
        else {
            assert_is_arraylike(this.options.s, "Bad value for 's' option of DashedSentence.");
            this.words = this.options.s;
        }
        this.mode = dget(this.options, "mode", "self-paced reading");
        this.wordTime = dget(this.options, "wordTime", 300); // Only for speeded accpetability.
        this.wordPauseTime = dget(this.options, "wordPauseTime", 100); // Ditto.
        this.showAhead = dget(this.options, "showAhead", true);
        this.showBehind = dget(this.options, "showBehind", true);
        this.currentWord = 0;

        // Is there a "stopping point" specified?
        this.stoppingPoint = this.words.length;
        for (var i = 0; i < this.words.length; ++i) {
            if (stringStartsWith("@", this.words[i])) {
                this.words[i] = this.words[i].substring(1);
                this.stoppingPoint = i + 1;
                break;
            }
        }

        this.mainDiv = $("<div>");
        this.element.append(this.mainDiv);

        this.background = this.element.css('background-color') || "white";
        this.isIE7;
        /*@cc_on this.isIE = true; @*/
        if (this.isIE)
            this.background = "white";

        // Defaults.
        this.unshownBorderColor = dget(this.options, "unshownBorderColor", "#9ea4b1");
        this.shownBorderColor = dget(this.options, "shownBorderColor", "black");
        this.unshownWordColor = dget(this.options, "unshownWordColor", this.background);
        this.shownWordColor = dget(this.options, "shownWordColor", "black");

        // Precalculate MD5 of sentence.
        this.sentenceDescType = dget(this.options, "sentenceDescType", "literal");
        assert(this.sentenceDescType == "md5" || this.sentenceDescType == "literal", "Bad value for 'sentenceDescType' option of DashedSentence.");
        if (this.sentenceDescType == "md5") {
            var canonicalSentence = this.words.join(' ');
            this.sentenceDesc = hex_md5(canonicalSentence);
        }
        else {
            this.sentenceDesc = csv_url_encode(this.options.s);
        }

        this.mainDiv.addClass(this.cssPrefix + "sentence");

        this.resultsLines = [];
        if (this.mode == "self-paced reading") {
            // Don't want to be allocating arrays in time-critical code.
            this.sprResults = new Array(this.words.length - 1);
            for (var i = 0; i < this.sprResults.length; ++i)
                this.sprResults[i] = new Array(2);
        }
        this.previousTime = null;

        this.wordDivs = new Array(this.words.length);
        this.wdnjq = new Array(this.words.length); // 'word divs no jQuery'.
        for (var j = 0; j < this.words.length; ++j) {
            var div = $(document.createElement("div")).text(this.words[j]);
            if (! this.showAhead)
                div.css('border-color', this.background);
            this.mainDiv.append(div);
            this.wordDivs[j] = div;
            this.wdnjq[j] = div[0];
        }

        if (this.mode == "speeded acceptability") {
            this.showWord(0);
            var t = this;
            function wordTimeout() {
                t.blankWord(t.currentWord);
                ++(t.currentWord);
                if (t.currentWord >= t.stoppingPoint)
                    t.finishedCallback([[["Sentence (or sentence MD5)", t.sentenceDesc]]]);
                else
                    t.utils.setTimeout(wordPauseTimeout, t.wordPauseTime);
            }
            function wordPauseTimeout() {
                t.showWord(t.currentWord);
                this.utils.clearTimeout(wordPauseTimeout);
                this.utils.setTimeout(wordTimeout, t.wordTime);
            }
            this.utils.setTimeout(wordTimeout, this.wordTime);
        }

        if (this.mode == "self-paced reading") {
            var t = this;
            // Inlining this to minimize function calls in code for updating screen after space is pressed.
/*            function goToNext(time) {
                t.recordSprResult(time, t.currentWord);

                if (t.currentWord - 1 >= 0)
                    t.blankWord(t.currentWord - 1);
                if (t.currentWord < t.stoppingPoint)
                    t.showWord(t.currentWord);
                ++(t.currentWord);
                if (t.currentWord > t.stoppingPoint) {
                    t.processSprResults();
                    t.finishedCallback(t.resultsLines);
                }

                return false;
            }*/

            this.safeBind($(document), 'keydown', function(e) {
                var time = new Date().getTime();
                var code = e.keyCode;

                if (code == 32) {
                    // *** goToNext() ***
//                    t.recordSprResult(time, t.currentWord);
                    var word = t.currentWord;
                    if (word > 0 && word < t.stoppingPoint) {
                        var rs = t.sprResults[word-1];
                        rs[0] = time;
                        rs[1] = t.previousTime;
                    }
                    t.previousTime = time;

                    if (t.currentWord - 1 >= 0)
                        t.blankWord(t.currentWord - 1);
                    if (t.currentWord < t.stoppingPoint)
                        t.showWord(t.currentWord);
                    ++(t.currentWord);
                    if (t.currentWord > t.stoppingPoint) {
                        t.processSprResults();
                        t.finishedCallback(t.resultsLines);
                    }
                    return false;
                    // ***
                }
                else {
                    return true;
                }
            });

            // For iPhone/iPod touch -- add button for going to next word.
            if (isIPhone) {
                var btext = dget(this.options, "iPhoneNextButtonText", "next");
                var next = $("<div>")
                           .addClass(this.cssPrefix + "iphone-next")
                           .text(btext);
                this.element.append(next);
                next.click(function () {
                    var time = new Date().getTime();

                    // *** goToNext() ***
                    //t.recordSprResult(time, t.currentWord);
                    var word = t.currentWord;
                    if (word > 0 && word < t.stoppingPoint) {
                        var rs = t.sprResults[word-1];
                        rs[0] = time;
                        rs[1] = t.previousTime;
                    }
                    t.previousTime = time;

                    if (t.currentWord - 1 >= 0)
                        t.blankWord(t.currentWord - 1);
                    if (t.currentWord < t.stoppingPoint)
                        t.showWord(t.currentWord);
                    ++(t.currentWord);
                    if (t.currentWord > t.stoppingPoint) {
                        t.processSprResults();
                        t.finishedCallback(t.resultsLines);
                    }

                    return false;
                    // ***
                });
            }
        }
    },

    // Not using JQuery in these two methods just in case it slows things down too much.
    // NOTE: [0] subscript gets DOM object from JQuery selector.
    blankWord: function(w) {
        if (this.currentWord <= this.stoppingPoint) {
            this.wdnjq[w].style.borderColor = this.unshownBorderColor;
            this.wdnjq[w].style.color = this.unshownWordColor;
            if (! this.showBehind)
                this.wdnjq[w].style.borderColor = this.background;
        }
    },
    showWord: function(w) {
        if (this.currentWord < this.stoppingPoint) {
            if (this.showAhead || this.showBehind)
                this.wdnjq[w].style.borderColor = this.shownBorderColor;
            this.wdnjq[w].style.color = this.shownWordColor;
        }
    },

    // Inlining this now.
    /*recordSprResult: function(time, word) {
        if (word > 0 && word < this.stoppingPoint) {
            var rs = this.sprResults[word-1];
            rs[0] = time;
            rs[1] = this.previousTime;
        }
        this.previousTime = time;
    },*/

    processSprResults: function () {
        for (var i = 0; i < this.sprResults.length; ++i) {
            this.resultsLines.push([
                ["Word number", i+1],
                ["Word", csv_url_encode(this.words[i])],
                ["Reading time", this.sprResults[i][0] - this.sprResults[i][1]],
                ["Newline?", boolToInt(((i+1) > 0) && (this.wordDivs[i].offsetTop !=
                                                       this.wordDivs[i+1].offsetTop))],
                ["Sentence (or sentence MD5)", this.sentenceDesc]
            ]);
        }
    }
});

ibex_controller_set_properties("DashedSentence", {
    obligatory: ["s"],
    htmlDescription: function (opts) {
        return $(document.createElement("div")).text(opts.s);
    }
});
