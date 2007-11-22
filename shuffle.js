// Shuffle an array.
function fisherYates(myArray) {
    var i = myArray.length;
    if (i == 0) { return false; }
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempi = myArray[i];
        var tempj = myArray[j];
        myArray[i] = tempj;
        myArray[j] = tempi;
   }
}

// Given an array of arrays, returns a single array with elements
// from each array shuffled evenly into it.
// WARNING: This will destructively modify the matrix array.
// IMPORTANT: The order of elements in subarrays is preserved.
function evenShuffle(arrayOfArrays) {
    fisherYates(arrayOfArrays);

    var longestArrayLength = 0;
    var totalLength = 0;
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        if (arrayOfArrays[i].length > longestArrayLength)
            longestArrayLength = arrayOfArrays[i].length;
        totalLength += arrayOfArrays[i].length;
    }

    if (totalLength == 0) { return []; }

    var loopsPerIncrement = new Array(arrayOfArrays.length);
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        loopsPerIncrement[i] = (arrayOfArrays[i].length + 0.0) / (longestArrayLength + 0.0)
    }

    var indexArray = new Array(arrayOfArrays.length);
    for (var i = 0; i < indexArray.length; ++i) {
        indexArray[i] = 0.0;
    }

    var shuffledArray = new Array(totalLength);
    for (var idx = 0; idx < totalLength;) {
        for (var j = 0; j < arrayOfArrays.length; ++j) {
            var oldi = indexArray[j];
            var newi = oldi + loopsPerIncrement[j];
            if (Math.floor(oldi) != Math.floor(newi)) {
                if (oldi < arrayOfArrays[j].length) {
                    shuffledArray[idx] = arrayOfArrays[j][Math.floor(oldi)];
                    ++idx;
                    if (! (idx < totalLength))
                        break; // The outer loop will now exit too.
                }
            }
            indexArray[j] = newi;
        }
    }

    return shuffledArray;
}

function latinSquare(arrayOfArrays, counter) {
    var groupSize = null;
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        if (groupSize == null) {
            groupSize = arrayOfArrays[i].length;
        }
        else if (groupSize != arrayOfArrays[i].length) {
            alert("Inconsistent group sizes.");
            return 1/0;
        }
    }

    var idx = counter % groupSize;
    var a = new Array(arrayOfArrays.length);
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        a[i] = arrayOfArrays[i][idx];
        ++idx;
        if (idx >= groupSize)
            idx = 0;
    }

    return a;
}

function mungGroups(sentenceArray, counter) {
    var nulls = filter(function (e) { return e.group == null; }, sentenceArray);
    var grouped = filter(function (e) { return e.group != null; }, sentenceArray);

    var hash = new Hashtable();
    for (var i = 0; i < grouped.length; ++i) {
        if (hash.get(grouped[i].group) == undefined) {
            hash.put(grouped[i].group, [grouped[i]]);
        }
        else
            hash.get(grouped[i].group).push(grouped[i]);
    }
    // Flatten the hash.
    var flat = new Array();
    hash.moveFirst();
    while (hash.next()) {
        flat.push(hash.getValue());
    }
    var ls = flat.length > 0 ? latinSquare(flat, counter) : [];
    return nulls.concat(ls);
}

function anyType(x) { return true; }
function lessThan0(x) { return typeof(x) == "number" && x < 0 ;}
function greaterThan0(x) { return typeof(x) == "number" && x > 0; }
function equalTo0(x) { return typeof(x) == "number" && x == 0; }
function startsWith(k) {
    return function(s) {
        // Avoid searching through the whole string in cases where
        // it's not necessary.
        if (typeof(s) != "string")
            return false;
        else if (s.length == 0 && k.length == 0)
            return true;
        else if (s[0] != k[0])
            return false;
        else
            return typeof(s) == "string" && s.indexOf(k) == 0;
    }
}
function not(pred) {
    return function(k) { return ! pred(k); }
}

function Seq(args) {
    this.ssType = "Seq";
    this.args = args;
}
function seq() { return new Seq(seq.arguments); }
function Randomize(x) {
    this.ssType = "Randomize";
    this.args = [x];
}
function randomize(x) { return new Randomize(x); }
function Shuffle(args) {
    this.ssType = "Shuffle";
    this.args = args;
}
function shuffle() { return new Shuffle(shuffle.arguments); }
function rshuffle() { return new Shuffle(map(randomize, rshuffle.arguments)); }

function toPredicate(v) {
    if (typeof(v) == "function") {
        return v;
    }
    else if (typeof(v) == "object") {
        return function(x) {
            for (var i = 0; i < v.length; ++i) {
                if (v[i] == x)
                    return true;
            }
            return false;
        }
    }
    else if (typeof(v) == "string" || typeof(v) == "number") {
        return function(x) { return x == v; }
    }
    else {
        return 1/0;
    }
}

function runShuffleSequence(masterArray, ss) {
    if (typeof(ss) != "object" || ss.ssType == undefined) {
        alert("Bad shuffle sequence");
        return 1/0;
    }

    var arrays = new Array();
    for (var i = 0; i < ss.args.length; ++i) {
        if (typeof(ss.args[i]) == "object" && ss.ssType != undefined) {
            arrays.push(runShuffleSequence(masterArray, ss.args[i]));
        }
        else {
            var pred = toPredicate(ss.args[i]);
            var elems = filter(function (s) { return pred(s.type); }, masterArray);

            if (elems.length > 0)
                arrays.push(elems);
        }
    }

    if (arrays.length == 0)
        return []

    if (ss.ssType == "Randomize") {
        fisherYates(arrays[0]);
        return arrays[0];
    }
    else if (ss.ssType == "Seq") {
        var totLength = 0;
        for (var i = 0; i < arrays.length; ++i)
            totLength += arrays[i].length;
        var a = new Array(totLength);
        var count = 0;
        for (var i = 0; i < arrays.length; ++i) {
            for (var j = 0; j < arrays[i].length; ++j) {
                a[count] = arrays[i][j];
                ++count;
            }
        }
        return a;
    }
    else if (ss.ssType == "Shuffle") {
        return evenShuffle(arrays);
    }
}

