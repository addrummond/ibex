var shuffleSequence = seq("intro", "info", sepWith("sep", seq("practice", rshuffle("f", rshuffle("s1", "s2")))), "break", sepWith("sep", rshuffle("q1", "q2", "qf")));
var practiceItemTypes = ["practice"];

var ds = "DashedSentence";
var q = "AcceptabilityJudgment";

var defaults = [
    "Separator", { transfer: 1000,
                   normalMessage: "Please wait for the next sentence.",
                   errorMessage: "Wrong. Please wait for the next sentence." },
    "DashedSentence", { mode: "self-paced reading" },
    "AcceptabilityJudgment", { as: ["1", "2", "3", "4", "5", "6", "7"],
                               presentAsScale: true,
                               instructions: "Use number keys or click boxes to answer.",
                               leftComment: "(Bad)", rightComment: "(Good)" },
    "Question", { hasCorrect: true },
    "Message", { hideProgressBar: true },
    "Form", { hideProgressBar: true }
];

var items = [

["sep", "Separator", { }],

["intro", "Message", {consentRequired: true,
                      html: { include: "example_intro.html" } } ],

["info", "Form", {
                     html: { include: "example_info.html" },
                     validators: {
                         age: function (s) { if (s.match(/^\d+$/)) return true; else return "Bad value for \u2018age\u2019"; }
                     }
                 } ],

["break", "Message", {transfer: 10000,
                      html: { include: "example_transfer.html" } } ],

["practice", ds, {s: "This is a practice sentence to get you used to reading sentences like this."}],
["practice", ds, {s: "This is another practice sentence with a practice question following it."},
             "Question", {hasCorrect: false, randomOrder: false,
                          q: "How would you like to answer this question?",
                          as: ["Press 1 or click here for this answer.",
                               "Press 2 or click here for this answer.",
                               "Press 3 or click here for this answer."]}],
["practice", ds, {s: "This is the last practice sentence before the experiment begins."}],

[["s1",1], ds, {s: "The journalist interviewed an actress who he knew to be shy of publicity after meeting on a previous occasion."},
           "Question", {q: "The actress was:", as: ["shy", "publicity-seeking", "impatient"]}],
[["s2",1], ds, {s: "The journalist interviewed an actress who after meeting on a previous occasion he knew to be shy of publicity."},
           "Question", {q: "The actress was:", as: ["shy", "publicity-seeking", "impatient"]}],
[["q1",[100,1]], q, {s: "Which actress did the journalist interview after meeting her PA on a previous occasion?"}],
[["q2",[100,1]], q, {s: "Which actress did the journalist interview her husband after meeting on a previous occasion?"}],

[["s1",2], ds, {s: "The teacher helped struggling students who he encouraged to succeed without treating like idiots."},
           "Question", {q: "What did the teacher do?", as: ["Encourage struggling students to succeed",
                                                          "Encourage his best students to succeed",
                                                          "Treat struffling students like idiots"]}],
[["s2",2], ds, {s: "The teacher helped struggling students who without treating like idiots he encouraged to succeed."},
           "Question", {q: "What did the teacher do?", as: ["Encourage struggling students to succeed",
                                                          "Encourage his best students to succeed",
                                                          "Treat struggling students like idiots"]}],
[["q1",[200,2]], q, {s: "Which struggling students did the teacher encourage to succeed without treating their friends like idiots?"}],
[["q2",[200,2]], q, {s: "Which struggling students did the teacher encourage their friends to succeed without treating like idiots?"}],

[["s1",3], ds, {s: "The geologist photographed a fossil which he found to be older than expected after submitting for analysis."},
           "Question", {q: "What was older than expected?", as: ["A fossil", "A photograph", "A pot"]}],
[["s2",3], ds, {s: "The geologist photographed a fossil which after submitting for analysis he found to be older than expected."},
           "Question", {q: "What was older than expected?", as: ["A fossil", "A photograph", "A pot"]}],
[["q1",[300,3]], q, {s: "Which fossil did the geologist discover its age after photographing?"}],
[["q2",[300,3]], q, {s: "Which fossil did the geologist discover after photographing its surroundings?"}],

[["s1",4], ds, {s: "The President proposed secret plans which the generals agreed to fast-track for implementation without divulging to Congress."},
           "Question", {q: "Who agreed to fast-track the plans?", as: ["The generals", "The president", "Congress"]}],
[["s2",4], ds, {s: "The President proposed secret plans which without divulging to Congress the generals agreed to fast-track for implementation."},
           "Question", {q: "Who agreed to fast-track the plans?", as: ["The generals", "The president", "Congress"]}],
[["q1",[400,4]], q, {s: "Which secret plans did the President propose without divulging their contents to Congress?"}],
[["q2",[400,4]], q, {s: "Which secret plans did the President propose a spending bill without divulging?"}],

[["s1",5], ds, {s: "Airport officials searched some men who they allowed to get on the plane despite thinking rather suspicious."},
           "Question", {q: "The men were:", as: ["Searched but allowed to get on the plane",
                                                 "Not searched",
                                                 "Searched and prevented from boarding"]}],
[["s2",5], ds, {s: "Airport officials searched some men who despite thinking rather suspicious they allowed to get on the plane."},
           "Question", {q: "The men were:", as: ["Searched but allowed to get on the plane",
                                                 "Not searched",
                                                 "Searched and prevented from boarding"]}],
[["q1",[500,5]], q, {s: "Which men did airport officials allow to get on the plane despite thinking their demenour rather suspicious?"}],
[["q2",[500,5]], q, {s: "Which men did airport officials allow their bags to go on the plane despite thinking rather suspicious?"}],

[["s1",6], ds, {s: "The carpenter made a chair which designers thought to be really rather trendy after painting turquoise."},
            "Question", {q: "Who thought that the chair was trendy?",
                       as: ["Some designers", "The carpenter", "A magazine"]}],
[["s2",6], ds, {s: "The carpenter made a chair which after painting turquoise designers thought to be really rather trendy."},
           "Question", {q: "Who thought that the chair was trendy?",
                      as: ["Some designers", "The carpenter", "A magazine"]}],
[["q1",[600,6]], q, {s: "Which chair did designers think to be really rather trendy after painting its legs turquoise?"}],
[["q2",[600,6]], q, {s: "Which chair did designers think its appearence to be really rather trendy after painting turquoise?"}],

[["s1",7], ds, {s: "The official inspected a consignment which he barred from entering the country after deeming to be a threat."},
           "Question", {q: "What did the official inspect?",
                        as: ["A consignment entering the country",
                             "A consignment leaving the country",
                             "A man entering the country"]}],
[["s2",7], ds, {s: "The official inspected a consignment which after deeming to be a threat he barred from entering the country."},
           "Question", {q: "What did the official inspect?",
                        as: ["A consignment entering the country",
                             "A consignment leaving the country",
                             "A man entering the country"]}],
[["q1",[700,7]], q, {s: "Which consignment did the official bar from entering the country after deeming its owner to be a threat?"}],
[["q1",[700,7]], q, {s: "Which consignment did the official bar its owner from entering the country after deeming to be a threat?"}],

/*[["s1",8], ds, {s: "The baker followed a recipe which he expected to be a great success after reading in a magazine."}],
[["s2",8], ds, {s: "The baker followed a recipe which after reading in a magazine he expected to be a great success."}],
[["q1",[800,8]], q, {s: "Which recipie did the baker expect to be a great success after reading its X in a magazine."}],
[["q2",[800,8]], q, {s: "Which recipie did the baker expect its author to be a great success after reading in a magazine."}]*/

// 21 fillers (3 for each real sentence).
["f", ds, {s: "The foreign spy that encoded the top-secret messages was given a new mission that required going to Japan."},
      "Question", {q: "The spy's mission required him to:", as: ["Go to Japan", "Destroy top-secret messages", "Bug a hotel room"]}],
["f", ds, {s: "The receptionist that the real estate company just hired immediately familiarized herself with all the phone numbers of their clients."},
      "Question", {q: "The receptionist familiarized herself with:",
                   as: ["Some phone numbers",
                        "The health and safety regulations",
                        "Her boss"]}],
["f", ds, {s: "Only two specialized surgeons that work in the hospital could do this operation."},
      "Question", {q: "The operation can be performed by:",
                   as: ["Two surgeons with specialist training",
                        "All the surgeons at the hospital",
                        "Three surgeons who are currently off sick"]}],
["f", ds, {s: "The gangsters that the local police officers tracked for years were represented by an inexperienced lawyer."},
      "Question", {q: "Who did the inexperienced lawyer represent?",
                   as: ["Some gangsters", "Some local police officers", "A murder suspect"]}],
["f", ds, {s: "The woman that John had seen in the subway bought herself a pair of stunning shoes that cost a fortune."},
      "Question", {q: "Where did John see the woman?", as: ["In the subway", "On the bus", "In the shoe shop"]}],
["f", ds, {s: "If the award-winning chef had entered this competition, he surely would have won first prize."},
      "Question", {q: "Why didn't the chef win the competition?",
                   as: ["Because he didn't enter it",
                        "Because his food wasn't good enough.",
                        "Because he was kicked out for cheating."]}],
["f", ds, {s: "If the organized secretary had filed the documents when she first received them, they would have been easy to find."},
      "Question", {q: "Why were the documents difficult to find?",
                   as: ["Because the secretary hadn't filed them properly",
                        "Because a manager at the company had lost them",
                        "Because they had been stolen."]}],
["f", ds, {s: "If the homemade beer had been left to ferment more, it would have been drinkable."},
      "Question", {q: "Why wasn't the homemade beer drinkable?",
                   as: ["It hadn't been left to ferment long enough",
                        "It had been left to ferment too long",
                        "The ingredients had been measured incorrectly."]}],
["f", ds, {s: "The cowboy that the bulls tried to trample injured himself getting off a horse."}],
["f", ds, {s: "The patient that was admitted to the hospital last month still suffers severe pain in his left leg."},
      "Question", {q: "Which of the following is true?",
                   as: ["The patient still has severe pain in his left leg",
                        "The patient still has severe pain in his right leg",
                        "The patient no longer suffers from pain in his left leg"]}],
["f", ds, {s: "Very few economists that work in downtown DC will be traveling to Russia this year."}],
["f", ds, {s: "The warm weather that everyone had been waiting patiently for melted the frost on the fields in two weeks."}],
["f", ds, {s: "The basketball player that had just signed a million dollar contract bounced the new ball with great skill."}],
["f", ds, {s: "The girls that rode the elephants at the beginning of the parade were from Africa."}],
["f", ds, {s: "If the spoiled toddler had stopped shouting when the baby sitter asked, he would have gotten a piece of candy."},
      "Question", {q: "Why didn't the toddler get any candy?",
                   as: ["Because he wouldn't stop shouting",
                        "Because the baby sitter was mean",
                        "Because the baby sitter didn't have any candy"]}],
["f", ds, {s: "The brave detective that had just been put on a new case searched for the dangerous criminals at the docks."}],
["f", ds, {s: "If the careful scientist had tested his data one more time, he would have found that his results were wrong all along."}],
["f", ds, {s: "The cattle that destroyed the farmer's field have eaten all his food as well."}],
["f", ds, {s: "If the amateur marathon runners had practiced more, they would have finished in the top fifty in this year's marathon."}],
["f", ds, {s: "If the tough boxer had gotten punched in the face one more time, he would have gotten a concussion."},
      "Question", {q: "Was the boxer concussed?",
                   as: ["Yes", "No"],
                   hasCorrect: "Yes",
                   randomOrder: false}],
["f", ds, {s: "The engineer that designed the new and innovative rocket has bought himself a fancy new desk."}],

// Need 21 of these.
["qf", q, {s: "What alcoholic beverage can you drink profusely and still stay sober?"}],
["qf", q, {s: "Who did President Bush meet Vladimir Putin and?"}],
["qf", q, {s: "The director of the research program ask for his colleagues to make a report on their progress."}]

];
