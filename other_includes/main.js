/* This software is licensed under a BSD license; see the LICENSE file for details. */

// Check that the object namespace hasn't been polluted by monkey patching (we
// use objects as hashtables without conscience).
for (var _ in { }) {
    assert(false, "ERROR: The JavaScript object namespace has been polluted (perhaps by a library such as prototype.js?)");
}

$(document).ready(function () {

var serverURI = "server.py";

var practiceBox;
var inner;
var mainTable; // Only set if conf_centerItems.

function createMainTable() {
    // Note that this statement sets the 'inner' var.
    var newt =
        $(document.createElement("table"))
        .attr('align', 'center') // IE sucks.
        .append($(document.createElement("tr"))
                .append(inner = $(document.createElement("td"))));

    if (mainTable) {
        mainTable.replaceWith(newt);
    }
    else {
        $("body").append(newt);
    }
    mainTable = newt;
}

function renewInner() {
    if ((! conf_centerItems) || conf_showOverview) {
        var newdiv = $(document.createElement("div")).addClass("lindent");
        newdiv.className = "lindent";
        if (inner) {
            inner.replaceWith(newdiv);
        }
        else {
            $("body").append(newdiv);
        }
        inner = newdiv;
    }
    else {
        // Have to recreate the entire table, or Firefox 2 will do weird
        // things.
        createMainTable();
    }
    inner.css('clear', "both");
    if ((! conf_showOverview) && conf_practiceItemTypes && conf_practiceItemTypes.length > 0)
        inner.append(practiceBox = $(document.createElement("p")).addClass("practice-box"));
}

renewInner();

var counter = parseInt(readCookie("counter"));
var counter_override = parseInt(readCookie("counter_override"));
var randomCounter = false;
if (isNaN(counter) && (! counter_override)) {
    counter = Math.floor(Math.random() * 10000);
    randomCounter = true;
}
if (counter_override) {
    counter = parseInt(counter_override);
    // Remove the override cookie immediately.
    if (! conf_withsquareCounterStoreForWholeSession)
        createCookie("counter_override", "", -1);
}
// alert(counter)

// Convert the "defaults" variable to a list of [item, hashtable] pairs.
var ht_defaults = [];
if (typeof(defaults) != "undefined") {
    assert_is_arraylike(defaults, "'defaults' variable must be set to an Array.");
    assert(defaults.length % 2 == 0, "'defaults' Array must have an even number of elements.");
    
    for (var i = 0; i < defaults.length; i += 2) {
        assert(typeof(defaults[i]) == "string", "Odd members of the 'defaults' array must be strings naming controllers.");
        assert_is_dict(defaults[i + 1], "Even members of the 'defaults' array must be dictionaries.");

        ht_defaults.push([defaults[i], defaults[i + 1]]);
    }
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
$.each(items, function(_, it) {
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
        
        var opts = get_defaults_for(ht_defaults, controller);
        opts = merge_dicts(opts, options);

        // Check that all obligatory options have been specified.
        if (ibex_controller_get_property(controller, "obligatory")) {
            assert_is_arraylike(ibex_controller_get_property(controller, "obligatory"), "The 'obligatory' option field must be an Array of strings.");
            $.each(ibex_controller_get_property(controller, "obligatory"), function(_, o) {
                assert(typeof(o) == "string", "All members of the Array value of the 'obligatory' option must be strings.");
                assert(opts[o] != undefined, "The obligatory option '" + o + "' was not specified for the controller" + controller);
            });
        }

        currentItemSet.push(new Item(itemNumber, elementNumber, controller, opts));
    }
    currentItemSet.type = type;
    currentItemSet.group = group;
    listOfItemSets.push(currentItemSet); 

    ++itemNumber;
 });

var runningOrder = runShuffleSequence(mungGroups(listOfItemSets, counter), conf_shuffleSequence);
assert(runningOrder.length > 0 && runningOrder[0].length > 0,
       "There must be some items in the running order!");

if (conf_showOverview) {
    var l = $(document.createElement("ol"));
    for (var i = 0; i < runningOrder.length; ++i) {
        var sl = $(document.createElement("ol"));
        for (var j = 0; j < runningOrder[i].length; ++j) {
            var li = $(document.createElement("li"));
            var b = $(document.createElement("b"));
            li.append(b.append(runningOrder[i][j]));
            var hd = ibex_controller_get_property(runningOrder[i][j].controller, "htmlDescription") ?  ibex_controller_get_property(runningOrder[i][j].controller, "htmlDescription")(runningOrder[i][j].options) : null;

            if (hd) li.append(": ").append($(hd));
            sl.append(li);
        }
        l.append($(document.createElement("li")).append(sl));
    }
    inner.append(l);
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
            if (ibex_controller_get_property(runningOrder[i][j].controller, "countsForProgressBar") === undefined ||
                ibex_controller_get_property(runningOrder[i][j].controller, "countsForProgressBar")) {
                ++nPoints;
            }
        }
    }

    progressBarHeight = "0.8em";
    progressBarMaxWidth = nPoints * 5 < 300 ? nPoints * 5 : 300;

    var showProgress;
    var thingToPrependToBody;
    if (conf_centerItems) {
        thingToPrependToBody =
            $(document.createElement("table"))
            .attr('align', 'center')
            .append($(document.createElement("tr"))
                    .append(showProgress = $(document.createElement("td"))));
    }
    else  {
        thingToPrependToBody = showProgress =
            $(document.createElement("div")).css('margin-top', '2em').addClass("lindent");
    }

    var bar;
    barContainer =
        $(document.createElement("div"))
        .addClass("bar-container")
        .css('height', progressBarHeight)
        .css('width', progressBarMaxWidth)
        .append(bar = $(document.createElement("div"))
                .addClass("bar")
                .css('height', progressBarHeight)
                .css('width', 0));
    var p =
        $(document.createElement("p"))
        .addClass("progress-text")
        .css('text-align', conf_centerItems ? "center" : "left")
        .text('progress');

    showProgress.append(barContainer).append(p);
    $("body").prepend(thingToPrependToBody);
}
function updateProgressBar() {
    if (conf_showProgressBar) {
        currentProgressBarWidth += progressBarMaxWidth / nPoints;
        bar.css('width', Math.round(currentProgressBarWidth) + "px");
    }
}
function hideProgressBar() {
    if (conf_showProgressBar) {
        showProgress.css('visibility', "hidden");
    }
}
function showProgressBar() {
    if (conf_showProgressBar) {
        showProgress.css('visibility', "visible");
    }
}

var posInRunningOrder = 0;
var posInCurrentItemSet = 0;
var currentUtilsInstance = null;
var currentControllerOptions = null;
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
    var na = [];
    for (var i = 0; i < results_line.length; ++i) {
        assert(results_line[i].length == 2, "Internal error");
        na.push([getColumnNameIndex(results_line[i][0]), results_line[i][1]]);
    }
    return na;
}

function finishedCallback(resultsLines) {
    var currentItem = runningOrder[posInRunningOrder][posInCurrentItemSet];

    if (resultsLines != null) {
        for (var i = 0; i < resultsLines.length; ++i) {
            var group = runningOrder[posInRunningOrder].group;
            if (group && group.length)
                group = group[0]
            var preamble = [ [0, currentItem.controller ? currentItem.controller : "UNKNOWN"],
                             [1, currentItem.itemNumber],
                             [2, currentItem.elementNumber],
                             [3, runningOrder[posInRunningOrder].type],
                             [4, group == null ? "NULL" : group ] ];
            resultsLines[i] = namesToIndices(resultsLines[i]);
            for (var j = 0; j < resultsLines[i].length; ++j) {
                preamble.push(resultsLines[i][j]);
            }
            allResults.push(preamble);
        }
    }

    // Update progress bar if applicable.
    if (ibex_controller_get_property(currentItem.controller, "countsForProgressBar") === undefined ||
        ibex_controller_get_property(currentItem.controller, "countsForProgressBar")) {
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
    if (dget(currentControllerOptions, "displayMode", "overwrite") != "append") {
        renewInner();
    }
    pForItem = $(document.createElement("p")).css('clear', 'both');
    inner.append(pForItem);

    // Is this a practice item?
    if (practiceBox) {
//        alert(currentItem.type + ":" + conf_practiceItemTypes);
        if (list_contains(runningOrder[posInRunningOrder].type, conf_practiceItemTypes)) {
//            alert("PB2");
            practiceBox.text(conf_practiceMessage);
        }
        else {
            practiceBox.text("");
        }
    }

    currentUtilsInstance.gc();
    currentUtilsInstance = new Utils(currentUtilsInstance.valuesForNextElement);
    var os = currentItem.options;
    os._finishedCallback = finishedCallback;
    os._utils = currentUtilsInstance;
    os._cssPrefix = ibex_controller_name_to_css_prefix(currentItem.controller);
    os._controllerDefaults = ht_defaults;
    os._utilsClass = Utils;
    currentControllerOptions = os;
    addSafeBindMethodPair(currentItem.controller);
    pForItem[currentItem.controller](os);

    // Should we show the progress bar with this item?
    if (currentControllerOptions.hideProgressBar)
        hideProgressBar();
    else
        showProgressBar();
}
var pForItem = $(document.createElement("p")).css('clear', 'both');
inner.append(pForItem);
currentUtilsInstance = new Utils({});
var os = runningOrder[0][0].options;
os._finishedCallback = finishedCallback;
os._utils = currentUtilsInstance;
os._cssPrefix = runningOrder[0][0].controller + "-";
os._controllerDefaults = ht_defaults;
os._utilsClass = Utils;
currentControllerOptions = os;
addSafeBindMethodPair(runningOrder[0][0].controller);
pForItem[runningOrder[0][0].controller](os);
// Should we show the progress bar with the first item?
if (currentControllerOptions.hideProgressBar)
    hideProgressBar();

var sendingResults = $(document.createElement("p")).addClass("sending-results");
var spinSpan =
    $(document.createElement("div"))
    .css('width', '1.5em')
    .css('float', 'left');

__spinSpanShouldBeSpinning__ = false;
function setStateToResultsSentOrFailed(succeeded) {
    __spinSpanShouldBeSpinning__ = false;

    sendingResults.empty();
    sendingResults.append(succeeded ? conf_completionMessage : conf_completionErrorMessage + " ");
    if (! succeeded) {
        sendingResults.append($(document.createElement("a"))
                              .attr('href', "javascript:__retry__();")
                              .text("Retry"));
    }
}
function indicateThatResultsAreBeingSent()
{
    // Clear "practice" notice if it's still up.
    if (practiceBox)
        practiceBox.text("");

    sendingResults.empty();
    sendingResults.append(spinSpan).append(conf_sendingResultsMessage);

    renewInner();
    inner.append(sendingResults);

    var spinChars = ["\u2013", "\\", "|", "/"];
    var spinCharsPos = 0
    __spinSpanShouldBeSpinning__ = true;
    function timerCallback()
    {
        if (! __spinSpanShouldBeSpinning__) { return; }

        spinSpan.text(spinChars[spinCharsPos]);
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
    // Prepare the post data.
    var data = JSON.stringify([randomCounter ? true : false, counter, columnNamesArray, resultsLines]);

    $.ajax({
        url: serverURI,
        contentType: "text/html; charset=UTF-8",
        data: data,
        type: "POST",
        success: success,
        error: failure
    });
}

} // End of else for if (conf_showOverview).

}); // End of $(document).read(function { ...