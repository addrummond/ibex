//
// Set configuration variables.
//

// Variables common to all experiments.
var conf_completionMessage = "The results were successfully sent to the server. Thanks!";
var conf_completionErrorMessage = "There was an error sending the results to the server.";
var conf_pageTitle = "Experiment";
var conf_shuffleSequence = seq(equalTo0, rshuffle(lessThan0, greaterThan0));
var conf_showProgressBar = true;
var conf_practiceItems = [];
var conf_practiceMessage = "Practice";

if (typeof(serverURI) != "undefined")
    conf_serverURI = serverURI;
if (typeof(completionMessage) != "undefined")
    conf_completionMessage = completionMessage;
if (typeof(completionErrorMessage) != "undefined")
    conf_completionErrorMessage = completionErrorMessage;
if (typeof(pageTitle) != "undefined")
    conf_pageTitle = pageTitle;
if (typeof(shuffleSequence) != "undefined")
    conf_shuffleSequence = shuffleSequence;
if (typeof(showProgressBar) != "undefined")
    conf_showProgressBar = showProgressBar;
if (typeof(practiceItems) != "undefined")
    conf_practiceItems = practiceItems;
if (typeof(practiceMessage) != "undefined")
    conf_practiceMessage = practiceMessage;