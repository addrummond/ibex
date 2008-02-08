VBox.obligatory = ["children"]

function VBox(div, options, finishedCallback, utils) {
    this.name = "VBox";

    this.options = options;
    this.children = options.get("children");

    assert_is_arraylike(this.children, "The 'children' option of VBox must be an array");
    assert(this.children.length % 2 == 0, "The 'children' array for VBox must contain an even number of elements");

    this.childInstances = [];
    this.childUtils = [];
    for (var i = 0; i < this.children.length; i += 2) {
        var controllerClass = this.children[i];
        var childOptions = this.children[i + 1];
        var childOptionsHash = flat_alist_to_hash(
            "Error: options array containing an odd number of elements in VBox",
            childOptions
        );
        childOptionsHash.add(get_defaults_for(controllerClass));

        var d = document.createElement("p");
        d.style.clear = "both";
        div.appendChild(d);
        var t = this;
        var u = new Utils(utils.getValuesFromPreviousItem());
        this.childUtils.push(u);
        var lastIndex = this.childUtils.length - 1;
        this.childInstances.push(
            new controllerClass(
                d,
                childOptionsHash,
                function (r) { t.myFinishedCallback(lastIndex, r); },
                u
            )
        );
    }

    this.indicesAndResultsOfThingsThatHaveFinished = [];

    this.handleKey = function(code, time) {
        iter(this.childInstances, function (c) {
            if (c.handleKey)
                c.handleKey(code, time);
        });
    }

    this.myFinishedCallback = function(index, results) {
        this.childUtils[index].gc();
        this.indicesAndResultsOfThingsThatHaveFinished.push([index, results]);

        if (this.indicesAndResultsOfThingsThatHaveFinished.length == this.childInstances.length) {
            finishedCallback(this.concatResults(this.indicesAndResultsOfThingsThatHaveFinished));
        }
    }

    this.concatResults = function(iar) {
        iar.sort(function(x, y) { return x[0] < y[0]; });
        var res = [];
        iter(iar, function(r) {
            var r = r[1];
            if (r) {
                res.push("*");
                iter(r, function(x) { res.push(x); })
            }
        });
        return res;
    }
}
