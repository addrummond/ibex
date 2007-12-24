DashedSentence.obligatory = ["s"];

function DashedSentence(div, options, finishedCallback) {
    this.finishedCallback = finishedCallback;
    this.options = options;
    this.words = options.get("s").split(/\s+/);
    this.mode = options.dget("mode", "spr");
    this.currentWord = 0;

    // Defaults.
    this.unshownBorderColor = options.dget("unshownBorderColor", "#9ea4b1");
    this.shownBorderColor = options.dget("shownBorderColor", "black");
    this.unshownWordColor = options.dget("unshownWordColor", "white");
    this.shownWordColor = options.dget("shownWordColor", "black");

    // Precalculate MD5 of sentence.
    //this.md5 = BLAH BLAH;

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
    
    this.handleKey = function(code, time) {
        if (this.mode == "spr") {
            if (code == 32) {
                this.recordSprResult(time);

                if (this.currentWord < this.words.length - 1) {
                    this.blankWord(this.currentWord);
                    ++(this.currentWord);
                    this.showWord(this.currentWord);
                }
                else {
                    this.finishedCallback();
                }
            }
        }
    };

    this.recordSprResult = function(time) {
        if (this.currentWord > 0) {
            this.resultsLines.push([
                this.current_word,
                time - this.previous_time,
                (this.currentWord > 0) && (this.wordDivs[this.currentWord - 1].offsetTop !=
                                           this.wordDivs[this.currentWord].offsetTop)//,
                //SENTENCE_HASH
            ]);

            this.previous_time = time;
        }
    };

    this.blankWord = function(w) {
        assert(w < this.wordDivs.length, "Attempt to blank non-existent word.");
        this.wordDivs[w].style.borderColor = this.unshownBorderColor;
        this.wordDivs[w].style.color = this.unshownWordColor;
    };
    this.showWord = function(w) {
        assert(w < this.wordDivs.length, "Attempt to blank non-existent word.")
        this.wordDivs[w].style.borderColor = this.shownBorderColor;
        this.wordDivs[w].style.color = this.shownWordColor;
    }
}
