/* This software is licensed under a BSD license; see the LICENSE file for details. */

define_ibex_controller({
    name: "DashedAcceptabilityJudgment",
    jqueryWidget: {
        _init: function () {
            this.options._dashed = true;
            if (this.options.mode === undefined)
                this.options.mode = "speeded acceptability";
            $(this.element).AcceptabilityJudgment(this.options);
        }
    },
    properties: {
        obligatory: ["s", "as"],
        htmlDescription: function (opts) {
            var s = ibex_controller_get_property("DashedSentence", "htmlDescription")(opts);
            var q = ibex_controller_get_property("Question", "htmlDescription")(opts);
            var p =
                $("<p>")
                .append($("<p>").append("Q: ").append($(q)))
                .append("<br>").append($("<b>").text("S:"))
                .append($(s));
            return p;
        }
    }
});