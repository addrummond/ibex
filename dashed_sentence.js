function DashedSentence(sentence) {
    var p = document.createElement("div");
    p.className = "sentence";

    if (sentence.preamble) {
        var ppr = document.createElement("p");
        ppr.className = "preamble";
        ppr.appendChild(document.createTextNode(preamble));
        p.appendChild(ppr);
    }

    var wordDivs = new Array(sentence.words.length);
    for (var j = 0; j < sentence.words.length; ++j) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(sentence.words[j]));
        p.appendChild(div);
        wordDivs[j] = div;
    }

    this.sentenceDiv = p;
    this.wordDivs = wordDivs;
    this.currentWord = -1;

    // Defaults.
    this.unshownBorderColor = "#9ea4b1";
    this.shownBorderColor = "black";
    this.unshownWordColor = "white";
    this.shownWordColor = "black";

    this.blankWord = function(w) {
        if (w < this.wordDivs.length) {
            this.wordDivs[w].style.borderColor = this.unshownBorderColor;
            this.wordDivs[w].style.color = this.unshownWordColor;
        }
    };
    this.showWord = function(w) {
        if (w < this.wordDivs.length) {
            this.wordDivs[w].style.borderColor = this.shownBorderColor;
            this.wordDivs[w].style.color = this.shownWordColor;

            // Did we go onto a new line?
            return (w > 0)
                   &&
                   (this.wordDivs[w].offsetTop !=
                    this.wordDivs[w].offsetTop);
        }
    };
}
