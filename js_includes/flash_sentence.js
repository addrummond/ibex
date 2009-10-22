/* This software is licensed under a BSD license; see the LICENSE file for details. */

FlashSentence.name = "FlashSentence";
FlashSentence.obligatory = ["s"];

function FlashSentence(div, options, finishedCallback, utils) {

    this.options = options;
    this.sentence = options.s;
    this.timeout = dget(options, "timeout", 2000);

    // Precalculate MD5 of sentence.
    this.sentenceDescType = dget(options, "sentenceDescType", "literal");
    assert(this.sentenceDescType == "md5" || this.sentenceDescType == "literal", "Bad value for 'sentenceDescType' option of FlashSentence controller.");
    if (this.sentenceDescType == "md5") {
        var canonicalSentence = this.sentence.split('/\s/').join(' ');
        this.sentenceMD5 = hex_md5(canonicalSentence);
    }
    else {
        this.sentenceMD5 = csv_url_encode(options.s);
    }

    this.div = div;
    this.div.className = "flashed-sentence";
    this.div.appendChild(document.createTextNode(this.sentence));

    if (this.timeout) {
        var t = this;
        utils.setTimeout(function() {
            finishedCallback([[["Sentence (or sentence MD5)", t.sentenceMD5]]]);
        }, this.timeout);
    }
    else {
        // Give results without actually finishing.
        if (utils.setResults)
            utils.setResults([[["Sentence (or sentence MD5)", this.sentenceMD5]]]);
    }
}

FlashSentence.htmlDescription = function (opts) {
    return document.createTextNode(opts.s);
}
