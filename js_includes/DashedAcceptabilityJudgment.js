/* This software is licensed under a BSD license; see the LICENSE file for details. */

define_ibex_controller({
    name: "DashedAcceptabilityJudgment",
    jqueryWidget: {
        _init: function () {
            var qclass = ibex_controller_name_to_css_prefix("Question") + "Question";
            var dclass = ibex_controller_name_to_css_prefix("DashedSentence") + "DashedSentence";

            var opts = this.options;
            opts._dashed = true;
            opts._vboxCallbackWhenChildFinishes = function (index) {
                if (index == 0) {
                    $(this.element).find("." + dclass).hide();
                    $(this.element).find("." + qclass).show();
                }
            }

            $(this.element).AcceptabilityJudgment(opts);
            // Hide the rating scale.
            $(this.element).find("." + qclass)
            .hide();
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