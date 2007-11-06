var body = document.getElementsByTagName("body")[0];

var counter = readCookie("counter");
if (parseInt(counter) == NaN) {
    counter = Math.floor(Math.random() * 10000);
}

function Sentence(type, group, preamble, words, question, num) {
    this.type = type;
    this.group = group;
    this.preamble = preamble;
    this.words = words;
    this.question = question;
    this.num = num;
}

function makeSentence(a) {
    var type = null;
    var group = null; // Default group
    var words = null;
    var preamble = null;
    var sString = null;

    if (typeof(a[0]) != "object") {
        type = a[0];
    }
    else {
        type = a[0][0]
        group = a[0][1]
    }
    
    if (typeof(a[1]) == "string") {
        sString = a[1];
    }
    else {
        sString = a[1][1];
        preamble = a[1][0];
    }
    words = sString.split(/\s+/);
    for (var j = 0; j < words.length; ++j) {
        words[j] = words[j].replace(/^\s+|\s+$/g,"");
    }

    var question = null;
    if (a.length > 2) {
        if (a[2].length <= 2)
            alert("WARNING: Badly formed comprehension question; ignoring");
        else question = a[2];
    }

    return new Sentence(
        type,
        group,
        preamble,
        words,
        question,
        i + 1
    );
}

var initialSentencesArray = map(makeSentence, sentences_strings);
var mungedSentencesArray = mungGroups(initialSentencesArray, counter);
var sentences = runShuffleSequence(mungedSentencesArray, conf_shuffleSequence);

var progressBarHeight;
var progressBarWidth;
var showProgress;
var barContainer;
if (conf_showProgressBar) {
    progressBarHeight = "0.8em";
    progressBarWidth = sentences.length * 5 < 300 ? sentences.length * 5 : 300;
    showProgress = document.createElement("div");
    showProgress.className = "lpad";
    showProgress.style.marginTop = "2em";
    barContainer = document.createElement("div");
    barContainer.className = "bar-container"
    barContainer.style.height = progressBarHeight;
    barContainer.style.width = progressBarWidth;
    var bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = "0";
    bar.style.height = progressBarHeight;
    barContainer.appendChild(bar);
    var p = document.createElement("p");
    p.className = "progress-text"
    p.appendChild(document.createTextNode("progress"));
    showProgress.appendChild(barContainer);
    showProgress.appendChild(p);
}

var showSentence = document.createElement("p");
showSentence.style.paddingTop = "1em";
showSentence.appendChild(document.createElement("div")); // Initial dummy child.

var showProgressAndSentenceGroup = document.createElement("div");
if (conf_showProgressBar)
    showProgressAndSentenceGroup.appendChild(showProgress);
var practiceP = document.createElement("p");
practiceP.className = "lpad practice-text";
practiceP.appendChild(
    document.createTextNode(
        "Practice sentence" +
        ((conf_experimentType == "speeded acceptability" && conf_practiceJudgmentTimeFrame > conf_judgmentTimeFrame)
            ?
            ". You will be given additional time to answer."
            :
            "")));
practiceP.style.visibility = sentences[0].type == conf_practiceSentenceType ? 'visible' : 'hidden';
showProgressAndSentenceGroup.appendChild(practiceP);
showProgressAndSentenceGroup.appendChild(showSentence);

var sendingResults = document.createElement("p")
sendingResults.className = "sending-results"
var spinSpan = document.createElement("span");
spinSpan.appendChild(document.createTextNode(""));
sendingResults.appendChild(spinSpan);
var sendingResultsMessage = document.createElement("span");
sendingResultsMessage.appendChild(document.createTextNode(" Sending results to server..."));
sendingResults.appendChild(sendingResultsMessage);

var resultsHaveBeenSentToServer = false;

var dashedSentences = map(function (x) { return new DashedSentence(x); }, sentences);

var questionsPs;
var answerNumbers;
if (conf_experimentType == "self-paced reading") {
    questionPs = new Array(sentences.length);
    var answerNumbers = new Array(sentences.length);
    for (var i = 0; i < sentences.length; ++i) {
        // Is there a comprehension question for this sentence?
        if (! sentences[i].question) { continue; }

        var p = document.createElement("p");
        p.className = "question";
        questionPs[i] = p;

        p.appendChild(document.createTextNode(sentences[i].question[0]));

        var correctAnswer = sentences[i].question[1];
        var shuffled = sentences[i].question.slice(1);
        // Special hack: if the options are "yes" and "no", we always present them
        // in "yes/no" order.
        var lc0 = shuffled[0].toLowerCase();
        var lc1 = shuffled[1].toLowerCase();
        if ((lc0 == "yes" || lc0 == "no") && (lc1 == "yes" || lc1 == "no")) {
            shuffled = [lc0 == "yes" ? shuffled[0] : shuffled[1],
                        lc1 == "yes" ? shuffled[0] : shuffled[1]];
        }
        else {
            fisherYates(shuffled);
        }

        // Record the index of the correct answer in the answerNumbers array;
        for (var j = 0; j < shuffled.length; ++j)
            if (shuffled[j] == correctAnswer)
                answerNumbers[i] = j;

        var ol = document.createElement("ol");
        for (var j = 0; j < shuffled.length; ++j) {
            if (shuffled[j] == correctAnswer)
                answerNumbers[i] = j + 1;

            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = "javascript:handleAnswer(" + (j + 1) + ");";
            a.appendChild(document.createTextNode(shuffled[j]));
            li.appendChild(a);
            ol.appendChild(li);
        }
        p.appendChild(ol);

        var div = document.createElement("div");
        div.className = "number-message"
        div.appendChild(document.createTextNode(conf_answerInstructions));
        p.appendChild(div);
    }
}
var ratingP;
var counterP;
var counterText;
if (conf_experimentType == "speeded acceptability") {
    ratingP = document.createElement("div");
    ratingP.className = "rating";
    ratingP.appendChild(document.createTextNode(conf_acceptabilityRatingsPreamble));

    // Include a counter if there's a limited amount of time.
    // NOTE: currently this won't work for the case where you only have timings for
    // practice sentences, but who'd want to do that?
    if (conf_judgmentTimeFrame && conf_showCounter) {
        var counterDiv = document.createElement("div");
        counterText = document.createTextNode("");
        counterDiv.appendChild(counterText);
        counterDiv.className = "counter-number";
        counterP = document.createElement("p");
        counterP.className = "counter";
        counterP.appendChild(counterDiv);
        ratingP.appendChild(counterP);
    }

    d = document.createElement("div");
    d.className = "rating-choice";
    for (var i = 0; i < conf_acceptabilityRatings.length; ++i) {
        var a = document.createElement("a");
        a.href = "javascript:handleAnswer(" + (i + 1) + ");"; // CODE DUPLICATION

        var text = typeof(conf_acceptabilityRatings[i]) == "object" ?
                   conf_acceptabilityRatings[i][0] :
                   conf_acceptabilityRatings[i];

        a.appendChild(document.createTextNode(text));
        d.appendChild(a);
        if (i + 1 < conf_acceptabilityRatings.length) { 
            d.appendChild(document.createTextNode(" -- "));
        }
    }
    ratingP.appendChild(d);

    var p = document.createElement("p");
    p.className = "number-message";
    p.appendChild(document.createTextNode(conf_answerInstructions));
    ratingP.appendChild(p);
}

var pressSpaceP = document.createElement("p");
pressSpaceP.className = "lpad next-sentence-message";
pressSpaceP.appendChild(
    document.createTextNode("Press space to continue")
);
var youbadPressSpaceP = document.createElement("p");
youbadPressSpaceP.className = "lpad next-sentence-message";
var bold = document.createElement("b");
if (conf_experimentType == "speeded acceptability")
    bold.appendChild(document.createTextNode("You didn't answer the question in time."));
else bold.appendChild(document.createTextNode("You answered he comprehension question incorrectly."));
bold.appendChild(document.createElement("br"));
bold.appendChild(document.createElement("br")); // Ugly...
youbadPressSpaceP.appendChild(bold);
youbadPressSpaceP.appendChild(
    document.createTextNode("Press space to continue.")
);

var times;
if (conf_experimentType == "self-paced reading") {
    times = new Array(sentences.length);
    for (var i = 0; i < times.length; ++i) {
        times[i] = new Array(sentences[i].words.length - 1);
    }
}
var answers = new Array(sentences.length); // Answers to comprehension Qs.
var newlines = new Array(sentences.length); // Records of when reader went on
                                            // to another line.
for (var i = 0; i < newlines.length; ++i) {
    newlines[i] = new Array(sentences[i].words.length - 1);
}
var currentSentence = 0;
var currentWord = 0;
var currentTime = 0;
var previousTime = null;
var state = "initial"; // Either "initial", "sentence", "question",
                       // "press_space" or "finished".

function setProgressBar(fraction) {
    if (conf_showProgressBar)
        bar.style.width = Math.round(progressBarWidth * fraction) + "px";
}

function getJudgmentTimeFrame() {
    if (sentences[currentSentence].type == 0)
        return conf_practiceJudgmentTimeFrame;
    else return conf_judgmentTimeFrame;
}

function goToNextSentence() {
    ++currentSentence;
    if (currentSentence == sentences.length) {
        state = "finished";
        setProgressBar(1);
        sendResults();
        return;
    }
    else {
        // Show the new sentence (note that currentSentence has been
        // incremented above).
        showSentence.replaceChild(dashedSentences[currentSentence].sentenceDiv,
                                  showSentence.firstChild);
        setProgressBar(currentSentence / sentences.length);

        // Is this a practice sentence?
        if (sentences[currentSentence].type != conf_practiceSentenceType)
            practiceP.style.visibility = "hidden";
        else practiceP.style.visibility = "visible";

        previousTime = null;
        currentWord = 0;
        currentTime = 0;

        state = "sentence";
    }
}

function handleAnswer(index) {
    if (conf_experimentType == "self-paced reading") {
        if (index == answerNumbers[currentSentence]) {
            answers[currentSentence] = 1;
            goToNextSentence();
        }
        else {
            answers[currentSentence] = 0;
            if (conf_flagWrongAnswers) {
                state = "press_space";
                showSentence.replaceChild(youbadPressSpaceP, showSentence.firstChild);
            }
        }
    }
    else if (conf_experimentType = "speeded acceptability") {
        answers[currentSentence] = conf_acceptabilityRatings[index];
                
        // We want a "press space" message (unless this is the last sentence).
        if (currentSentence < sentences.length - 1) {
            showSentence.replaceChild(pressSpaceP, showSentence.firstChild);
            state = "press_space";
        }
        else {
            goToNextSentence();
        }
    }
}

function handleKeyPress(k) {
    if (conf_experimentType == "self-paced reading") {
        if (k - 48 < sentences[currentSentence].question.length && k - 48 > 0) {
            handleAnswer(k - 48);
        }
    }
    else if (conf_experimentType == "speeded acceptability") {
        // Clear the countdown thread immediately.
        if (startCountdownTimeoutId) {
            clearTimeout(startCountdownTimeoutId);
        }

        for (var i = 0; i < conf_acceptabilityRatings.length; ++i) {
            var toMatch;
            if (typeof(conf_acceptabilityRatings[i]) != "object")
                toMatch = conf_acceptabilityRatings[i][0];
            else toMatch = conf_acceptabilityRatings[i][1];

            if (toMatch[0].toLowerCase().charCodeAt(0) == k ||
                toMatch[0].toUpperCase().charCodeAt(0) == k) {
                handleAnswer(i);
                break;
            }
        }
    }
}

var currentCount;
var startCountdownTimeoutId = null;
function startCountdown(from)
{
    if (startCountdownTimeoutId) {
        clearTimeout(startCountdownTimeoutId);
        startCountdownTimeoutId = null;
    }

    currentCount = from;
    function setTimeoutCallback()
    {
        --currentCount;
        if (currentCount == 0) {
            // The user didn't answer the question in time.

            // Record this in the answers array.
            answers[currentSentence] = "TIMEOUT";

            state = "press_space";
            showSentence.replaceChild(youbadPressSpaceP,
                                      showSentence.firstChild);

            // Note that we don't set the timeout again.
            startCountdownTimeoutId = null;
        }
        else {
            if (conf_showCounter) {
                counterDiv.replaceChild(document.createTextNode(currentCount), counterDiv.firstChild);
            }
            startCountdownTimeoutId = setTimeout(setTimeoutCallback, 1000);
        }
    }
    startCountdownTimeoutId = setTimeout(setTimeoutCallback, 1000);
}

function blankCurrentWord()
{
    if (currentWord > 0)
        dashedSentences[currentSentence].blankWord(currentWord - 1);
}

function advanceWord(time)
{
    var onto_newline = dashedSentences[currentSentence].showWord(currentWord);
    newlines[currentSentence][currentWord - 1] = onto_newline;

    // Don't record a time if this was the keypress that makes the
    // last word of a sentence disappear.
    if (currentWord < sentences[currentSentence].words.length) {
        if (time) {
            // Don't record a time if this is the first word in the
            // sentence.
            if (previousTime) {
                times[currentSentence][currentTime++] = time - previousTime;
                previousTime = time;
            }
            else {
                previousTime = time;
            }
        }
        ++currentWord;
    }
    else {
        // Is there a comprehension/rating question for this sentence?
        if ((conf_experimentType == "speeded acceptability") ||
            sentences[currentSentence].question) {
            state = "question";
            if (conf_experimentType == "self-paced reading") {
                showSentence.replaceChild(
                    questionPs[currentSentence],
                    showSentence.firstChild
                );
            }
            else if (conf_experimentType == "speeded acceptability") {
                // Start the counter, if there's a time limit.
                if (getJudgmentTimeFrame()) {
                    if (conf_showCounter) {
                        counterDiv.replaceChild(document.createTextNode(getJudgmentTimeFrame()), counterDiv.firstChild);
                    }
                    startCountdown(getJudgmentTimeFrame());
                }
                showSentence.replaceChild(
                    ratingP,
                    showSentence.firstChild
                )
            }
        }
        else {
            answers[currentSentence] = -1; // Indicate that there
                                           // was no question.
            // Don't show the "press space" message if that was
            // the last sentence.
            if (currentSentence < sentences.length - 1) {
                state = "press_space";
                showSentence.replaceChild(pressSpaceP,
                                          showSentence.firstChild);
            }
            else {
                goToNextSentence();
                // 'finished' variable now set to true.
            }
        }
    }
}

var autoSpacebarTimeoutId = null;
var autoSpacebarState = null;
function startAutoSpacebar()
{
    if (autoSpacebarTimeoutId) {
        clearTimeout(autoSpacebarTimeoutId);
        autoSpacebarTimeoutId = null;
    }

    autoSpacebarState = 0; // or 1

    function timeoutCallback()
    {
        if (state == "sentence") {
            if (autoSpacebarState == 0) {
                autoSpacebarTimeoutId = setTimeout(timeoutCallback, conf_wordPauseTime);
                autoSpacebarState = 1;
                blankCurrentWord();
            }
            else if (autoSpacebarState == 1) {
                autoSpacebarTimeoutId = setTimeout(timeoutCallback, conf_wordTime);
                autoSpacebarState = 0;
                advanceWord(null);
            }
        }
        // If the state changes from "sentence", this callback
        // will become inactive.
    }
    autoSpacebarTimeoutId = setTimeout(timeoutCallback, conf_wordTime);
}

// Wait for keyboard input.
document.onkeydown = 
    function (e) {
        // Record the time as soon as possible.
        var time = new Date().getTime();

        // For IE.
        if (! e) {
            e = window.event;
        }

        if (e.keyCode == 32) {
            if (state == "initial") {
                state = "sentence";
                document.getElementById("instructions").style.visibility = "hidden";
                showSentence.replaceChild(dashedSentences[0].sentenceDiv, showSentence.firstChild);
                // Substitute the progress/sentece stuff for the instructions.
                body.replaceChild(showProgressAndSentenceGroup,
                                  document.getElementById("instructions"));
                if (conf_experimentType == "speeded acceptability") {
                    startAutoSpacebar();
                }
            }
            else if (conf_experimentType == "self-paced reading" && state == "sentence") {
                blankCurrentWord();
                advanceWord(time);
            }
            else if (state == "press_space") { // I.e. "press space to continue".
                goToNextSentence();
                if (conf_experimentType == "speeded acceptability" ) {
                    if (startCountdownTimeoutId) {
                        clearTimeout(startCountdownTimeoutId);
                    }
                    startAutoSpacebar();
                }
            }

            // Prevents this being handled by the browser as a pagedown.
            return false;
        }
        else if ((e.keyCode >= 48 && e.keyCode <= 57) || // Digits / number pad digits.
                 (e.keyCode >= 96 && e.keyCode <= 105) ||
                 (e.keyCode >= 97 && e.keyCode <= 120) || // Letters.
                 (e.keyCode >= 65 && e.keyCode <= 90)) {
            if (state == "question") {
                // Convert numeric keypad codes to ordinary keypad codes.
                var k = (e.keyCode >= 96 && e.keyCode <= 105) ? e.keyCode - 48 : e.keyCode;
                
                handleKeyPress(k); // Calls goToNextSentence()
            }
        }
    };

function indicateThatResultsAreBeingSent()
{
    body.replaceChild(sendingResults, showProgressAndSentenceGroup);
    var spinChars = ["\u2013", "\\", "|", "/"]
    var spinCharsPos = 0
    function timerCallback()
    {
        // Stop the callback if spinSpan no longer has any children.
        if (spinSpan.childNodes.length == 0) { return; }

        spinSpan.replaceChild(document.createTextNode(spinChars[spinCharsPos]),
                              spinSpan.firstChild);
        ++spinCharsPos;
        if (spinCharsPos == spinChars.length) {
            spinCharsPos = 0;
        }
        setTimeout(timerCallback, 200);
    }
    timerCallback();
}

function indicateThatResultsWereSent(success)
{
    spinSpan.removeChild(spinSpan.firstChild); // This will cause the callback to stop.
    if (success) {
        sendingResultsMessage.replaceChild(
            document.createTextNode("The results were successfully sent to the server. Thanks!"),
            sendingResultsMessage.firstChild
        );
    }
    else {
        sendingResultsMessage.replaceChild(
            document.createTextNode("There was an error sending the results to the server."),
            sendingResultsMessage.firstChild
        );
    }
}

function getXMLHttpRequest()
{
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest()
    }
    else if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP")
    }
    else {
        return null;
    }
}

// Make a post request to a given address. Address may either be a domain
// or an IP.
function sendResults(address, port)
{
    if (resultsHaveBeenSentToServer)
        { return; }

    indicateThatResultsAreBeingSent();

    var xmlhttp = getXMLHttpRequest();
    if (! xmlhttp) {
        indicateThatResultsWereSent(false);
        return;
    }

    // Prepare the POST data.
    if (conf_experimentType == "self-paced reading") {
        data = ["self-paced reading", sentences, times, answers, newlines].toJSONString();
    }
    else if (conf_experimentType == "speeded acceptability") {
        var answerValues = new Array(answers.length);
        for (var i = 0; i < answers.length; ++i) {
            if (typeof(answers[i]) == "object")
                answerValues[i] = answers[i][0];
            else answerValues[i] = answers[i];
        }
        data = ["speeded acceptability", sentences, answerValues, newlines].toJSONString();
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                // Great, we successfully sent the results to the server.
                resultsHaveBeenSentToServer = true;
                indicateThatResultsWereSent(true);
            }
            else {
                // There was an error sending the results.
                indicateThatResultsWereSent(false);
            }
        }
    };
    xmlhttp.open("POST", conf_serverURI, true);
    xmlhttp.send(data);
}

document.getElementById("instructions").style.visibility = "visible";
