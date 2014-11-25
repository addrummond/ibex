/* This software is licensed under a BSD license; see the LICENSE file for details. */

function boolToInt(x) { if (x) return 1; else return 0; }

define_ibex_controller({
name: "DashedSentence",

jqueryWidget: {
    _init: function() {
        this.cssPrefix = this.options._cssPrefix;
        this.utils = this.options._utils;
        this.finishedCallback = this.options._finishedCallback;

        if (typeof(this.options.s) == "string") {
            // replace all linebreaks (and surrounding space) with 'space-return-space'
            var inputString = this.options.s.replace(/\s*[\r\n]\s*/g, " \r ");
            this.words = inputString.split(/[ \t]+/);
        } else {
            assert_is_arraylike(this.options.s, "Bad value for 's' option of DashedSentence.");
            this.words = this.options.s;
        }
        this.mode = dget(this.options, "mode", "self-paced reading");
        assert(this.mode == "self-paced reading" || this.mode == "speeded acceptability",
               "Value of 'mode' option for DashedSentence controller must be either " +
               "'self-paced reading' or 'speeded acceptability'.");
        this.display = dget(this.options, "display", "dashed");
        this.blankText = dget(this.options, "blankText", "\u2014\u2014"/*mdash*/);
        this.wordTime = dget(this.options, "wordTime", this.display == "in place" ? 400 : 300); // Only for speeded accpetability.
        this.wordPauseTime = dget(this.options, "wordPauseTime", this.display == "in place" ? 0 : 100); // Ditto.
        this.showAhead = dget(this.options, "showAhead", true);
        this.showBehind = dget(this.options, "showBehind", true);
        assert(this.display == "dashed" || this.display == "in place",
               "Value of 'display' option for DashedSentence controller must be either " +
               "'dashed' (default) or 'in place'.");

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

        this.hideUnderscores = dget(this.options, "hideUnderscores", true);
        if (this.hideUnderscores) {
            this.words = $.map(this.words, function(word) { return word.replace(/_/g, ' ') });
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
	    if (typeof(this.options.s) == "string")
		this.sentenceDesc = csv_url_encode(this.options.s);
	    else
		this.sentenceDesc = csv_url_encode(this.options.s.join(' '));
        }

        this.mainDiv.addClass(this.cssPrefix + "sentence");

        this.resultsLines = [];
        if (this.mode == "self-paced reading") {
            // Don't want to be allocating arrays in time-critical code.
            this.sprResults = [];
            for (var i = 0; i < this.words.length; ++i)
                this.sprResults[i] = new Array(2);
        }
        this.previousTime = null;

        if (this.display == "in place") {
            this.wordSpan = $(document.createElement("span")).text(this.blankText);
            if (conf_centerItems) {
                this.mainDiv.css('text-align', 'center');
                this.wordSpan.css('text-align', 'center');
            }
            this.mainDiv.append(this.wordSpan);

            this.blankWord = this.blankWord_inplace;
            this.showWord = this.showWord_inplace;
        }
        else { // dashed
            this.blankWord = this.blankWord_dashed;
            this.showWord = this.showWord_dashed;

            this.wordISpans = []; // Inner spans.
            this.wordOSpans = []; // Outer spans.
            this.owsnjq = []; // 'outer word spans no jQuery'.
            this.iwsnjq = []; // 'inner word spans no jQuery'.
            for (var j = 0; j < this.words.length; ++j) {
                if ( this.words[j] == "\r" ) {
                    this.mainDiv.append('<br/>');

                    if (j <= this.stoppingPoint)
                        this.stoppingPoint--;
                    
                    continue;
                }

                var ispan;
                var ospan = $(document.createElement("span"))
                            .addClass(this.cssPrefix + 'ospan')
                            .append(ispan = $(document.createElement("span"))
                                            .addClass(this.cssPrefix + 'ispan')
                                            .text(this.words[j]));
                if (! this.showAhead)
                    ospan.css('border-color', this.background);
                this.mainDiv.append(ospan);
                if (j + 1 < this.words.length)
                    this.mainDiv.append("&nbsp; ");
                this.wordISpans.push(ispan);
                this.wordOSpans.push(ospan);
                this.iwsnjq.push(ispan[0]);
                this.owsnjq.push(ospan[0]);
            }
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
                t.utils.clearTimeout(wordPauseTimeout);
                t.utils.setTimeout(wordTimeout, t.wordTime);
            }
            this.utils.setTimeout(wordTimeout, this.wordTime);
        }
        else if (this.mode == "self-paced reading") {
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
                    if (word > 0 && word <= t.stoppingPoint) {
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
    blankWord_dashed: function(w) {
        if (this.currentWord <= this.stoppingPoint) {
            this.owsnjq[w].style.borderColor = this.unshownBorderColor;
            this.iwsnjq[w].style.visibility = "hidden";
            if (! this.showBehind)
                this.owsnjq[w].style.borderColor = this.background;
        }
    },
    showWord_dashed: function(w) {
        if (this.currentWord < this.stoppingPoint) {
            if (this.showAhead || this.showBehind)
                this.owsnjq[w].style.borderColor = this.shownBorderColor;
            this.iwsnjq[w].style.visibility = "visible";
        }
    },

    blankWord_inplace: function (w) {
        if (this.wordPauseTime > 0 && this.currentWord <= this.stoppingPoint) {
            this.wordSpan.empty();
        }
    },
    showWord_inplace: function (w) {
        if (this.currentWord < this.stoppingPoint) {
            this.wordSpan.text(this.words[this.currentWord]);
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
        var nonSpaceWords = [];
        for (var i = 0; i < this.words.length; ++i) {
        	if ( this.words[i] != "\r" )
	            nonSpaceWords.push(this.words[i]);
        }

        for (var i = 0; i < nonSpaceWords.length; ++i) {
            this.resultsLines.push([
                ["Word number", i+1],
                ["Word", csv_url_encode(nonSpaceWords[i])],
                ["Reading time", this.sprResults[i][0] - this.sprResults[i][1]],
                ["Newline?", (! this.display == "in place") &&
                             boolToInt(((i+1) < this.wordOSpans.length) &&
                             (this.wordOSpans[i].offset().top != this.wordOSpans[i+1].offset().top))],
                ["Sentence (or sentence MD5)", this.sentenceDesc]
            ]);
        }
    }
},

properties: {
    obligatory: ["s"],
    htmlDescription: function (opts) {
        return $(document.createElement("div")).text(opts.s);
    }
}
});
