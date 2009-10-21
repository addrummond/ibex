/* This software is licensed under a BSD license; see the LICENSE file for details. */

function boolToInt(x) { if (x) return 1; else return 0; }

DashedSentence.name = "DashedSentence";
DashedSentence.obligatory = ["s"];

function DashedSentence(div, options, finishedCallback, utils) {
    this.options = options;
    if (typeof(options.s) == "string")
        this.words = options.s.split(/\s+/);
    else {
        assert_is_arraylike(options.s, "Bad value for 's' option of DashedSentence.");
        this.words = options.s;
    }
    this.mode = dget(options, "mode", "self-paced reading");
    this.wordTime = dget(options, "wordTime", 300); // Only for speeded accpetability.
    this.wordPauseTime = dget(options, "wordPauseTime", 100); // Ditto.
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
    this.unshownBorderColor = dget(options, "unshownBorderColor", "#9ea4b1");
    this.shownBorderColor = dget(options, "shownBorderColor", "black");
    this.unshownWordColor = dget(options, "unshownWordColor", "white");
    this.shownWordColor = dget(options, "shownWordColor", "black");

    // Precalculate MD5 of sentence.
    this.sentenceDescType = dget(options, "sentenceDescType", "literal");
    assert(this.sentenceDescType == "md5" || this.sentenceDescType == "literal", "Bad value for 'sentenceDescType' option of DashedSentence.");
    if (this.sentenceDescType == "md5") {
        var canonicalSentence = this.words.join(' ');
        this.sentenceDesc = hex_md5(canonicalSentence);
    }
    else {
        this.sentenceDesc = url_encode_removing_commas(options.s);
    }

    this.div = div;
    this.div.className = "sentence";

    this.resultsLines = [];
    this.previousTime = null;

    this.wordDivs = new Array(this.words.length);
    for (var j = 0; j < this.words.length; ++j) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(this.words[j]));
        this.div.appendChild(div);
        this.wordDivs[j] = div;
    }

    this.blankWord = function(w) {
        if (this.currentWord <= this.stoppingPoint) {
            this.wordDivs[w].style.borderColor = this.unshownBorderColor;
            this.wordDivs[w].style.color = this.unshownWordColor;
        }
    };
    this.showWord = function(w) {
        if (this.currentWord < this.stoppingPoint) {
            this.wordDivs[w].style.borderColor = this.shownBorderColor;
            this.wordDivs[w].style.color = this.shownWordColor;
        }
    }

    if (this.mode == "speeded acceptability") {
        this.showWord(0);
        var t = this;
        function wordTimeout() {
            t.blankWord(t.currentWord);
            ++(t.currentWord);
            if (t.currentWord >= t.stoppingPoint)
                finishedCallback([[["Sentence (or sentence MD5)", t.sentenceDesc]]]);
            else
                utils.setTimeout(wordPauseTimeout, t.wordPauseTime);
        }
        function wordPauseTimeout() {
            t.showWord(t.currentWord);
            utils.clearTimeout(wordPauseTimeout);
            utils.setTimeout(wordTimeout, t.wordTime);
        }
        utils.setTimeout(wordTimeout, this.wordTime);
    }

    if (this.mode == "self-paced reading") {    
        this.handleKey = function(code, time) {
            if (code == 32) {
                this.recordSprResult(time, this.currentWord);

                if (this.currentWord - 1 >= 0)
                    this.blankWord(this.currentWord - 1);
                if (this.currentWord < this.stoppingPoint)
                    this.showWord(this.currentWord);
                ++(this.currentWord);
                if (this.currentWord > this.stoppingPoint)
                    finishedCallback(this.resultsLines);

                return false;
            }
            else {
                return true;
            }
        };
    }

    this.recordSprResult = function(time, word) {
        if (word > 0 && word < this.stoppingPoint) {
            assert(this.previousTime, "Internal error in dashed_sentence.js");
            this.resultsLines.push([
                ["Word number", word],
                ["Word", this.words[word - 1]],
                ["Reading time", time - this.previousTime],
                ["Newline?", boolToInt((word > 0) && (this.wordDivs[word - 1].offsetTop !=
                                                      this.wordDivs[word].offsetTop))],
                ["Sentence (or sentence MD5)", this.sentenceDesc]
            ]);
        }
        this.previousTime = time;
    };
}

DashedSentence.htmlDescription = function (opts) {
    return document.createTextNode(opts.s);
}

