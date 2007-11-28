//
// Set configuration variables.
//

// Variables relating to server configuration.
var conf_serverURI = "/server.py";

// Variables common to all experiments.
var conf_experimentType = "self-paced reading";
var conf_instructionsHTML = "<p>[Define the &lsquo;instructionsHTML&rsquo; variable in your data file.]</p>\
<p>Press any key to start the experiment.</p>";
var conf_completionMessage = "The resultts were successfully sent to the server. Thanks!";
var conf_completionErrorMessage = "There was an error sending the results to the server.";
var conf_practiceSentenceType = 0;
var conf_shuffleSequence = seq(equalTo0, rshuffle(lessThan0, greaterThan0));
var conf_pageTitle = "Experiment";
var conf_showProgressBar = true;
var conf_answerInstructions = "Click links or use keys to answer.";

// The following variable applies to self-paced reading tasks only.
var conf_flagWrongAnswers = true;

// The following variables apply to speeded acceptability judgement
// tasks only.
var conf_wordTime = 300;
var conf_wordPauseTime = 100;
var conf_acceptabilityRatingsPreamble = "How would you rate this sentence?";
var conf_acceptabilityRatings = [["Good", "f"], ["Bad", "j"]];
var conf_judgmentTimeFrame = 3;
var conf_showCounter = false;
var conf_practiceJudgmentTimeFrame; // Set later.

if (typeof(serverURI) != "undefined")
    conf_serverURI = serverURI;

if (typeof(experimentType) != "undefined")
    conf_experimentType = experimentType;
if (typeof(instructionsHTML) != "undefined")
    conf_instructionsHTML = instructionsHTML
if (typeof(completionMessage) != "undefined")
    conf_completionMessage = completionMessage;
if (typeof(completionErrorMessage) != "undefined")
    conf_completionErrorMessage = completionErrorMessage;
if (typeof(practiceSentenceType) != "undefined")
    conf_practiceSentenceType = practiceSentenceType;
if (typeof(shuffleSequence) != "undefined")
    conf_shuffleSequence = shuffleSequence;
if (typeof(pageTitle) != "undefined")
    conf_pageTitle = pageTitle;
if (typeof(answerInstructions) != "undefined")
    conf_answerInstructions = answerInstructions;
if (typeof(showProgressBar) != "undefined")
    conf_showProgressBar = showProgressBar;

if (conf_experimentType == "self-paced reading") {
    if (typeof(flagWrongAnswers) != "undefined")
        conf_flagWrongAnswers = flagWrongAnswers;
}

if (conf_experimentType == "speeded acceptability") {
    if (typeof(wordTime) != "undefined")
        conf_wordTime = wordTime;
    if (typeof(wordPauseTime) != "undefined")
        conf_wordPauseTime = wordPauseTime;
    if (typeof(acceptabilityRatingsPreamble) != "undefined")
        conf_acceptabilityRatingsPreamble = acceptabilityRatingsPreamble;
    if (typeof(acceptabilityRatings) != "undefined")
        conf_acceptabilityRatings = acceptabilityRatings;
    if (typeof(judgmentTimeFrame) != "undefined")
        conf_judgmentTimeFrame = judgmentTimeFrame;
    if (typeof(practiceJudgmentTimeFrame) != "undefined")
        conf_practiceJudgmentTimeFrame = practiceJudgmentTimeFrame;
    else
        conf_practiceJudgmentTimeFrame = conf_judgmentTimeFrame;
    if (typeof(showCounter) != "undefined")
        conf_showCounter = showCounter;
}

//
// Checks.
//
if (conf_experimentType == "speeded acceptability") {
if ((conf_judgmentTimeFrame && (! conf_practiceJudgmentTimeFrame)) ||
    (conf_practiceJudgmentTimeFrame && (! conf_judgmentTimeFrame))) {
    alert("ERROR: If one of 'judgmentTimeFrame' or 'practiceJudgmentTimeFrame' is 0/null, the other must be too.");
    var foo = 1/0;
}
}

if (conf_experimentType != "speeded acceptability" && conf_experimentType != "self-paced reading") {
    alert("ERROR: Bad experiment type");
    var foo = 1/0;
}