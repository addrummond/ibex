/* This software is licensed under a BSD license; see the LICENSE file for details. */

Message.obligatory = ["html"];
Message.countsForProgressBar = false;

function Message(div, options, finishedCallback, utils) {
    this.name = "Message";
    this.div = div;
    this.options = options;
    this.hideProgressBar = dget(options, "hideProgressBar", true);

    this.html = options.html;
    div.className = "message";
    div.innerHTML = this.html;

    // Bit of copy/pasting from 'Separator' here.
    this.transfer = dget(options, "transfer", "keypress");
    assert(this.transfer == "keypress" || typeof(this.transfer) == "number",
           "Value of 'transfer' option of Message must either be the string 'keypress' or a number");

    if (this.transfer == "keypress") {
        this.handleKey = function(code, time) {
            finishedCallback(null);
            return true;
        }
    }
    else {
        utils.setTimeout(finishedCallback, this.transfer);
    }
}

Message.htmlDescription = function (opts) {
    var d = document.createElement("div");
    d.innerHTML = opts.html;
    return truncateHTML(d, 100);
}

