var body = document.getElementsByTagName("body")[0];

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
        if (ht_defaults[i][0] == obj)
            return ht_defaults[i][1];
    }
    return new Hashtable();
}

function Item(type, group, num, controller, options) {
    this.type = type
    this.group = group;
    this.num = num;
    this.controller = controller;
    this.options = options;
}

// Now create our initial list of Items, merging in default options.
assert(typeof(items) != "undefined", "You must define the 'items' variable.");
assert_class(items, "Array", "The 'items' variable must be set to an Array.");
var listOfItems = [];
var itemNumber = 0;
iter(items, function(it) {
    assert_class(it, "Array", "Every element in the 'items' Array must be an Array.");
    assert(it.length == 3, "Every element in the 'items' Array must be an Array of length 3.");
    var typeAndGroup = it[0];
    var controller = it[1];
    var options = it[2];

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
    assert(options.length % 2 == 0, "The list of options for each item must have an even number of elements.");
    for (var i = 0; i < options.length; i += 2) {
        assert(typeof(options[i]) == "string", "The name of each options for an item must be a string.");
        opts.put(options[i], options[i + 1]);
    }

    listOfItems.push(new Item(type, group, itemNumber, controller, opts)); 

    ++itemNumber;
 });

var runningOrder = listOfItems;
var posInRunningOrder = 0;

var mainDiv = document.createElement("div");
body.appendChild(mainDiv);

var currentControllerInstance = null;

function finishedCallback() {
    ++posInRunningOrder;
    if (posInRunningOrder >= runningOrder.length)
        alert("DONE!");

    var newMainDiv = document.createElement("div");
    body.replaceChild(newMainDiv, mainDiv);
    mainDiv = newMainDiv;

    currentControllerInstance =
        new (runningOrder[posInRunningOrder].controller)
            (mainDiv,runningOrder[posInRunningOrder].options, finishedCallback);
}
currentControllerInstance =
    new (runningOrder[0].controller)
        (mainDiv, runningOrder[0].options, finishedCallback);

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