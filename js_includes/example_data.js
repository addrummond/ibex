var showProgressBar = false;
var shuffleSequence = seq("instructions", sepWith("sep", rshuffle("filler", /*followEachWith("question",*/ rshuffle(1, 2, 3)/*)*/)));
var practiceItems = [1,2];

var defaults = [
    Separator, {"normalMessage" : "Wait for the next sentence",
                "errorMessage" :  "Timeout. Wait for the next sentence.",
                "displayMode" :   "overwrite",  // "overwrite" is the default; could also use "append"
                "transfer" :       2000}, // Could also set to "keypress" (press any key to continue).
    DashedSentence, {"mode" :         "speeded acceptability" /*"self-paced reading"*/,
                     "displayMode" : "replace"},
    FlashSentence, {"timeout" : 500},
//    Question, ["hasCorrect", false,
//               "timeout",     3000],
    AcceptabilityJudgment, {"q" : "Was that an acceptable sentence?", "showNumbers" : false, "as" : ["Yes", "No"], randomOrder: false}
];

var items = [
    ["instructions", Message, {"html" : "<p>[Insert instructions here].</p><p>Press any key to start.</p>"}],
    ["sep", Separator, {}],
    ["question", Question, {"q" : "Was this an acceptable sentence?", "as" : ["Yes", "No"]}],

    [1, AcceptabilityJudgment, {"s" : "Here's a sentence to judge", hasCorrect : "yes"}],
    [2, AcceptabilityJudgment, {"s" : "Here's another sentence to judge", hasCorrect : "yes"}]
    /*[1, VBox, ["children", [FlashSentence, ["s", "A sentence which has a relative clause"],
                            DashedSentence, ["s", "foo bar bloo blah amp fug"]],
               "triggers", [0,1]]],
    [1, DashedSentence, ["s", "A sentence which has a relative clause"]],
    [1, DashedSentence, ["s", "Another sentence which has a relative clause"]],
    [1, DashedSentence, ["s", "Yet another one with a relative clause"]],
    [2, DashedSentence, ["s", "A sentence without a (non-reduced) relative clause"]],
    [2, DashedSentence, ["s", "The second sentence without a (non-reduced) relative clause"]],
    [2, DashedSentence, ["s", "The third sentence without a (non-reduced) relative clause"]],

    ["filler", DashedSentence, ["s", "A filler sentence"]],
    ["filler", DashedSentence, ["s", "Foo bar another sentence filler"]],
    ["filler", DashedSentence, ["s", "More grist to the mill"]],
    ["filler", DashedSentence, ["s", "Fill fill fill fill fill"]],
    ["filler", DashedSentence, ["s", "Not an interesting sentence"]],
    ["filler", DashedSentence, ["s", "Foo bar blah blah blah"]]
*/
];
