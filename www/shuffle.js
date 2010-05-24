/* This software is licensed under a BSD license; see the LICENSE file for details. */

// Shuffle an array.
function fisherYates(myArray) {
    var i = myArray.length;
    if (i == 0)
        return false;
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
                    if (! (idx < totalLength)) {
                        break; // The outer loop will now exit too.
                    }
                }
            }
            indexArray[j] = newi;
        }
    }

    return shuffledArray;
}

function latinSquare(arrayOfArrays, counter) {
    if (conf_equalGroupSizes) {
        var groupSize = null;
        for (var i = 0; i < arrayOfArrays.length; ++i) {
            if (groupSize == null) {
                groupSize = arrayOfArrays[i].length;
            }
            else if (groupSize != arrayOfArrays[i].length) {
                assert(false, "Inconsistent group sizes.");
            }
        }
    }

    var record = { };
    var idx = counter;
    var a = new Array(arrayOfArrays.length);
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        // Are we using the bare idx or a chain thingy?
        if (arrayOfArrays[i][0].group[1] == null) { // Get group of first element of subarray (will be same for
                                                    // all other subelements.
            // We aren't.
            var x = idx % arrayOfArrays[i].length;
            a[i] = arrayOfArrays[i][x];
            record[arrayOfArrays[i][0].group[0]] = x;
            ++idx;
        }
        else {
            // Check that the chain index thingy is the same for every item in the group.
            var firstChain = arrayOfArrays[i][0].group[1];
            for (var j = 1; j < arrayOfArrays[i].length; ++j) {
                if (arrayOfArrays[i][j].group[1] != firstChain)
                    assert(false, "When using dependent group selection, the second element in each pair must be the same for every item in the group. This rule was violated in group " + arrayOfArrays[i][j].group[0] + ".");
            }

            var group = arrayOfArrays[i][0].group[0];
            var groupchain = arrayOfArrays[i][0].group[1];
            // We are.
            if (record[groupchain] === undefined) {
                assert(false, "Oh deary me");
            }
            else {
                assert(record[groupchain] <= arrayOfArrays[i].length,
                       "Bad dependent group selection index.");
                a[i] = arrayOfArrays[i][record[groupchain]];
                record[group] = record[groupchain];
            }
        }
    }

    //if (extras != null) { extras.groupSize = groupSize; }
    return a;
}

function regularizeGroup(g) {
    if (typeof(g.group) == "object") {
        assert(g.group.length == 2, "Groups must either be single values or two-member lists");
        return g;
    }
    else {
        g.group = [g.group, null];
        return g;
    }
}

function mungGroups(sentenceArray, counter) {
    var nulls = filter(function (e) { return e.group == null; }, sentenceArray);
    // NOTE: May need to change to a for loop for efficiency reasons.
    //var grouped = $.map(filter(function (e) { return e.group != null; }, sentenceArray),
    //                    regularizeGroup);
    var grouped = [];
    for (var i = 0; i < sentenceArray.length; ++i) {
        var k = sentenceArray[i];
        if (k.group != null)
            grouped.push(regularizeGroup(k));
    }

    var hash = { };
    for (var i = 0; i < grouped.length; ++i) {
        if (hash[grouped[i].group[0]] === undefined) {
            hash[grouped[i].group[0]] = [grouped[i]];
        }
        else {
            hash[grouped[i].group[0]].push(grouped[i]);
        }
    }
    // Flatten the hash.
    var flat = new Array();
    for (k in hash) {
        flat.push(hash[k]);
    }
    var ls = flat.length > 0 ? latinSquare(flat, counter) : [];
//    if (extras != null) { extras['groupSize'] = es['groupSize']; }
    return nulls.concat(ls);
}

function toPredicate(v) {
    if (typeof(v) == "function") {
        return v;
    }
    else if (typeof(v) == "string" || typeof(v) == "number") {
        return function(x) { return x == v; }
    }
    else {
        assert(false, "Bad type for predicate in shuffle sequence");
    }
}

function anyType(x) { return true; }
function lessThan0(x) { return typeof(x) == "number" && x < 0 ;}
function greaterThan0(x) { return typeof(x) == "number" && x > 0; }
function equalTo0(x) { return typeof(x) == "number" && x == 0; }
function startsWith(k) {
    return function(s) {
        if (typeof(s) != "string")
            return false;
        else {
            return stringStartsWith(k, s);
        }
    }
}
function endsWith(k) {
    return function(s) {
        if (typeof(s) != "string")
            return false;
        else {
            return stringEndsWith(k, s);
        }
    }
}
function not(pred) {
    var pred_ = toPredicate(pred);
    return function(k) { return ! pred_(k); }
}
function anyOf() {
    var ps = $.map(anyOf.arguments, toPredicate);
    return function(k) {
        for (var i = 0; i < ps.length; ++i) {
            if (ps[i](k))
                return true;
        }
        return false;
    }
}

function Seq(args) {
    this.args = args;

    this.run = function(arrays) {
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
}
function seq() { return new Seq(seq.arguments); }
function Randomize(x) {
    this.args = [x];

    this.run = function(arrays) {
        fisherYates(arrays[0]);
        return arrays[0];
    }
}
function randomize(x) { return new Randomize(x); }
function Shuffle(args) {
    this.args = args;

    this.run = function(arrays) {
        return evenShuffle(arrays);
    }
}
function shuffle() { return new Shuffle(shuffle.arguments); }
function rshuffle() { return new Shuffle($.map(rshuffle.arguments, randomize)); }
function SepWith(sep, main) {
    this.args = [sep,main];

    this.run = function(arrays) {
        assert(arrays.length == 2, "Wrong number of arguments (or bad argument) to SepWith");
        var sep = arrays[0];
        var main = arrays[1];

        if (main.length <= 1)
            return main
        else {
            var newArray = [];
            var i;
            for (i = 0; i < main.length - 1; ++i) {
                newArray.push(main[i]);
                for (var j = 0; j < sep.length; ++j) {
                    newArray.push(sep[j]);
                }
            }
            newArray.push(main[i]);

            return newArray;
        }
    }
}
function sepWith(sep, main) { return new SepWith(sep, main); }

function PrecedeEachWith(prec, main, precede) {
    this.args = [prec,main];

    this.run = function(arrays) {
        assert(arrays.length == 2, "Wrong number of arguments (or bad argument) to PrecedeEachWith or FollowEachWith");
        var prec = arrays[0];
        var main = arrays[1];
        
        // Flatten prec.
        var flattenedPrec = [];
        for (var i = 0; i < prec.length; ++i) {
            for (var j = 0; j < prec[i].length; ++j) {
                flattenedPrec.push(prec[i][j]);
            }
        }

        for (var i = 0; i < main.length; ++i) {
            if (! precede) {
                for (var j = 0; j < flattenedPrec.length; ++j)
                    main[i].push(flattenedPrec[j]);
            }
            else {
                var old = main[i];
                main[i] = [];
                for (var j = 0; j < flattenedPrec.length; ++j)
                    main[i].push(flattenedPrec[j]);
                for (var j = 0; j < old.length; ++j)
                    main[i].push(old[j]);
            }
        }
        return main;
    }
}
function precedeEachWith(prec, main) { return new PrecedeEachWith(prec, main, true); }
function followEachWith(prec, main) { return new PrecedeEachWith(prec, main, false); }

function runShuffleSequence(masterArray, ss) {
    assert(typeof(ss) == "object", "Bad shuffle sequence");

    var arrays = new Array();
    for (var i = 0; i < ss.args.length; ++i) {
        if (typeof(ss.args[i]) == "object") {
            arrays.push(runShuffleSequence(masterArray, ss.args[i]));
        }
        else {
            var pred = toPredicate(ss.args[i]);
            var elems = filter(function (s) { assert(s != null, "Bad array"); return pred(s.type); }, masterArray);

            if (elems.length > 0)
                arrays.push(elems);
        }
    }

    if (arrays.length == 0)
        return []

    return ss.run(arrays);
}
