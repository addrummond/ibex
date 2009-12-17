/* This software is licensed under a BSD license; see the LICENSE file for details. */

$.widget("ui.AcceptabilityJudgment", {
    init: function () {
        this.cssPrefix = this.options._cssPrefix;
        this.utils = this.options._utils;
        this.finishedCallback = this.options._finishedCallback;

        var opts = {
            triggers:    [1],
            children:    [FlashSentence, {s: options.s, timeout: dget(options, "timeout", null)},
                          Question, { q:              options.q,
                                      as:             options.as,
                                      hasCorrect:     options.hasCorrect,
                                      presentAsScale: options.presentAsScale,
                                      randomOrder:    options.randomOrder,
                                      showNumbers:    options.showNumbers,
                                      timeout:        options.timeout,
                                      instructions:   options.instructions,
                                      leftComment:    options.leftComment,
                                      rightComment:   options.rightComment }]/*,
            manipulators: [
                [0, function(div) { div.css('font-size', "larger"); return div; }]
            ]*/
        };

        this.element.VBox(opts);
    }
});

$.ui.AcceptabilityJudgment._webspr_name = "AcceptabilityJudgment";
$.ui.AcceptabilityJudgment._webspr_obligatory = ["s", "as"];
$.ui.AcceptabilityJudgment._webspr_htmlDescription = function (opts) {
    var s = FlashSentence.htmlDescription(opts);
    var q = Question.htmlDescription(opts);
    var p = document.createElement("p");
    var b1 = document.createElement("b");
    b1.appendChild(document.createTextNode("S: "));
    p.appendChild(b1);
    p.appendChild(document.createTextNode(opts.s + " "));
    p.appendChild(document.createElement("br"));
    var b2 = document.createElement("b");
    b2.appendChild(document.createTextNode("Q: "));
    p.appendChild(b2);
    p.appendChild(document.createTextNode(opts.q));
    return p;
};
