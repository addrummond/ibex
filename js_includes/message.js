Message.obligatory = ["html"];

function Message(div, options, finishedCallback) {
    this.name = "Message";
    this.options = options;
    this.countsForProgressBar = false;

    this.html = options.get("html");
    div.innerHTML = this.html;

    this.handleKey = function(code, time) {
        finishedCallback(null);
    }
}
