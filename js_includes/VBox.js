/* This software is licensed under a BSD license; see the LICENSE file for details. */

$.widget("ui.VBox", {
    _init: function () {
        this.cssPrefix = this.options.options._cssPrefix;
        this.utils = this.options.options._utils;
        this.finishedCallback = this.options.options._finishedCallback;
        this.controllerDefaults = this.options.options._controllerDefaults;
        this.utilsClass = this.options.options._utilsClass;

        this.children = this.options.children;
        this.triggers = this.options.triggers;
        this.padding = dget(this.options, "padding", "2em");

        assert_is_arraylike(this.children, "The 'children' option of VBox must be an array");
        assert(this.children.length % 2 == 0, "The 'children' array for VBox must contain an even number of elements");

        assert_is_arraylike(this.triggers, "The 'triggers' option of VBox must be an array");
        assert(this.triggers.length > 0, "The 'triggers' array for VBox must be an array of length > 0");

        var t = this;
        $.each(this.triggers, function (_, tr) {
            assert(typeof(tr) == "number", "The 'triggers' array for VBox must be an array of integers");
            assert(tr >= 0 && tr < t.children.length / 2,
                   "Numbers in the 'triggers' array must be indices into the 'children' array starting from 0");
        });

        this.indicesAndResultsOfThingsThatHaveFinished = [];
//        this.childInstances = [];
        this.childUtils = [];

        for (var i = 0; i < this.children.length; i += 2) {
            var controllerClass = this.children[i];
            var childOptions = this.children[i + 1];
            childOptions = merge_dicts(this.controllerDefaults[controllerClass], childOptions);

            var d = $(document.createElement("p")).css('clear', 'both');

            // Call a manipulator if one was supplied.
            if (! (this.options.manipulators === undefined)) {
                for (var j = 0; j < this.options.manipulators.length; ++j) {
                    if (this.options.manipulators[j][0] == (i / 2))
                        d = this.options.manipulators[j][1](d);
                }
            }

            // Add padding if requested.
            var dd = null;
            if (this.padding && i > 0) {
                dd = $(document.createElement("div"))
                     .css('margin-top', this.padding)
                     .css('margin-bottom', 0)
                     .append(d);
            }

            // Wrap in a table if we're centering things.
            var ddd = null;
            if (conf_centerItems) {
                ddd = $("<table align='center'>");
                var tr = $(document.createElement("tr"));
                var td = $(document.createElement("td"));
                ddd.append(tr.append(td.append(dd ? dd : d)));
            }

            // Add the actual child.
            var ac = ddd ? ddd : (dd ? dd : d);
            this.element.append(ac);    

            var u = new this.utilsClass(this.utils.getValuesFromPreviousElement());
            this.childUtils.push(u);
            (function(i) {
                u.setResults = function(results) {
                    t.indicesAndResultsOfThingsThatHaveFinished.push([i, results]);
                };
            })(i);

            var t = this;
            var l = this.childUtils.length - 1;
            // Get around JavaScript's silly closure capture behavior (deriving
            // from weird variable scoping rules).
            // See http://calculist.blogspot.com/2005/12/gotcha-gotcha.html
            (function(l) {
                childOptions._finishedCallback = function (r) { t.myFinishedCallback(l, r); };
                childOptions._cssPrefix = ibex_controller_name_to_css_prefix(controllerClass);
                childOptions._utils = u;
                addSafeBindMethodPair(controllerClass);
                d[controllerClass](childOptions);

/*                t.childInstances.push(
                    new controllerClass(
                        d,
                        childOptions,
                        function (r) { t.myFinishedCallback(l, r); },
                        u
                    )
                );*/
            })(l);
        }
    },

    myFinishedCallback: function(index, results) {
        this.childUtils[index].gc();
        this.indicesAndResultsOfThingsThatHaveFinished.push([index, results]);

        var satisfied = true;
        for (var i = 0; i < this.triggers.length; ++i) {
            var foundIt = false;
            for (var j = 0; j < this.indicesAndResultsOfThingsThatHaveFinished.length; ++j) {
                if (this.indicesAndResultsOfThingsThatHaveFinished[j][0] == this.triggers[i]) {
                    foundIt = true;
                    break;
                }
            }
            if (! foundIt) {
                satisfied = false;
                break;
            }
        }

        if (satisfied) {
            // Merge values for next element.
            var merged = merge_list_of_dicts($.map(this.childUtils,
                                             function (x) { return x.valuesForNextElement; }));
            this.utils.valuesForNextElement = merged;

            this.finishedCallback(this.concatResults(this.indicesAndResultsOfThingsThatHaveFinished));
        }
    },

    concatResults: function(iar) {
        iar = iar.sort(function(x, y) { return x[0] - y[0]; });
        var res = [];
        for (var i = 0; i < iar.length; ++i) {
            for (var j = 0; j < iar[i][1].length; ++j) {
                var line = [];
                for (var k = 0; k < iar[i][1][j].length; ++k)
                    line.push(iar[i][1][j][k]);
                res.push(line);
            }
        }
        return res;
    }
});

ibex_controller_set_properties("VBox", { obligatory: ["children", "triggers"] });
