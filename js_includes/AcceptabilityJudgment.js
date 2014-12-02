/* This software is licensed under a BSD license; see the LICENSE file for details. */

define_ibex_controller({
name: "AcceptabilityJudgment",

jqueryWidget: {
    _init: function () {
        var opts = {
            options:     this.options,
            triggers:    [1],
            children:    [this.options._dashed ? "DashedSentence" : "FlashSentence",
                          this.options._dashed ? {
                                                     s: this.options.s,
                                                     mode: this.options.mode,
                                                     display: this.options.display,
                                                     blankText: this.options.blankText,
                                                     wordTime: this.options.wordTime,
                                                     wordPauseTime: this.options.wordPauseTime,
                                                     sentenceDescType: this.options.sentenceDescType,
                                                     showAhead: this.options.showAhead,
                                                     showBehind: this.options.showBehind
                                                 } :
                                                 {
                                                     s: this.options.s,
                                                     timeout: null, // Already present for 'Question'
                                                     audio: this.options.audio,
                                                     audioMessage: this.options.audioMessage,
                                                     audioTrigger: this.options.audioTrigger
                                                 },
                          this.options._dashed ? "!Question" : (this.options.s.audio ? "*Question" : "Question"),
                          { q:                   this.options.q,
                            as:                  this.options.as,
                            hasCorrect:          dget(this.options, "hasCorrect", false),
                            presentAsScale:      this.options.presentAsScale,
                            presentHorizontally: this.options.presentHorizontally,
                            autoFirstChar:       typeof(this.options.autoFirstChar) == "undefined" ? this.options.presentAsScale : this.options.autoFirstChar,
                            randomOrder:         this.options.randomOrder,
                            showNumbers:         this.options.showNumbers,
                            timeout:             this.options.timeout,
                            instructions:        this.options.instructions,
                            leftComment:         this.options.leftComment,
                            rightComment:        this.options.rightComment }]/*,
            manipulators: [
                [0, function(div) { div.css('font-size', "larger"); return div; }]
            ]*/
        };

        this.element.VBox(opts);
    }
},

properties: {
    obligatory: ["s", "as"],
    htmlDescription:
        function (opts) {
            var s = ibex_controller_get_property("FlashSentence", "htmlDescription")(opts);
            var q = ibex_controller_get_property("Question", "htmlDescription")(opts);
            var p =
                $("<p>")
                .append($("<p>").append("Q: ").append($(q)))
                .append("<br>").append($("<b>").text("S:"))
                .append($(s));
             return p;
        }
}
});
