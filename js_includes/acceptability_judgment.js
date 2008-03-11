/* This software is licensed under a BSD license; see the LICENSE file for details. */

AcceptabilityJudgment.obligatory = ["s", "q", "as"];

function AcceptabilityJudgment(div, options, finishedCallback, utils) {
    var opts = {
        q:           options.q,
        as:          options.as,
        name:        "AcceptabilityJudgment",
        triggers:    [1],
        children:    [FlashSentence, {s: options.s, timeout: dget(options, "timeout", null)},
                      Question, { q:              options.q,
                                  as:             options.as,
                                  hasCorrect:     options.hasCorrect,
                                  presentAsScale: options.presentAsScale,
                                  randomOrder:    options.randomOrder,
                                  showNumbers:    options.showNumbers,
                                  timeout:        options.timeout,
                                  instructions:   options.instructions }]
    };

    return new VBox(div, opts, finishedCallback, utils);
}

AcceptabilityJudgment.htmlDescription = function (opts) {
    return Question.htmlDescription(opts);
}

