Separator.obligatory = [];
Separator.countsForProgressBar = false;

function Separator(div, options, finishedCallback, utils) {
    this.name = "Separator";
    this.options = options;

    this.style = utils.getValueFromPreviousElement("failed") ? "error" : "normal";
    var x = utils.getValueFromPreviousElement("style");
    if (x) this.style = x;
    assert(this.style == "normal" || this.style == "error", "'style' property of Separator must either be 'normal' or 'error'");

    this.transfer = dget(options, "transfer", "keypress");
    assert(this.transfer == "keypress" || typeof(this.transfer) == "number",
           "Value of 'transfer' option of Separator must either be the string 'keypress' or a number");

    var normal_message = dget(options, "normalMessage", "Press any key to continue.");
    var x = utils.getValueFromPreviousElement("normalMessage");
    if (x) normal_message = x;

    var error_message = dget(options, "errorMessage", "Wrong. Press any key to continue.");
    var x = utils.getValueFromPreviousElement("errorMessage");
    if (x) error_message = x;

    var p = document.createElement("p");
    div.appendChild(p);
    if (this.style == "error") {
        div.className = "next-item-failure-message";
        p.appendChild(document.createTextNode(error_message));
    }
    else {
        div.className = "next-item-message";
        p.appendChild(document.createTextNode(normal_message));
    }

    if (this.transfer == "keypress") {
        this.handleKey = function(code, time) {
            finishedCallback(null);
        }
    }
    else {
        utils.setTimeout(function () {
            finishedCallback(null);
        }, this.transfer);
    }
}
