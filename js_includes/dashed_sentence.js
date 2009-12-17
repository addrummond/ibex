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

        // Defaults.
        this.unshownBorderColor = dget(this.options, "unshownBorderColor", "#9ea4b1");
        this.shownBorderColor = dget(this.options, "shownBorderColor", "black");
        this.unshownWordColor = dget(this.options, "unshownWordColor", "white");
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

        this.element.addClass(this.cssPrefix + "sentence");

        this.resultsLines = [];
        this.previousTime = null;

        this.wordDivs = new Array(this.words.length);
        for (var j = 0; j < this.words.length; ++j) {
            var div = $(document.createElement("div")).text(this.words[j]);
            this.element.append(div);
            this.wordDivs[j] = div;
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
            this.safeBind($(window), 'keydown', function(e) {
                var time = new Date().getTime();
                var code = e.keyCode;

                if (code == 32) {
                    t.recordSprResult(time, t.currentWord);

                    if (t.currentWord - 1 >= 0)
                        t.blankWord(t.currentWord - 1);
                    if (t.currentWord < t.stoppingPoint)
                        t.showWord(t.currentWord);
                    ++(t.currentWord);
                    if (t.currentWord > t.stoppingPoint)
                        t.finishedCallback(t.resultsLines);

                    return false;
                }
                else {
                    return true;
                }
            });
        }
    },

    // Not using JQuery in these two methods just in case it slows things down too much.
    // NOTE: [0] subscript gets DOM object from JQuery selector.
    blankWord: function(w) {
        if (this.currentWord <= this.stoppingPoint) {
            this.wordDivs[w][0].style.borderColor = this.unshownBorderColor;
            this.wordDivs[w][0].style.color = this.unshownWordColor;
        }
    },
    showWord: function(w) {
        if (this.currentWord < this.stoppingPoint) {
            this.wordDivs[w][0].style.borderColor = this.shownBorderColor;
            this.wordDivs[w][0].style.color = this.shownWordColor;
        }
    },

    recordSprResult: function(time, word) {
        if (word > 0 && word < this.stoppingPoint) {
            assert(this.previousTime, "Internal error in dashed_sentence.js");
            this.resultsLines.push([
                ["Word number", word],
                ["Word", csv_url_encode(this.words[word - 1])],
                ["Reading time", time - this.previousTime],
                ["Newline?", boolToInt((word > 0) && (this.wordDivs[word - 1].offsetTop !=
                                                      this.wordDivs[word].offsetTop))],
                ["Sentence (or sentence MD5)", this.sentenceDesc]
            ]);
        }
        this.previousTime = time;
    }
});

$.ui.DashedSentence._webspr_name = "DashedSentence";
$.ui.DashedSentence._webspr_obligatory = ["s"];
$.ui.DashedSentence._webspr_htmlDescription = function (opts) {
    return $(document.createElement("div")).text(opts.s);
}
