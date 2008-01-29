//
// Set configuration variables.
//

// Variables relating to server configuration.
var conf_serverURI = "/server.py";

// Variables common to all experiments.
var conf_completionMessage = "The results were successfully sent to the server. Thanks!";
var conf_completionErrorMessage = "There was an error sending the results to the server.";
var conf_shuffleSequence = seq(equalTo0, rshuffle(lessThan0, greaterThan0));
var conf_pageTitle = "Experiment";

if (typeof(serverURI) != "undefined")
    conf_serverURI = serverURI;

if (typeof(completionMessage) != "undefined")
    conf_completionMessage = completionMessage;
if (typeof(completionErrorMessage) != "undefined")
    conf_completionErrorMessage = completionErrorMessage;
if (typeof(shuffleSequence) != "undefined")
    conf_shuffleSequence = shuffleSequence;
if (typeof(pageTitle) != "undefined")
    conf_pageTitle = pageTitle;
