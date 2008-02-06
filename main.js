// Can't be in conf.js for boring reasons.
var conf_shuffleSequence = seq(equalTo0, rshuffle(lessThan0, greaterThan0));
if (typeof(shuffleSequence) != "undefined")
    conf_shuffleSequence = shuffleSequence;

var body = document.getElementsByTagName("body")[0];

var counter = readCookie("counter");
var randomCounter = false;
if (parseInt(counter) == NaN) {
    counter = Math.floor(Math.random() * 10000);
    randomCounter = true;
}

var sendingResults = document.createElement("p")
sendingResults.className = "sending-results"
var spinSpan = document.createElement("div");
spinSpan.appendChild(document.createTextNode(""));
spinSpan.style.width = "1.5em";
spinSpan.style.cssFloat = "left";
spinSpan.style.styleFloat = "left";
sendingResults.appendChild(spinSpan);
var sendingResultsMessage = document.createElement("div");
sendingResultsMessage.appendChild(document.createTextNode(" Sending results to server..."));
sendingResultsMessage.style.cssFloat = "left";
sendingResultsMessage.style.styleFloat = "left";
sendingResults.appendChild(sendingResultsMessage);

// Convert the "defaults" variable to a list of [item, hashtable] pairs.
var ht_defaults = [];
if (typeof(defaults) != "undefined") {
    assert_class(defaults, "Array", "'defaults' variable must be set to an Array.");
    assert(defaults.length % 2 == 0, "'defaults' Array must have an even number of elements.");
    
    for (var i = 0; i < defaults.length; i += 2) {
        assert(typeof(defaults[i]) == "function", "Odd members of the 'defaults' array must be object constructor functions.");
        assert_class(defaults[i + 1], "Array", "Even members of the 'defaults' array must be Arrays.");
        assert(defaults[i + 1].length % 2 == 0, "Default property specifications must have even numbers of elements.");

        ht_defaults.push([defaults[i], new Hashtable()]);

        for (var j = 0; j < defaults[i + 1].length; j += 2) {
            assert(typeof(defaults[i + 1][j] == "string", "Property names must be strings."));
            ht_defaults[ht_defaults.length - 1][1].put(defaults[i + 1][j], defaults[i + 1][j + 1]);
        }
    }
}

// We don't have object-keyed hashtables at our disposal, so
// here's a utility function for traversing the ht_defaults alist.
function get_defaults_for(obj) {
    for (var i = 0; i < ht_defaults.length; ++i) {
        if (ht_defaults[i][0] == obj) {
            // Copy the hashtable (had a nasty bug from not doing this...).
            return (new Hashtable()).add(ht_defaults[i][1]);
        }
    }
    return new Hashtable();
}

function Item(type, group, itemNumber, elementNumber, controller, options) {
    this.type = type
    this.group = group;
    this.itemNumber = itemNumber;
    this.elementNumber = elementNumber;
    this.controller = controller;
    this.options = options;
}

// Now create our initial list of item sets (lists of Items), merging in default options.
assert(typeof(items) != "undefined", "You must define the 'items' variable.");
assert_class(items, "Array", "The 'items' variable must be set to an Array.");
var listOfItemSets = [];
var itemNumber = 0;
iter(items, function(it) {
    assert_class(it, "Array", "Every element in the 'items' Array must be an Array.");


    assert(((it.length - 1) % 2) == 0, "Following the item/group specifier, each element of the 'items' array must contain an even number of elements.")
    var typeAndGroup = it[0];
    var currentItemSet = [];
    for (var setIndex = 1, elementNumber = 0; setIndex < it.length; setIndex += 2, ++elementNumber) {
        var controller = it[setIndex];
        var options = it[setIndex + 1];

        var type;
        var group = "NULL";
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
        assert(options.length % 2 == 0, "The list of options for each item must have an even number of elements.");
        for (var i = 0; i < options.length; i += 2) {
            assert(typeof(options[i]) == "string", "The name of each options for an item must be a string.");
            opts.put(options[i], options[i + 1]);
        }
        
        // Check that all obligatory options have been specified.
        if (controller.obligatory) {
            assert_class(controller.obligatory, "Array", "The 'obligatory' field must be an Array of strings.");
            iter(controller.obligatory, function(o) {
                assert(typeof(o) == "string", "All members of the 'obligatory' Array must be strings.");
                assert(opts.get(o) != null, "The obligatory option '" + o + "' was not specified.");
            });
        }

        currentItemSet.push(new Item(type, group, itemNumber, elementNumber, controller, opts));
    }
    listOfItemSets.push(currentItemSet); 

    ++itemNumber;
 });

function Utils(valuesFromPreviousItem) {
    this.timeoutIds = [];

    this.setTimeout = function(func, time) {
        var id = setTimeout(func, time);
        this.timeoutIds.push(id);
        return id;
    }

    this.clearTimeout = function(id) {
        // Check that this is an id from a timeout set with the
        // setTimeout method of this object.
        var foundIt = false;
        for (i = 0; i < this.timeoutIds; ++i) {
            if (this.timeoutIds[i] == id) {
                foundIt = this.timeoutIds[i];
                break;
            }
        }
        if (foundIt == null)
            assert(false, "Attempt to clear timer that wasn't set propetly");
        var newArray = new Array(this.timeoutIds.length - 1);
        for (var j = 0; j < this.timeoutIds.length; ++j) {
            if (j != i)
                newArray.push(this.timeoutIds[i]);
        }
        this.timeoutIds = newArray;
        clearTimeout(foundIt);
    }

    this.gc = function() {
        for (var i = 0; i < this.timeoutIds.length; ++i) {
            clearTimeout(this.timeoutIds[i]);
        }
    }

    this.valuesForNextItem = new Hashtable();

    this.setValueForNextElement = function(key, value) {
        assert(typeof(key) == "string", "First argument to 'setValueForNextElement' must be a string");
        this.valuesForNextItem.put(key, value);
    }

    this.getValueFromPreviousItem = function(key) {
        return valuesFromPreviousItem.get(key);
    }
}

var mainDiv = document.createElement("div");
mainDiv.style.clear = "both";
body.appendChild(mainDiv);

var runningOrder = runShuffleSequence(listOfItemSets, conf_shuffleSequence);
assert(runningOrder.length > 0 && runningOrder[0].length > 0,
       "There must be some items in the running order!");

var posInRunningOrder = 0;
var posInCurrentItemSet = 0;
var currentControllerInstance = null;
var currentUtilsInstance = null;
// A list of result lines.
var allResults = [];

function finishedCallback(resultsLines) {
    if (resultsLines != null) {
        for (var i = 0; i < resultsLines.length; ++i) {
            var preamble = [ currentControllerInstance.name ? currentControllerInstance.name : "UNKNOWN",
                             currentControllerInstance.itemNumber,
                             currentControllerInstance.elementNumber,
                             currentControllerInstance.type,
                             currentControllerInstance.group ];
            for (var j = 0; j < resultsLines[i].length; ++j) {
                preamble.push(resultsLines[i][j]);
            }
            allResults.push(preamble);
        }
    }

    ++posInCurrentItemSet;
    if (posInCurrentItemSet >= runningOrder[posInRunningOrder].length) {
        ++posInRunningOrder;
        if (posInRunningOrder >= runningOrder.length) {
            indicateThatResultsAreBeingSent();
            sendResults(allResults,
                        function() { indicateThatResultsWereSent(true); },
                        function() { indicateThatResultsWereSent(false); });
        }
        posInCurrentItemSet = 0;
    }

    var pForItem;
    if (runningOrder[posInRunningOrder][posInCurrentItemSet].options.dget("display mode", "overwrite") != "append") {
        var newMainDiv = document.createElement("div");
        body.replaceChild(newMainDiv, mainDiv);
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

    currentUtilsInstance.gc();
    currentUtilsInstance = new Utils(currentUtilsInstance.valuesForNextItem);
    currentControllerInstance =
        new (runningOrder[posInRunningOrder][posInCurrentItemSet].controller)
    (pForItem,runningOrder[posInRunningOrder][posInCurrentItemSet].options, finishedCallback, currentUtilsInstance);
}
currentUtilsInstance = new Utils(null);
currentControllerInstance =
    new (runningOrder[0][0].controller)
(mainDiv, runningOrder[0][0].options, finishedCallback, currentUtilsInstance);

document.onkeydown = function(e) {
    // Record the time ASAP.
    var time = new Date().getTime();

    // For IE.
    if (! e) {
        e = window.event;
    }

    if (currentControllerInstance.handleKey)
        currentControllerInstance.handleKey(e.keyCode, time);
}

function indicateThatResultsAreBeingSent()
{
    body.replaceChild(sendingResults, mainDiv);
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
    var data = [randomCounter ? true : false, counter, resultsLines].toJSONString();

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
    xmlhttp.open("POST", conf_serverURI, true);
    xmlhttp.send(data);
}
