Separator.obligatory = [];

function Separator(div, options, finishedCallback, utils) {
    this.name = "Separator";

    this.flagIncorrect = options.dget("flag incorrect", true);

    var p = document.createElement("p");
    div.appendChild(p);
    if (this.flagIncorrect && utils.getValueFromPreviousItem("failed")) {
        div.className = "next-item-failure-message";
        p.appendChild(document.createTextNode(options.dget("failure message", "Wrong. Press any key to continue")));
    }
    else {
        div.className = "next-item-message";
        p.appendChild(document.createTextNode(options.dget("message", "Press any key to continue")));
    }

    this.handleKey = function(code, time) {
        finishedCallback(null);
    }
}