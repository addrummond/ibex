/* This software is licensed under a BSD license; see the LICENSE file for details. */

define_ibex_controller({
name: "FlashSentence",

jqueryWidget: {
    _init: function () {
        this.cssPrefix = this.options._cssPrefix;
        this.finishedCallback = this.options._finishedCallback;
        this.utils = this.options._utils;

        if (typeof(this.options.s) != "string")
            this.sentenceDom = htmlCodeToDOM(this.options.s)
        else
            this.sentenceDom = $("<div>").text(this.options.s);
        
        this.timeout = dget(this.options, "timeout", 2000);

        this.sentenceDescType = dget(this.options, "sentenceDescType", "literal");
        assert(this.sentenceDescType == "md5" || this.sentenceDescType == "literal", "Bad value for 'sentenceDescType' option of FlashSentence controller.");
        if (this.sentenceDescType == "md5") {
            var canonicalSentence = this.sentence.split('/\s/').join(' ');
            this.sentenceMD5 = hex_md5(canonicalSentence);
        }
        else {
            this.sentenceMD5 = csv_url_encode(this.options.s);
        }

        this.element.addClass(this.cssPrefix + "flashed-sentence");
        this.element.append(this.sentenceDom);

        if (this.timeout) {
            var t = this;
            this.utils.setTimeout(function() {
                t.finishedCallback([[["Sentence (or sentence MD5)", t.sentenceMD5]]]);
            }, this.timeout);
        }
        else {
            // Give results without actually finishing.
            if (this.utils.setResults)
                this.utils.setResults([[["Sentence (or sentence MD5)", this.sentenceMD5]]]);
        }
    }
},

properties: {
    obligatory: ["s"],
    htmlDescription: function (opts) {
        return $(document.createElement("div")).text(opts.s)[0];
    }
}
});
