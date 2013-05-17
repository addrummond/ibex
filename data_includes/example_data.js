var shuffleSequence = seq(sepWith("sep", "q"));
//var practiceItemTypes = ["practice"];

var defaults = [
    "Separator", {
        transfer: 1000,
        normalMessage: "Please wait for the next sentence.",
        errorMessage: "Wrong. Please wait for the next sentence."
    },
    "AcceptabilityJudgment", {
        as: ["1", "2", "3", "4", "5", "6", "7"],
        presentAsScale: true,
        instructions: "Use number keys or click boxes to answer.",
        leftComment: "(Bad)", rightComment: "(Good)",
        audioMessage: {html: "<u>Click here to play audio</u>"},
        audioTrigger: "click"
    }
];

var items = [
    ["sep", "Separator", { }],
    ["q", "AcceptabilityJudgment", {s: {audio: "test1.mp3" } } ],
    ["q", "AcceptabilityJudgment", {s: {audio: "test2.mp3" } } ]
];
