Separator.obligatory = [];

function Separator(div, options, finishedCallback, utils) {
    this.name = "Separator";

    if (utils.getValueFromPreviousItem("failed")) {
        div.className = "next-item-failure-message";
        div.appendChild(document.createTextNode(options.dget("failure message", "Wrong. Press any key to continue")));
    }
    else {
        div.className = "next-item-message";
        div.appendChild(document.createTextNode(options.dget("message", "Press any key to continue")));
    }

    this.handleKey = function(code, time) {
        finishedCallback(null);
    }
}