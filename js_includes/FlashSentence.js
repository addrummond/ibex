/* This software is licensed under a BSD license; see the LICENSE file for details. */

(function () {
var soundId = 0;

define_ibex_controller({
name: "FlashSentence",

init: function () {

},

jqueryWidget: {
    _init: function () {
        var self = this;
        self.cssPrefix = self.options._cssPrefix;

        var $loading;
        var doneLoading = false;
        if (typeof(self.options.s) != "string") {
            if (self.options.s.audio) {
                if (self.options.audioMessage) {
                    self.element.append($loading = $("<div>").addClass(self.cssPrefix + 'loading'));
                    setTimeout(function () {
                        if (! doneLoading)
                            $loading.text(conf_loadingMessage);
                    }, 250);
                }
                withSoundManager(completeInit);
            }
            else {
                self.sentenceDom = htmlCodeToDOM(self.options.s)
                completeInit();
            }
        }
        else {
            self.sentenceDom = $("<div>").text(self.options.s);
            completeInit();
        }
        this.sentenceDescType = dget(this.options, "sentenceDescType", "literal");
        assert(this.sentenceDescType == "literal", "Bad value for 'sentenceDescType' option of FlashSentence controller ('md5' no longer supported).");

        function completeInit(sm) {
            if (sm) {
                if (self.options.audioMessage) {
                    if (typeof(self.options.audioMessage) != "string") {
                        self.sentenceDom = $(htmlCodeToDOM(self.options.audioMessage));
                    }
                    else {
                        self.sentenceDom = $("<div>").text(self.options.audioMessage);
                    }
                }
                var names = null;
                if ($.isArray(self.options.s.audio))
                    names = self.options.s.audio;
                else
                    names = [self.options.s.audio];
                var urls = [ ];
                for (var i = 0; i < names.length; ++i) {
                    if (names[i].match(/^(?:https?)|(?:ftps?):\/\//))
                        urls.push(names[i]);
                    else
                        urls.push(__server_py_script_name__ + '?resource=' + escape(names[i]));
                }
                var sids = [ ];
                for (var i = 0; i < names.length; ++i)
                    sids.push(soundId++);
                for (var i = 0; i < names.length; ++i)
                    sm.createSound('sound' + sids[i], urls[i]);

                var nextSoundToPlayIndex = 0;

                function hideSD() { if (self.sentenceDom) self.sentenceDom.hide(); }
                if (self.options.audioTrigger == "click") {
                    self.sentenceDom.css('cursor', 'pointer');
                    self.sentenceDom.click(function () {
                        hideSD();
                        sm.play('sound' + sids[nextSoundToPlayIndex++], { onfinish: fin });
                    });
                }
                else { // Immediate
                    hideSD();
                    sm.play('sound' + sids[nextSoundToPlayIndex++], { onfinish: fin });
                }

                function fin() {
                    if (nextSoundToPlayIndex >= names.length)
                        setTimeout(function () { self.finishedCallback([[["Sentence (or sentence MD5)", self.sentenceMD5]]]); }, 200);
                    else
                        sm.play('sound' + sids[nextSoundToPlayIndex++], { onfinish: fin });
                }
            }

            self.finishedCallback = self.options._finishedCallback;
            self.utils = self.options._utils;

            self.timeout = dget(self.options, "timeout", 2000);

            self.sentenceMD5 = csv_url_encode(self.options.s.html ? self.options.s.html : (self.options.s.audio ? self.options.s.audio+'' : (self.options.s+'')));

            self.element.addClass(self.cssPrefix + "flashed-sentence");
            if (self.sentenceDom) {
                if ($loading) {
                    doneLoading = true;
                    $loading.replaceWith(self.sentenceDom)
                }
                else
                    self.element.append(self.sentenceDom);
            }

            if (self.timeout) {
                self.utils.setTimeout(function() {
                    self.finishedCallback([[["Sentence (or sentence MD5)", self.sentenceMD5]]]);
                }, self.timeout);
            }
            else if (! self.options.s.audio) {
                // Give results without actually finishing.
                if (self.utils.setResults)
                    self.utils.setResults([[["Sentence (or sentence MD5)", self.sentenceMD5]]]);
            }
        }
    }
},

properties: {
    obligatory: ["s"],
    htmlDescription: function (opts) {
        return $(document.createElement("div")).text(opts.s)[0];
    }
}
});

})();
