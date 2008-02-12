AcceptabilityJudgment.obligatory = ["s", "q", "as"];

function AcceptabilityJudgment(div, options, finishedCallback, utils) {
    var opts = {
        q:           options.q,
        as:          options.as,
        name:        "AcceptabilityJudgment",
        triggers:    [1],
        children:    [FlashSentence, {s: options.s},
                      Question, { q:           options.q,
                                  as:          options.as,
                                  hasCorrect:  options.hasCorrect,
                                  randomOrder: options.randomOrder,
                                  showNumbers: options.showNumbers,
                                  timeout:     options.timeout }]
    };

    return new VBox(div, opts, finishedCallback, utils);
}