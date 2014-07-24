var shuffleSequence = seq("intro", sepWith("sep", seq("practice", rshuffle("s1", "s2"))), sepWith("sep", rshuffle("q1", "q2")));
var practiceItemTypes = ["practice"];

var defaults = [
    "Separator", {
        transfer: 1000,
        normalMessage: "Please wait for the next sentence.",
        errorMessage: "Wrong. Please wait for the next sentence."
    },
    "DashedSentence", {
        mode: "self-paced reading"
    },
    "AcceptabilityJudgment", {
        as: ["1", "2", "3", "4", "5", "6", "7"],
        presentAsScale: true,
        instructions: "Use number keys or click boxes to answer.",
        leftComment: "(Bad)", rightComment: "(Good)"
    },
    "Question", {
        hasCorrect: true
    },
    "Message", {
        hideProgressBar: true
    },
    "Form", {
        hideProgressBar: true,
        continueOnReturn: true,
        saveReactionTime: true
    }
];

var items = [

    // New in Ibex 0.3-beta-9. You can now add a '__SendResults__' controller in your shuffle
    // sequence to send results before the experiment has finished. This is NOT intended to allow
    // for incremental sending of results -- you should send results exactly once per experiment.
    // However, it does permit additional messages to be displayed to participants once the
    // experiment itself is over. If you are manually inserting a '__SendResults__' controller into
    // the shuffle sequence, you must set the 'manualSendResults' configuration variable to 'true', since
    // otherwise, results are automatically sent at the end of the experiment.
    //
    //["sr", "__SendResults__", { }],

    ["sep", "Separator", { }],

    // New in Ibex 0.3-beta19. You can now determine the point in the experiment at which the counter
    // for latin square designs will be updated. (Previously, this was always updated upon completion
    // of the experiment.) To do this, insert the special '__SetCounter__' controller at the desired
    // point in your running order. If given no options, the counter is incremented by one. If given
    // an 'inc' option, the counter is incremented by the specified amount. If given a 'set' option,
    // the counter is set to the given number. (E.g., { set: 100 }, { inc: -1 })
    //
    //["setcounter", "__SetCounter__", { }],

    // NOTE: You could also use the 'Message' controller for the experiment intro (this provides a simple
    // consent checkbox).

    ["intro", "Form", {
        html: { include: "example_intro.html" },
        validators: {
            age: function (s) { if (s.match(/^\d+$/)) return true; else return "Bad value for \u2018age\u2019"; }
        }
    } ],

    //
    // Three practice items for self-paced reading (one with a comprehension question).
    //
    ["practice", "DashedSentence", {s: "This is a practice sentence to get you used to reading sentences like this."}],
    ["practice", "DashedSentence", {s: "This is another practice sentence with a practice question following it."},
                 "Question", {hasCorrect: false, randomOrder: false,
                              q: "How would you like to answer this question?",
                              as: ["Press 1 or click here for this answer.",
                                   "Press 2 or click here for this answer.",
                                   "Press 3 or click here for this answer."]}],
    ["practice", "DashedSentence", {s: "This is the last practice sentence before the experiment begins."}],

    //
    // Two "real" (i.e. non-filler) self-paced reading items with corresponding acceptability judgment items.
    // There are two conditions.
    //

    [["s1",1], "DashedSentence", {s: "The journalist interviewed an actress who he knew to be shy of publicity after meeting on a previous occasion."},
               "Question",       {q: "The actress was:", as: ["shy", "publicity-seeking", "impatient"]}],
    [["s2",1], "DashedSentence", {s: "The journalist interviewed an actress who after meeting on a previous occasion he knew to be shy of publicity."},
               "Question",       {q: "The actress was:", as: ["shy", "publicity-seeking", "impatient"]}],

    // The first question will be chosen if the first sentence from the previous two items is chosen;
    // the second question will be chosen if the second sentence from the previous pair of items is chosen.
    [["q1",[100,1]], "AcceptabilityJudgment", {s: "Which actress did the journalist interview after meeting her PA on a previous occasion?"}],
    [["q2",[100,1]], "AcceptabilityJudgment", {s: "Which actress did the journalist interview her husband after meeting on a previous occasion?"}],

    [["s1",2], "DashedSentence", {s: "The teacher helped struggling students who he encouraged to succeed without treating like idiots."},
               "Question",       {q: "What did the teacher do?",
                                  as: ["Encourage struggling students to succeed",
                                       "Encourage his best students to succeed",
                                       "Treat struffling students like idiots"]}],
    [["s2",2], "DashedSentence", {s: "The teacher helped struggling students who without treating like idiots he encouraged to succeed."},
               "Question",       {q: "What did the teacher do?", as: ["Encourage struggling students to succeed",
                                                                      "Encourage his best students to succeed",
                                                                      "Treat struggling students like idiots"]}],

    [["q1",[200,2]], "AcceptabilityJudgment", {s: {html: "<b>Which struggling students</b> did the teacher encourage to succeed without treating their friends like idiots?"}}],
    [["q2",[200,2]], "AcceptabilityJudgment", {s: {html: "<b>Which struggling students</b> did the teacher encourage their friends to succeed without treating like idiots?"}}],

    //
    // 10 self-paced-reading filler sentences.
    //

    ["f", "DashedSentence", {s: "The foreign spy that encoded the top-secret messages was given a new mission that required going to Japan."},
          "Question",       {q: "The spy's mission required him to:", as: ["Go to Japan", "Destroy top-secret messages", "Bug a hotel room"]}],

    ["f", "DashedSentence", {s: "The receptionist that the real estate company just hired immediately familiarized herself with all the phone numbers of their clients."},
          "Question",       {q: "The receptionist familiarized herself with:",
                             as: ["Some phone numbers",
                                  "The health and safety regulations",
                                  "Her boss"]}],

    ["f", "DashedSentence", {s: "Only two specialized surgeons that work in the hospital could do this operation."},
          "Question",       {q: "The operation can be performed by:",
                             as: ["Two surgeons with specialist training",
                                  "All the surgeons at the hospital",
                                  "Three surgeons who are currently off sick"]}],

    ["f", "DashedSentence", {s: "The gangsters that the local police officers tracked for years were represented by an inexperienced lawyer."},
          "Question",       {q: "Who did the inexperienced lawyer represent?",
                             as: ["Some gangsters", "Some local police officers", "A murder suspect"]}],

    ["f", "DashedSentence", {s: "The woman that John had seen in the subway bought herself a pair of stunning shoes that cost a fortune."},
          "Question",       {q: "Where did John see the woman?", as: ["In the subway", "On the bus", "In the shoe shop"]}],

    ["f", "DashedSentence", {s: "If the award-winning chef had entered this competition, he surely would have won first prize."},
          "Question",       {q: "Why didn't the chef win the competition?",
                             as: ["Because he didn't enter it",
                                  "Because his food wasn't good enough.",
                                  "Because he was kicked out for cheating."]}],

    ["f", "DashedSentence", {s: "If the organized secretary had filed the documents when she first received them, they would have been easy to find."},
          "Question",       {q: "Why were the documents difficult to find?",
                             as: ["Because the secretary hadn't filed them properly",
                                  "Because a manager at the company had lost them",
                                  "Because they had been stolen."]}],

    ["f", "DashedSentence", {s: "If the homemade beer had been left to ferment more, it would have been drinkable."},
          "Question",       {q: "Why wasn't the homemade beer drinkable?",
                             as: ["It hadn't been left to ferment long enough",
                                  "It had been left to ferment too long",
                                  "The ingredients had been measured incorrectly."]}],

    ["f", "DashedSentence", {s: "The cowboy that the bulls tried to trample injured himself getting off a horse."}],

    ["f", "DashedSentence", {s: "The patient that was admitted to the hospital last month still suffers severe pain in his left leg."},
          "Question",       {q: "Which of the following is true?",
                             as: ["The patient still has severe pain in his left leg",
                                  "The patient still has severe pain in his right leg",
                                  "The patient no longer suffers from pain in his left leg"]}]
];
