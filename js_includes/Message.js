/* This software is licensed under a BSD license; see the LICENSE file for details. */

define_ibex_controller({
name: "Message",

jqueryWidget: {
    _init: function () {
        this.cssPrefix = this.options._cssPrefix;
        this.utils = this.options._utils;
        this.finishedCallback = this.options._finishedCallback;

        this.html = this.options.html;
        this.element.addClass(this.cssPrefix + "message");
        this.element.append(htmlCodeToDOM(this.html));

        // Bit of copy/pasting from 'Separator' here.
        this.transfer = dget(this.options, "transfer", "click");
        assert((! this.transfer) || this.transfer == "click" || this.transfer == "keypress" || typeof(this.transfer) == "number",
               "Value of 'transfer' option of Message must either be the string 'click' or a number");

        if (this.transfer == "click") {
            this.continueMessage = dget(this.options, "continueMessage", "Click here to continue.");
            this.consentRequired = dget(this.options, "consentRequired", false);
            this.consentMessage = dget(this.options, "consentMessage", "I have read the above and agree to do the experiment.");
            this.consentErrorMessage = dget(this.options, "consentErrorMessage", "You must consent before continuing.");

            // Add the consent checkbox if necessary.
            var checkbox = null;
            if (this.consentRequired) {
                var names = { };
                var checkbox;
                var message;
                var dom =
                    $(document.createElement("form"))
                    .append($(document.createElement("table"))
                            .css('border', 'none').css('padding', 0).css('margin', 0)
                            .append($(document.createElement("tr"))
                                    .append($(document.createElement("td"))
                                            .css('border', 0).css('padding-left', 0).css('margin-left', 0)
                                            .append(checkbox = $(document.createElement("input"))
                                                    .attr('id', 'consent_checkbox')
                                                    .attr('type', 'checkbox')
                                                    .attr('checked', 0)))
                                    .append(message = $(document.createElement("td"))
                                            .css('border', 0).css('margin-left', 0).css('padding-left', 0)
                                            .append($("<label>")
                                                    .attr('for', 'consent_checkbox')
                                                    .text(this.consentMessage)))));

                this.element.append(dom);
                // Change cursor to pointer when hovering over the message (have to use JS because
                // IE doesn't support :hover for anything other than links).
                message.mouseover(function () {
                    message.css('cursor', "default");
                });
            }

            var t = this;
            // Get a proper lexical scope for the checkbox element so we can capture it in a closure.
            // ALEX: Looking at this again, I don't see why it's necessary to create a local scope here
            // but I am leaving it in as I may be missing something and it won't do any harm.
            (function (checkbox) {
                t.element.append(
                    $(document.createElement("p"))
                    .css('clear', 'left')
                        .append($(document.createElement("a"))
                            .attr('href', '')
                            .addClass(t.cssPrefix + 'continue-link')
                            .text("\u2192 " + t.continueMessage)
                            .click(function () {
                                if ((! checkbox) || checkbox.attr('checked'))
                                    t.finishedCallback();
                                else
                                    alert(t.consentErrorMessage);
                                return false;
                            }))
                );
            })(checkbox);
        }
        else if (this.transfer == "keypress") {
            var t = this;
            this.safeBind($(document), 'keydown', function () {
                t.finishedCallback(null);
                return false;
            });
        }
        else if (typeof(this.transfer) == "number") {
            assert(! this.consentRequired, "The 'consentRequired' option of the Message controller can only be set to true if the 'transfer' option is set to 'click'.");
            this.utils.setTimeout(this.finishedCallback, this.transfer);
        }
    }
},

properties: {
    obligatory: ["html"],
    countsForProgressBar: false,
    htmlDescription: function (opts) {
        return truncateHTML(htmlCodeToDOM(opts.html), 100);
    }
}
});