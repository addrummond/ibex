Separator.obligatory = [];

function Separator(div, options, finishedCallback) {
    this.name = "Separator";

    div.appendChild(document.createTextNode(options.dget("message", "Press space to continue")));

    this.handleKey = function(code, time) {
        finishedCallback(null);
    }
}