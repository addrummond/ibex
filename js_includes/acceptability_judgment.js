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
                                  timeout:        options.timeout }]
    };

    return new VBox(div, opts, finishedCallback, utils);
}