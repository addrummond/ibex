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
    assert(this.transfer == "click" || typeof(this.transfer) == "number",
           "Value of 'transfer' option of Message must either be the string 'click' or a number");

    if (this.transfer == "click") {
        this.continueMessage = dget(options, "continueMessage", "Click here to cotinue.");
        var m = document.createElement("p");
        var a = document.createElement("a");
        a.href = "";
        a.className = "continue-link";
        a.onclick = function() { finishedCallback(); return false; }
        a.appendChild(document.createTextNode("\u2192 " + this.continueMessage));
        m.appendChild(a);
        div.appendChild(m);
    }
    else {
        utils.setTimeout(finishedCallback, this.transfer);
    }
}

Message.htmlDescription = function (opts) {
    var d = htmlCodeToDOM(opts.html);
    return truncateHTML(d, 100);
}
