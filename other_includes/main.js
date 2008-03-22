/* This software is licensed under a BSD license; see the LICENSE file for details. */

// Check that the object namespace hasn't been polluted by monkey patching (we
// use objects as hashtables without conscience).
for (var _ in { }) {
    assert(false, "ERROR: The JavaScript object namespace has been polluted (perhaps by a library such as prototype.js?)");
}

var serverURI = "server.py";

var body = document.getElementsByTagName("body")[0];

var practiceBox;
var inner;
var mainTable; // Only set if conf_centerItems.

function createMainTable() {
    var newt = document.createElement("table");
    var tb = document.createElement("tbody");
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    newt.align = "center"; // IE sucks.
    newt.appendChild(tb);
    tb.appendChild(tr);
    tr.appendChild(td);
    inner = td;
    if (mainTable) {
        body.replaceChild(newt, mainTable);
    }
    else {
        body.appendChild(newt);
    }
    mainTable = newt;
}

function renewInner() {
    if ((! conf_centerItems) || conf_showOverview) {
        var newdiv = document.createElement("div");
        newdiv.className = "lindent";
        if (inner) {
            body.replaceChild(newdiv, inner);
        }
        else {
            body.appendChild(newdiv);
        }
        inner = newdiv;
    }
    else {
        // Have to recreate the entire table, or Firefox 2 will do weird
        // things.
        createMainTable();
    }
    inner.style.clear = "both";
    if ((! conf_showOverview) && conf_practiceItemTypes && conf_practiceItemTypes.length > 0) {
        practiceBox = jsHTML([["p", {"class": "practice-box"}], ""]);
        inner.appendChild(practiceBox);
    }
}

renewInner();

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

function setStateToSendingResults() {
    while (sendingResults.firstChild) { // Remove all children (if any).
        sendingResults.removeChild(sendingResults.firstChild);
    }
    sendingResults.appendChild(spinSpan);
    var sendingResultsMessage = document.createElement("div");
    sendingResultsMessage.appendChild(document.createTextNode(conf_sendingResultsMessage));
    sendingResults.appendChild(sendingResultsMessage);
}
__spinSpanShouldBeSpinning__ = false;
function setStateToResultsSentOrFailed(succeeded) {
    __spinSpanShouldBeSpinning__ = false;

    while (sendingResults.firstChild) { // Remove all children (if any).
        sendingResults.removeChild(sendingResults.firstChild);
    }
    sendingResults.appendChild(document.createTextNode((succeeded ? conf_completionMessage : conf_completionErrorMessage) + " "));
    if (! succeeded) {
        var a = document.createElement("a");
        a.href = "javascript:__retry__();";
        a.appendChild(document.createTextNode("Retry"));
        sendingResults.appendChild(a);
    }
}

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

var progressBarHeight;
var progressBarMaxWidth;
var currentProgressBarWidth = 0.0;
var showProgress;
var barContainer;
var bar;
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

    var names = { };
    var thingToPrependToBody;
    if (conf_centerItems) {
        thingToPrependToBody = jsHTMLWithNames(names,
            [["table", {align: "center"}],
              ["tbody",
                ["tr",
                  ["td:showProgress"]
            ]]]
        );
    }
    else  {
        thingToPrependToBody = jsHTMLWithNames(names,
            [["div:showProgress", {"margin-top": "2em", "class": "lindent"}]]
        );
    }
    showProgress = names.showProgress;

    barContainer = jsHTMLWithNames(names,
        [["div", {"class": "bar-container", "@style.height": progressBarHeight, "@style.width": progressBarMaxWidth}],
          [["div:bar", {"class": "bar", "@style.height": progressBarHeight, "@style.width": 0}]]]
    );
    bar = names.bar;
    var p = jsHTML([["p", {"class": "progress-text", "@style.textAlign": conf_centerItems ? "center" : "left"}],
                    "progress"]);

    showProgress.appendChild(barContainer);
    showProgress.appendChild(p);
    body.insertBefore(thingToPrependToBody, body.firstChild);
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
    assert(typeof(name) == "string", "Internal error: 'getColumnNameIndex(...)'");
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
        var tmp = getColumnNameIndex(results_line[i][0]);
        results_line[i][0] = tmp;
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
            document.onkeydown = null; // Stop listening for keypresses.
            __retry__ = function () {
                indicateThatResultsAreBeingSent();
                sendResults(allResults,
                            function() { setStateToResultsSentOrFailed(true); },
                            function() { setStateToResultsSentOrFailed(false); });
            }
            __retry__();
            return;
        }
        posInCurrentItemSet = 0;
    }

    currentItem = runningOrder[posInRunningOrder][posInCurrentItemSet];

    var pForItem;
    if (dget(currentControllerInstance.options, "displayMode", "overwrite") != "append") {
        renewInner();
    }
    pForItem = document.createElement("p");
    inner.appendChild(pForItem);
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
var pForItem = document.createElement("p");
inner.appendChild(pForItem);
currentUtilsInstance = new Utils({});
currentControllerInstance =
    new (runningOrder[0][0].controller)
        (pForItem, runningOrder[0][0].options, finishedCallback, currentUtilsInstance);
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

    setStateToSendingResults();
    if (inner.firstChild != sendingResults) {
        renewInner();
        //while (inner.firstChild)
        //    inner.removeChild(inner.firstChild);
        inner.appendChild(sendingResults, inner.firstChild);
    }

    var spinChars = ["\u2013", "\\", "|", "/"]
    var spinCharsPos = 0
    __spinSpanShouldBeSpinning__ = true;
    function timerCallback()
    {
        if (! __spinSpanShouldBeSpinning__) { return; }

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

