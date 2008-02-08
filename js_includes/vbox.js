VBox.obligatory = ["children"]

function VBox(div, options, finishedCallback, utils) {
    this.name = "VBox";

    this.options = options;
    this.children = options.get("children");

    assert_is_arraylike(this.children, "The 'children' option of VBox must be an array");
    assert(this.children.length % 2 == 0, "The 'children' array for VBox must contain an even number of elements");

    this.childDivs = [];
    this.childInstances = [];
    for (var i = 0; i < this.children.length; i += 2) {
        var controllerClass = this.children[i];
        var childOptions = this.children[i + 1];
        var childOptionsHash = flat_alist_to_hash(
            "Error: options array containing an odd number of elements in VBox",
            childOptions
        );

        var d = document.createElement("p");
        d.style.clear = "both";
        div.appendChild(d);
        this.childInstances.push(
            new controllerClass(
                d,
                childOptionsHash,
                function (r) { myFinishedCallback(i, r); },
                utils
            )
        );
    }

    this.indicesAndResultsOfChildrenThatHaveFinished = [];

    this.handleKey = function(code, time) {
        iter(this.childInstances, function (c) {
            c.handleKey(code, time);
        });
    }

    this.myFinishedCallback = function(index, results) {
        this.indicesAndResultsOfThingsThatHaveFinished.push([index, results]);

        if (this.indicesAndResultsOfThingsThatHaveFinished.length == this.childDivs.length) {
            finishedCallback(concatResults(indicesAndResultsOfThingsThatHaveFinished));
        }
    }

    this.concatResults = function(iar) {
        iar.sort(function(x, y) { return x[0] < y[0]; });
        var res;
        iter(iar, function(r) {
            if (r) {
                res.push("*");
                iter(r, function() { res.append(r); })
            }
        });
    }
}
