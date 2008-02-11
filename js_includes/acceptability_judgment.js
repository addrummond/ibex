AcceptabilityJudgment.obligatory = ["s", "q", "as"];

function AcceptabilityJudgment(div, options, finishedCallback, utils) {
    var opts = new Hashtable();
    var qopts = new Hashtable();
    qopts.put("q", options.get("q"));
    qopts.put("as", options.get("as"));
    qopts.put("has correct", options.get("has correct"));
    qopts.put("random order", options.dget("random order", false));
    qopts.put("show numbers", options.get("show numbers"));
    qopts.put("timeout", options.get("timeout"));
    opts.put("name", "AcceptabilityJudgment");
    opts.put("children", [FlashSentence, ["s", options.dget("s")], Question, hash_to_flat_alist(qopts)]);
    opts.put("triggers", [1]);
    return new VBox(div, opts, finishedCallback, utils);
}