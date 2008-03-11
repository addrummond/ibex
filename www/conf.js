/* This software is licensed under a BSD license; see the LICENSE file for details. */

//
// Set configuration variables.
//

// Variables common to all experiments.
var conf_completionMessage = "The results were successfully sent to the server. Thanks!";
var conf_completionErrorMessage = "There was an error sending the results to the server.";
var conf_pageTitle = "Experiment";
var conf_shuffleSequence = seq(equalTo0, rshuffle(lessThan0, greaterThan0));
var conf_showProgressBar = true;
var conf_practiceItemTypes = [];
var conf_practiceMessage = "Practice";
var conf_showOverview = false;

if (! (serverURI === undefined))
    conf_serverURI = serverURI;
if (! (completionMessage === undefined))
    conf_completionMessage = completionMessage;
if (! (completionErrorMessage === undefined))
    conf_completionErrorMessage = completionErrorMessage;
if (! (pageTitle === undefined))
    conf_pageTitle = pageTitle;
if (! (shuffleSequence === undefined))
    conf_shuffleSequence = shuffleSequence;
if (! (showProgressBar === undefined)
    conf_showProgressBar = showProgressBar;
if (! (practiceItemTypes === undefined))
    conf_practiceItemTypes = practiceItemTypes;
if (! (practiceMessage === undefined))
    conf_practiceMessage = practiceMessage;
if (! (showOverview === undefined))
    conf_showOverview = showOverview;

