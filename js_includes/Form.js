/* This software is licensed under a BSD license; see the LICENSE file for details. */

$.widget("ui.Form", {
    _init: function () {
        this.cssPrefix = this.options._cssPrefix;
        this.finishedCallback = this.options._finishedCallback;
        this.utils = this.options._utils;

        this.html = dget(this.options, "html");
        this.continueMessage = dget(this.options, "continueMessage", "Click here to continue");
        this.checkedValue = dget(this.options, "checkedValue", "yes");
        this.uncheckedValue = dget(this.options, "uncheckedValue", "no");
        this.validators = dget(this.options, "validators", { });
        this.errorCSSClass = dget(this.options, "errorCSSClass", "error");
        this.obligatoryErrorGenerator =
            dget(this.options, "obligatoryErrorGenerator",
                 function (field) { return "The \u2018" + field + "\u2019 field is obligatory."; });
        this.obligatoryCheckboxErrorGenerator =
            dget(this.options, "obligatoryCheckboxErrorGenerator",
                 function (field) { return "You must check the " + field + " checkbox to continue."; });
        this.obligatoryRadioErrorGenerator =
            dget(this.options, "obligatoryRadioErrorGenerator",
                 function (field) { return "You must select an option for \u2018" + field + "\u2019."; });

        var t = this;

        function alertOrAddError(name, error) {
            var ae = $("label." + escape(t.errorCSSClass) + "[for=__ALL_FIELDS__]");
            if (ae.length > 0) {
                ae.addClass(t.cssPrefix + "error-text").text(error);
                return;
            }

            var e = $("label." + escape(t.errorCSSClass) + "[for=" + escape(name) + "]");
            if (e.length > 0)
                e.addClass(t.cssPrefix + "error-text").text(error);
            else 
                alert(error);
        }

        var HAS_LOADED = false;

        function handleClick(dom) {
            return function (e) {
                e.preventDefault();
                if (! HAS_LOADED) return;

                // Get rid of any previous errors.
                $("." + t.cssPrefix + "error-text").empty();

                var rlines = [];

                var inps = $(dom).find("input[type=text]");
                var tas = $(dom).find("textarea");
                for (var i = 0; i < tas.length; ++i) { inps.push(tas[i]); }

                for (var i = 0; i < inps.length; ++i) {
                    var inp = $(inps[i]);

                    if (inp.hasClass("obligatory") && ((! inp.attr('value')) || inp.attr('value').match(/^\s*$/))) {
                        alertOrAddError(inp.attr('name'), t.obligatoryErrorGenerator(inp.attr('name')));
                        return;
                    }

                    if (t.validators[inp.attr('name')]) {
                        var er = t.validators[inp.attr('name')](inp.attr('value'));
                        if (typeof(er) == "string") {
                            alertOrAddError(inp.attr('name'), er);
                            return;
                        }
                    }

                    rlines.push([["Field name", custom_url_encode(inp.attr('name'))],
                                 ["Field value", custom_url_encode(inp.attr('value'))]]);
                }

                var checks = $(dom).find("input[type=checkbox]");
                for (var i = 0; i < checks.length; ++i) {
                    var check = $(checks[i]);
 
                    // Checkboxes with the 'obligatory' class must be checked.
                    if (! check.attr('checked') && check.hasClass('obligatory')) {
                        alertOrAddError(check.attr('name'), t.obligatoryCheckboxErrorGenerator(check.attr('name')));
                        return;
                    }

                    rlines.push([["Field name", check.attr('name')],
                                 ["Field value", check.attr('checked') ? t.checkedValue : t.uncheckedValue]]);
                }

                var rads = $(dom).find("input[type=radio]");
                // Sort by name.
                var rgs = { };
                for (var i = 0; i < rads.length; ++i) {
                    var rad = $(rads[i]);
                    if (rad.attr('name')) {
                        if (! rgs[rad.attr('name')])
                            rgs[rad.attr('name')] = [];
                        rgs[rad.attr('name')].push(rad);
                    }
                }
                for (k in rgs) {
                    // Check if it's oblig.
                    var oblig = false;
                    var oneIsSelected = false;
                    var oneThatWasSelected;
                    var val;
                    for (var i = 0; i < rgs[k].length; ++i) {
                        if (rgs[k][i].hasClass('obligatory')) oblig = true;
                        if (rgs[k][i].attr('checked')) {
                            oneIsSelected = true;
                            oneThatWasSelected = i;
                            val = rgs[k][i].attr('value');
                        }
                    }
                    if (oblig && (! oneIsSelected)) {
                        alertOrAddError(rgs[k][0].attr('name'), t.obligatoryRadioErrorGenerator(rgs[k][0].attr('name')));
                        return;
                    }
                    if (oneIsSelected) {
                        rlines.push([["Field name", rgs[k][0].attr('name')],
                                     ["Field value", rgs[k][oneThatWasSelected].attr('value')]]);
                    }
                }

                t.finishedCallback(rlines);
            }
        }

        var dom = htmlCodeToDOM(this.html, function (dom) { HAS_LOADED = true; });
        t.element.append(dom);
        t.element.append($("<p>").append($("<a>").attr('href', '').text("\u2192 " + t.continueMessage)
                                         .addClass(ibex_controller_name_to_css_prefix("Message") + "continue-link")
                                         .click(handleClick(dom))));
    }
});

ibex_controller_set_properties("Form", {
    obligatory: ["html"],
    countsForProgressBar: false,
    htmlDescription: function (opts) {
        return htmlCodeToDOM(opts.html);
    }
});
