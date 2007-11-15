# Copyright (c) 2007, Alex Drummond <a.d.drummond@gmail.com>
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY Alex Drummond ``AS IS'' AND ANY
# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL Alex Drummond BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

#
# This module allows safe generation of data.js files. It defines
# classes for representing datasets as Python data structures and a
# function for outputting a data.js file given such a data structure.
#
# See README for more info.
#

import types
import StringIO
import itertools

class BadDatasetError(Exception):
    def __init__(self, *args):
        super(BadDatasetError, self).__init__(*args)

class Dataset(object):
    def __init__(self, conf, sentences):
        assert type(sentences) == types.ListType
        for s in sentences:
            assert type(s) == Sentence
        assert type(conf) == types.DictType or type(conf) == types.DictionaryType or \
               type(conf) == types.DictProxyType
        for k,v in conf.iteritems():
            if not k in itertools.imap(lambda x: x[0], CONF_VARS):
                raise BadDatasetError("'%s' is not a recognized configuration variable" % k)
            cv = filter(lambda x: x[0] == k, CONF_VARS)
            assert len(cv) == 1
            if not type(v) in cv[0][1:]:
                raise BadDatasetError("Bad type for configuration variable '%s'" % k)
        self.conf = conf
        self.sentences = sentences

class Question(object):
    def __init__(self, question, *answers):
        assert type(question) == types.StringType or type(question) == types.UnicodeType
        assert type(answers) == types.ListType
        for a in answers:
            assert type(a) == types.StringType or type(a) == types.UnicodeType
        self.question = question
        self.answers = answers

def type_(x): return type(x)
class Sentence(object):
    def __init__(self, type, group, words, question=None):
        assert type_(type) == types.StringType or type_(type) == types.IntType or \
               type_(type) == types.LongType or type_(type) == types.UnicodeType
        assert type_(group) == types.StringType or type_(group) == types.IntType or \
               type_(group) == types.LongType or type_(group) == types.UnicodeType or \
               type_(group) == types.NoneType
        assert type_(question) == Question or type_(question) == types.NoneType
        assert type_(words) == types.StringType or type_(words) == types.UnicodeType
        for w in words:
            assert type_(w) == types.StringType or type_(w) == types.UnicodeType
        self.type = type
        self.group = group
        self.words = words
        self.question = question

class ShuffleSequence(object):
    def __init__(s):
        self.s = s

    def js_string(): return s

class AcceptabilityRatings(object):
    def __init__(self, r):
        assert type(r) == types.ListType
        for e in r:
            if type(e) == types.ListType:
                assert len(e) == 2 and (type(e[0]) == types.StringType or \
                       type(e[0]) == types.UnicodeType) and \
                       (type(e[1]) == types.StringType or \
                        type(e[1]) == types.UnicodeType)
            elif type(e) != types.StringType and type(e) != types.UnicodeType:
                assert False
        self.ratings = r

CONF_VARS = [
    ['serverURI', types.StringType, types.UnicodeType],
    ['experimentType', types.StringType, types.UnicodeType],
    ['instructionsHTML', types.StringType, types.UnicodeType],
    ['practiceSentenceType', types.StringType, types.UnicodeType],
    ['shuffleSequence', ShuffleSequence],
    ['pageTitle', types.StringType, types.UnicodeType],
    ['showProgressBar', types.BooleanType, types.IntType, types.LongType],
    ['answerInstructions', types.StringType, types.UnicodeType],
    ['flagWrongAnswers', types.BooleanType, types.IntType, types.LongType],
    ['wordTime', types.IntType, types.LongType],
    ['wordPauseTime', types.IntType, types.LongType],
    ['acceptabilityRatingsPreamble', types.StringType, types.UnicodeType],
    ['acceptabilityRatings', AcceptabilityRatings],
    ['judgmentTimeFrame', types.IntType, types.LongType],
    ['showCounter', types.BooleanType, types.IntType, types.LongType],
    ['practiceJudgmentTimeFrame', types.IntType, types.LongType]
]

def string_to_js_literal(s):
    ALLOWED = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\
0123456789!@#$%^&*()_+-={}[]|:;\?/>.<,~`"
    PRETTY = { "\n" : "\\n", "\r" : "\\r", "\t" : "\\t", "'" : "\\'", '"' : '\\"' }

    o = StringIO.StringIO()
    o.write('"')

    for c in s:
        if c in ALLOWED:
            o.write(c)
        elif PRETTY.has_key(c):
            o.write(PRETTY[c])
        else:
            h = "%x" % ord(c)
            h = ('0' * (4 - len(h))) + h
            o.write("\\x%s" % h)
    
    o.write('"')
    return o.getvalue()

def pyval_to_jsval(x):
    if type(x) == types.IntType or type(x) == types.LongType:
        return "%i" % x
    elif type(x) == types.StringType or type(x) == types.UnicodeType:
        return string_to_js_literal(x)
    elif type(x) == types.BooleanType:
        return x and "true" or "false";
    elif type(x) == types.NoneType:
        return "null";
    elif type(x) == ShuffleSequence:
        return x.js_string()
    elif type(x) == AcceptabilityRatings:
        def elem(x):
            if type(x) == types.StringType or type(x) == types.UnicodeType:
                return string_to_js_literal(x)
            else: # It's a pair (list) of strings
                return '[' + string_to_js_literal(x[0]) + ', ' + string_to_js_literal(x[1]) + ']'
        return '[' + (', '.join(map(elem, x.ratings))) + ']'
    else:
        assert False

def output_dataset(dataset, writer):
    writer.write("//\n// Configuration variables.\n//\n")
    for k,v in dataset.conf.iteritems():
        writer.write("var %s = %s;\n" % (k, pyval_to_jsval(v)))
    writer.write("\n")

    writer.write("//\n// Sentences.\n//\n")
    writer.write("var sentences_strings = [\n\n")

    for i in xrange(len(dataset.sentences)):
        s = dataset.sentences[i]

        writer.write("[[%s, %s], %s" %
                     (pyval_to_jsval(s.type), pyval_to_jsval(s.group), pyval_to_jsval(s.words)))

        if s.question:
            writer.write("[%s", pyval_to_jsval(s.question.question))
            for j in xrange(len(s.question.answers)):
                writer.write(pyval_to_jsval(s.question.answers[j]))
                if j < len(s.question.answers) - 1:
                    writer.write(", ")
            writer.write("]")

        writer.write("]")

        if i < len(dataset.sentences) - 1:
            writer.write(",\n");

    writer.write("\n\n];\n")

#
# TEST CODE.
#
#
#d = Dataset({ 'wordPauseTime' : 500, 'acceptabilityRatings' : AcceptabilityRatings([["f", "g"], ["f", "g"]]) }, [Sentence(1, None, "foo '\xE6' foo")])
#s = StringIO.StringIO()
#output_dataset(d, s)
#print s.getvalue()
