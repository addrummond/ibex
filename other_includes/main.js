/* This software is licensed under a BSD license; see the LICENSE file for details. */

// Check that the object namespace hasn't been polluted by monkey patching (we
// use objects as hashtables without conscience).
for (var _ in { }) {
    assert(false, "ERROR: The JavaScript object namespace has been polluted (perhaps by a library such as prototype.js?.");
}

var serverURI = "server.py";

var body = document.getElementsByTagName("body")[0];
var inner = document.createElement("div");
if (conf_centerItems && (! conf_showOverview)) {
    inner.className = "centered-inner";
}
else {
    inner.className = "non-centered-inner";
}
body.appendChild(inner);

var counter = parseInt(readCookie("counter"));
var randomCounter = false;
if (isNaN(counter)) {
    counter = Math.floor(Math.random() * 10000);
    randomCounter = true;
}

var sendingResults = document.createElement("p");
sendingResults.className = "sending-results";
var spinSpan = document.createElement("div");
spinSpan.appendChild(document.createTextNode(""));
spinSpan.style.width = "1.5em";
spinSpan.style.cssFloat = "left";
spinSpan.style.styleFloat = "left";
sendingResults.appendChild(spinSpan);
var sendingResultsMessage = document.createElement("div");
sendingResultsMessage.appendChild(document.createTextNode(" Sending results to server..."));
sendingResults.appendChild(sendingResultsMessage);

// Convert the "defaults" variable to a list of [item, hashtable] pairs.
var ht_defaults = [];
if (typeof(defaults) != "undefined") {
    assert_is_arraylike(defaults, "'defaults' variable must be set to an Array.");
    assert(defaults.length % 2 == 0, "'defaults' Array must have an even number of elements.");
    
    for (var i = 0; i < defaults.length; i += 2) {
        assert(typeof(defaults[i]) == "function", "Odd members of the 'defaults' array must be object constructor functions.");
        assert_is_dict(defaults[i + 1], "Even members of the 'defaults' array must be dictionaries.");

        ht_defaults.push([defaults[i], defaults[i + 1]]);
    }
}

// We don't have object-keyed hashtables at our disposal, so
// here's a utility function for traversing the ht_defaults alist.
function get_defaults_for(obj) {
    for (var i = 0; i < ht_defaults.length; ++i) {
        if (ht_defaults[i][0] == obj) {
            // Copy the dictionary (had a nasty bug from not doing this...).
            return copy_dict(ht_defaults[i][1]);
        }
    }
    return {}
}

function Item(itemNumber, elementNumber, controller, options) {
    this.itemNumber = itemNumber;
    this.elementNumber = elementNumber;
    this.controller = controller;
    this.options = options;
}

// Now create our initial list of item sets (lists of Items), merging in default options.
assert(typeof(items) != "undefined", "You must define the 'items' variable.");
assert_is_arraylike(items, "The 'items' variable must be set to an Array.");
var listOfItemSets = [];
var itemNumber = 0;
iter(items, function(it) {
    assert_is_arraylike(it, "Every element in the 'items' Array must be an Array.");

    assert(((it.length - 1) % 2) == 0, "Following the item/group specifier, each element of the 'items' array must contain an even number of elements.")
    var typeAndGroup = it[0];
    var currentItemSet = [];
    for (var setIndex = 1, elementNumber = 0; setIndex < it.length; setIndex += 2, ++elementNumber) {
        var controller = it[setIndex];
        var options = it[setIndex + 1];

        var type;
        var group = null;
        assert(typeof(typeAndGroup) == "object" || typeof(typeAndGroup) == "number" || typeof(typeAndGroup) == "string",
               "Type and group specifier must be an Array, number or string");
        if (typeof(typeAndGroup) == "object") {
            assert(typeAndGroup.length == 2, "Type and group specifier must have two elements");
            type = typeAndGroup[0];
            group = typeAndGroup[1];
        }
        else {
            type = typeAndGroup;
        }
        
        var opts = get_defaults_for(controller);
        opts = merge_dicts(opts, options);

        // Check that all obligatory options have been specified.
        if (controller.obligatory) {
            assert_is_arraylike(controller.obligatory, "The 'obligatory' field must be an Array of strings.");
            iter(controller.obligatory, function(o) {
                assert(typeof(o) == "string", "All members of the 'obligatory' Array must be strings.");
                assert(opts[o] != undefined, "The obligatory option '" + o + "' was not specified for " + controller.name);
            });
        }

        currentItemSet.push(new Item(itemNumber, elementNumber, controller, opts));
    }
    currentItemSet.type = type;
    currentItemSet.group = group;
    listOfItemSets.push(currentItemSet); 

    ++itemNumber;
 });

var mungGroupsExtras = { };
var runningOrder = runShuffleSequence(mungGroups(listOfItemSets, counter, mungGroupsExtras), conf_shuffleSequence);
assert(runningOrder.length > 0 && runningOrder[0].length > 0,
       "There must be some items in the running order!");

//conf_showOverview = true;
if (conf_showOverview) {
    var l = document.createElement("ol");
    for (var i = 0; i < runningOrder.length; ++i) {
        var sl = document.createElement("ol");
        for (var j = 0; j < runningOrder[i].length; ++j) {
            var li = document.createElement("li");
            var b = document.createElement("b");
            b.appendChild(document.createTextNode(runningOrder[i][j].controller.name));
            li.appendChild(b);
            var hd = runningOrder[i][j].controller.htmlDescription ? runningOrder[i][j].controller.htmlDescription(runningOrder[i][j].options) : null;
            if (hd) {
                li.appendChild(document.createTextNode(": "));
                li.appendChild(hd);
            }
            sl.appendChild(li);
        }
        var li = document.createElement("li");
        li.appendChild(sl);
        l.appendChild(li);
    }
    inner.appendChild(l);
}
else {

function Utils(valuesFromPreviousElement) {
    this.timeoutIds = [];

    this.setTimeout = function(func, time) {
        var id = setTimeout(func, time);
        this.timeoutIds.push(id);
        return id;
    }

    this.clearTimeout = function(id) {
        // Check that this is an id from a timeout set with the
        // setTimeout method of this object.
        // COMMENTING THIS CHECK OUT FOR PERFORMANCE REASONS.
        /*var foundIt = false;
        for (i = 0; i < this.timeoutIds; ++i) {
            if (this.timeoutIds[i] == id) {
                foundIt = this.timeoutIds[i];
                break;
            }
        }
        if (foundIt == null)
            assert(false, "Attempt to clear timer that wasn't set propetly");
        */

        clearTimeout(id);

        var newArray = [];
        for (var j = 0; j < this.timeoutIds.length; ++j) {
            if (this.timeoutIds[j] != id)
                newArray.push(this.timeoutIds[j]);
        }
        this.timeoutIds = newArray;
    }

    this.gc = function() {
        for (var i = 0; i < this.timeoutIds.length; ++i) {
            clearTimeout(this.timeoutIds[i]);
        }
    }

    this.valuesForNextElement = {};

    this.setValueForNextElement = function(key, value) {
        assert(typeof(key) == "string", "First argument to 'setValueForNextElement' must be a string");
        this.valuesForNextElement[key] = value;
    }

    this.getValueFromPreviousElement = function(key) {
        return valuesFromPreviousElement[key];
    }

    this.getValuesFromPreviousElement = function() {
        return copy_dict(valuesFromPreviousElement);
    }
}

var practiceBox;
if (conf_practiceItemTypes && conf_practiceItemTypes.length > 0) {
    practiceBox = document.createElement("p");
    practiceBox.className = "practice-box";
    practiceBox.appendChild(document.createTextNode(""));
    inner.appendChild(practiceBox);
}

var mainDiv = document.createElement("div");
mainDiv.style.clear = "both";
inner.appendChild(mainDiv);

var progressBarHeight;
var progressBarMaxWidth;
var currentProgressBarWidth = 0.0;
var showProgress;
var barContainer;
var nPoints = 0;
if (conf_showProgressBar) {
    for (var i = 0; i < runningOrder.length; ++i) {
        for (var j = 0; j < runningOrder[i].length; ++j) {
            if (runningOrder[i][j].controller.countsForProgressBar === undefined ||
                runningOrder[i][j].controller.countsForProgressBar) {
                ++nPoints;
            }
        }
    }

    progressBarHeight = "0.8em";
    progressBarMaxWidth = nPoints * 5 < 300 ? nPoints * 5 : 300;
    showProgress = document.createElement("div");
    showProgress.className = "lpad";
    showProgress.style.marginTop = "2em";
    barContainer = document.createElement("div");
    barContainer.className = conf_centerItems ? "centered-bar-container" : "non-centered-bar-container";
    barContainer.style.height = progressBarHeight;
    barContainer.style.width = progressBarMaxWidth;
    var bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = "0px";
    bar.style.height = progressBarHeight;
    barContainer.appendChild(bar);
    var p = document.createElement("p");
    p.className = conf_centerItems ? "centered-progress-text" : "non-centered-progress-text";
    p.appendChild(document.createTextNode("progress"));
    showProgress.appendChild(barContainer);
    showProgress.appendChild(p);
    body.insertBefore(showProgress, body.firstChild);
}
function updateProgressBar() {
    if (conf_showProgressBar) {
        currentProgressBarWidth += progressBarMaxWidth / nPoints;
        bar.style.width = Math.round(currentProgressBarWidth) + "px";
    }
}
function hideProgressBar() {
    if (conf_showProgressBar) {
        showProgress.style.visibility = "hidden";
    }
}
function showProgressBar() {
    if (conf_showProgressBar) {
        showProgress.style.visibility = "visible";
    }
}

var posInRunningOrder = 0;
var posInCurrentItemSet = 0;
var currentUtilsInstance = null;
var currentControllerInstance = null;
// A list of result lines.
var allResults = [];
// Array for column names.
var columnNamesArray = ["Controller name", "Item number", "Element number", "Type", "Group"];

function getColumnNameIndex(name) {
    for (var i = 0; i < columnNamesArray.length; ++i) {
        if (columnNamesArray[i] == name)
            return i;
    }
    columnNamesArray.push(name);
    return columnNamesArray.length - 1;
}

function namesToIndices(results_line) {
    for (var i = 0; i < results_line.length; ++i) {
        assert(results_line[i].length == 2, "Internal error");
        results_line[i][0] = getColumnNameIndex(results_line[i][0]);
    }
    return results_line;
}

function finishedCallback(resultsLines) {
    var currentItem = runningOrder[posInRunningOrder][posInCurrentItemSet];

    if (resultsLines != null) {
        for (var i = 0; i < resultsLines.length; ++i) {
            var group = runningOrder[posInRunningOrder].group;
            if (group && group.length)
                group = group[0]
            var preamble = [ [0, currentItem.controller.name ? currentItem.controller.name : "UNKNOWN"],
                             [1, currentItem.itemNumber],
                             [2, currentItem.elementNumber],
                             [3, runningOrder[posInRunningOrder].type],
                             [4, group == null ? "NULL" : group ] ];
            namesToIndices(resultsLines[i]);
            for (var j = 0; j < resultsLines[i].length; ++j) {
                preamble.push(resultsLines[i][j]);
            }
            allResults.push(preamble);
        }
    }

    // Update progress bar if applicable.
    if (currentItem.controller.countsForProgressBar === undefined ||
        currentItem.controller.countsForProgressBar) {
        updateProgressBar();
    }

    ++posInCurrentItemSet;
    if (posInCurrentItemSet >= runningOrder[posInRunningOrder].length) {
        ++posInRunningOrder;
        if (posInRunningOrder >= runningOrder.length) {
            // We've finished the experiment.
            indicateThatResultsAreBeingSent();
            sendResults(allResults,
                        function() { indicateThatResultsWereSent(true); },
                        function() { indicateThatResultsWereSent(false); });
            return;
        }
        posInCurrentItemSet = 0;
    }

    currentItem = runningOrder[posInRunningOrder][posInCurrentItemSet];

    var pForItem;
    if (dget(currentControllerInstance.options, "displayMode", "overwrite") != "append") {
        var newMainDiv = document.createElement("div");
        inner.replaceChild(newMainDiv, mainDiv);
        mainDiv = newMainDiv;
        pForItem = document.createElement("p");
        mainDiv.appendChild(pForItem);
    }
    else {
        // Append the Item instead of overwriting the previous one.
        pForItem = document.createElement("p");
        mainDiv.appendChild(pForItem);
    }
    pForItem.style.clear = "both";

    // Is this a practice item?
    if (practiceBox) {
//        alert(currentItem.type + ":" + conf_practiceItemTypes);
        if (list_contains(runningOrder[posInRunningOrder].type, conf_practiceItemTypes)) {
//            alert("PB2");
            practiceBox.replaceChild(document.createTextNode(conf_practiceMessage), practiceBox.firstChild);
        }
        else {
            practiceBox.replaceChild(document.createTextNode(""), practiceBox.firstChild);
        }
    }

    currentUtilsInstance.gc();
    currentUtilsInstance = new Utils(currentUtilsInstance.valuesForNextElement);
    currentControllerInstance =
        new (currentItem.controller)
    (pForItem, currentItem.options, finishedCallback, currentUtilsInstance);

    // Should we show the progress bar with this item?
    if (currentControllerInstance.hideProgressBar)
        hideProgressBar();
    else
        showProgressBar();
}
currentUtilsInstance = new Utils({});
currentControllerInstance =
    new (runningOrder[0][0].controller)
        (mainDiv, runningOrder[0][0].options, finishedCallback, currentUtilsInstance);
// Should we show the progress bar with the first item?
if (currentControllerInstance.hideProgressBar)
    hideProgressBar();

document.onkeydown = function(e) {
    // Record the time ASAP.
    var time = new Date().getTime();

    // For IE.
    if (! e) {
        e = window.event;
    }

    if (currentControllerInstance.handleKey) {
        // Should return false if they keypress wasn't handled.
        return currentControllerInstance.handleKey(e.keyCode, time);
    }
}

function indicateThatResultsAreBeingSent()
{
    // Clear "practice" notice if it's still up.
    if (practiceBox)
        practiceBox.replaceChild(document.createTextNode(""), practiceBox.firstChild);

    inner.replaceChild(sendingResults, mainDiv);
    var spinChars = ["\u2013", "\\", "|", "/"]
    var spinCharsPos = 0
    function timerCallback()
    {
        // Stop the callback if spinSpan no longer has any children.
        if (spinSpan.childNodes.length == 0) { return; }

        spinSpan.replaceChild(document.createTextNode(spinChars[spinCharsPos]),
                              spinSpan.firstChild);
        ++spinCharsPos;
        if (spinCharsPos == spinChars.length) {
            spinCharsPos = 0;
        }
        setTimeout(timerCallback, 200);
    }
    timerCallback();
}

function indicateThatResultsWereSent(success)
{
    spinSpan.removeChild(spinSpan.firstChild); // This will cause the callback to stop.
    if (success) {
        sendingResultsMessage.replaceChild(
            document.createTextNode(conf_completionMessage),
            sendingResultsMessage.firstChild
        );
    }
    else {
        sendingResultsMessage.replaceChild(
            document.createTextNode(conf_completionErrorMessage),
            sendingResultsMessage.firstChild
        );
    }
}

// Make a post request to a given address. Address may either be a domain
// or an IP.
function sendResults(resultsLines, success, failure)
{
    var xmlhttp = getXMLHttpRequest();
    if (! xmlhttp) {
        failure();
    }

    // Prepare the post data.
    var data = JSON.stringify([randomCounter ? true : false, counter, columnNamesArray, resultsLines]);

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                // Great, we successfully sent the results to the server.
                success();
            }
            else {
                // There was an error sending the results to the server.
                failure();
            }
        }
    };
    xmlhttp.open("POST", serverURI, true);
    xmlhttp.send(data);
}

} // End of else for if (conf_showOverview).

