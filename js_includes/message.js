/* This software is licensed under a BSD license; see the LICENSE file for details. */

Message.name = "Message";
Message.obligatory = ["html"];
Message.countsForProgressBar = false;

function Message(div, options, finishedCallback, utils) {
    this.div = div;
    this.options = options;
    this.hideProgressBar = dget(options, "hideProgressBar", true);

    this.html = options.html;
    div.className = "message";
    //div.innerHTML = this.html;
    div.appendChild(htmlCodeToDOM(this.html));

    // Bit of copy/pasting from 'Separator' here.
    this.transfer = dget(options, "transfer", "click");
    assert(this.transfer == "click" || this.transfer == "keypress" || typeof(this.transfer) == "number",
           "Value of 'transfer' option of Message must either be the string 'click' or a number");

    if (this.transfer == "click") {
        this.continueMessage = dget(options, "continueMessage", "Click here to continue.");
        this.consentRequired = dget(options, "consentRequired", false);
        this.consentMessage = dget(options, "consentMessage", "I have read the above and agree to do the experiment.");
        this.consentErrorMessage = dget(options, "consentErrorMessage", "You must consent before continuing.");

        // Add the consent checkbox if necessary.
        var checkbox = null;
        if (this.consentRequired) {
            var names = { };
            var dom = jsHTML(
                ["form",
                 [["table", {style: "border: none; padding: none; margin: none;"}],
                  ["tbody",
                   ["tr",
                    [["td", {style: "border: none; padding-left: 0; margin-left: 0;"}], [["input:checkbox", {type: "checkbox"}]]],
                    [["td", {style: "border: none; margin-left: 0; padding-left: 1em;"}], this.consentMessage]
                ]]]],
                names
            );
            checkbox = names.checkbox;
            this.div.appendChild(dom);
        }

        var t = this;
        // Get a proper lexical scope for the checkbox element so we can capture it in a closure.
        (function (checkbox) {
            var m = document.createElement("p");
            m.style.clear = "left";
            var a = document.createElement("a");
            a.href = "";
            a.className = "continue-link";
            a.onclick = function() {
                if ((! checkbox) || checkbox.checked)
                    finishedCallback();
                else
                    alert(t.consentErrorMessage); 
                return false;
            }
            a.appendChild(document.createTextNode("\u2192 " + t.continueMessage));
            m.appendChild(a);
            div.appendChild(m);
        })(checkbox);
    }
    else if (this.transfer == "keypress") {
        this.handleKey = function(code, time) {
            finishedCallback(null);
            return false;
        }
    }
    else {
        assert(! this.consentRequired, "The 'consentRequired' option of the Message controller can only be set to true if the 'transfer' option is set to 'click'.");
        utils.setTimeout(finishedCallback, this.transfer);
    }
}

Message.htmlDescription = function (opts) {
    var d = htmlCodeToDOM(opts.html);
    return truncateHTML(d, 100);
}
