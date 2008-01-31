Separator.obligatory = [];

function Separator(div, options, finishedCallback, utils) {
    this.name = "Separator";
    this.options = options;

    this.style = utils.getValueFromPreviousItem("failed") ? "error" : "normal";
    var x = utils.getValueFromPreviousItem("style");
    if (x) this.style = x;
    assert(this.style == "normal" || this.style == "error", "'style' property of Separator must either be 'normal' or 'error'");

    var normal_message = options.dget("normal message", "Press any key to continue");
    var x = utils.getValueFromPreviousItem("normal message");
    if (x) normal_message = x;

    var error_message = options.dget("error message", "You answered incorrectly. Press any key to continue");
    var x = utils.getValueFromPreviousItem("error message");
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

    this.handleKey = function(code, time) {
        finishedCallback(null);
    }
}
