function boolToInt(x) { if (x) return 1; else return 0; }

DashedSentence.obligatory = ["s"];

function DashedSentence(div, options, finishedCallback, utils) {
    this.name = "DashedSentence";

    this.options = options;
    this.words = options.get("s").split(/\s+/);
    this.mode = options.dget("mode", "self-paced reading");
    this.wordTime = options.dget("word time", 300); // Only for speeded accpetability.
    this.wordPauseTime = options.dget("word pause time", 100); // Ditto.
    this.currentWord = 0;

    // Defaults.
    this.unshownBorderColor = options.dget("unshownBorderColor", "#9ea4b1");
    this.shownBorderColor = options.dget("shownBorderColor", "black");
    this.unshownWordColor = options.dget("unshownWordColor", "white");
    this.shownWordColor = options.dget("shownWordColor", "black");

    // Precalculate MD5 of sentence.
    var canonicalSentence = this.words.join(' ');
    this.sentenceMD5 = hex_md5(canonicalSentence);

    this.div = div;
    this.div.className = "sentence";

    this.resultsLines = [];
    this.previous_time = null;

    this.wordDivs = new Array(this.words.length);
    for (var j = 0; j < this.words.length; ++j) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(this.words[j]));
        this.div.appendChild(div);
        this.wordDivs[j] = div;
    }

    this.blankWord = function(w) {
        //assert(w > 0);
        //assert(w < this.wordDivs.length, "Attempt to blank non-existent word.");
        this.wordDivs[w].style.borderColor = this.unshownBorderColor;
        this.wordDivs[w].style.color = this.unshownWordColor;
    };
    this.showWord = function(w) {
        //assert(w > 0);
        //assert(w < this.wordDivs.length, "Attempt to blank non-existent word.")
        this.wordDivs[w].style.borderColor = this.shownBorderColor;
        this.wordDivs[w].style.color = this.shownWordColor;
    }

    if (this.mode == "speeded acceptability") {
        this.showWord(0);
        var t = this;
        function wordTimeout() {
            t.blankWord(t.currentWord);
            ++(t.currentWord);
            if (t.currentWord >= t.words.length)
                finishedCallback([[t.sentenceMD5]]);
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
                if (this.currentWord < this.words.length)
                    this.showWord(this.currentWord);
                ++(this.currentWord);
                if (this.currentWord > this.words.length)
                    finishedCallback(this.resultsLines);
            }
        };
    }

    this.recordSprResult = function(time, word) {
        if (word > 0 && word < this.wordDivs.length) {
            this.resultsLines.push([
                word,
                time - this.previous_time,
                boolToInt((word > 0) && (this.wordDivs[word - 1].offsetTop !=
                                         this.wordDivs[word].offsetTop)),
                this.sentenceMD5
            ]);

            this.previous_time = time;
        }
    };
}
