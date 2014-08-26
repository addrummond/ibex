# You may need to add a #! line at the beginning of this file, eg.:
#     #!/usr/bin/python

#
# You may need to edit this.
#
SERVER_CONF_PY_FILE = "../server_conf.py"


# Copyright (c) 2007, Alex Drummond <a.d.drummond@gmail.com>
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# * Redistributions of source code must retain the above copyright notice,
#   this list of conditions and the following disclaimer.
#
# * Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation
#   and/or other materials provided with the distribution.
#
# * Neither the names of the authors nor the names of contributors may be used to
#   endorse of promote products derived from this software without specific prior
#   written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


import sys
import os
import os.path
import getopt
import errno

PY_SCRIPT_DIR = os.path.split(sys.argv[0])[0]
PY_SCRIPT_NAME = os.path.split(sys.argv[0])[1]

# Function for generating overview.html and experiment.html.
#
# Doing it this weird way because:
#     * We need to keep experiment.html and overview.html as static files for
#       backwards compatibility.
#     * We want to generate them automatically, since they're almost identical.
#     * We also want server.py to be able to generate the same HTML dynamically
#       in order to implement the 'withsquare' option.
def generate_html(setcounter=None, overview=False):
    html = u"""<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
    <meta http-equiv = "Content-Type" content = "text/html; charset=utf-8">

    <!-- JQuery -->
    <script type="text/javascript" src="jquery.min.js"></script>
    <script type="text/javascript" src="jquery-ui.min.js"></script>

    <!-- JSDump debugging utility. -->
    <script type="text/javascript" src="jsDump.js"></script>

    <!-- Script for detecting plugins used to create unique MD5 hash. -->
    <script type="text/javascript" src="PluginDetect.js"></script>

    <!-- Gives us the name of the server.py script. -->
    <script type="text/javascript" src="%s?include=serverinfo_js"></script>
    <!-- General utilities (map, filter, ...) -->
    <script type="text/javascript" src="util.js"></script>
    <!-- Code for executing shuffle sequences. -->
    <script type="text/javascript" src="shuffle.js"></script>
    <!-- JSON serialization code. -->
    <script type="text/javascript" src="json.js"></script>
    <!-- Sound manager. -->
    <script type="text/javascript" src="soundmanager2-jsmin.js"></script>
    <!-- Backwards compatability cruft to ensure that old JS data files work. -->
    <script type="text/javascript" src="backcompatcruft.js"></script>
    <!-- JS includes. -->
    <script type="text/javascript" src="%s?include=js"></script>
    <!-- Data file JS includes. -->
    <script type="text/javascript" src="%s?include=data"></script>
    <!-- Set up configuration variables. -->
    <script type="text/javascript" src="conf.js"></script>

    <!-- The main body of JS code. -->
    <script type="text/javascript" src="%s?include=main.js%s%s"></script>

    <link rel="stylesheet" type="text/css" href="%s?include=css">

    <!-- To be reset by JavaScript. -->
    <title>Experiment</title>
    <script type="text/javascript">
    <!--
    document.title = conf_pageTitle;
    -->
    </script>
</head>
<body id="bod">

<script type="text/javascript">
<!--
-->
</script>
<noscript>
<p>You need to have Javascript enabled in order to use this page.</p>
</noscript>
</body>
</html>
"""
    return html % (PY_SCRIPT_NAME, PY_SCRIPT_NAME, PY_SCRIPT_NAME, PY_SCRIPT_NAME,
                   setcounter is not None and u"&withsquare=%i" % setcounter or u"",
                   overview and u"&overview=yes" or u"",
                   PY_SCRIPT_NAME)

command_line_options = None
try:
    command_line_options, _ = getopt.getopt(sys.argv[1:], "m:p:r:", ["genhtml="])
except getopt.GetoptError:
    sys.stderr.write("Bad arguments\n")
    sys.exit(1)

if __name__ == "__main__":
    gh = [x for x in command_line_options if x[0] == '--genhtml']
    gh.reverse()

    if gh:
        # Not much point catching exceptions here, since this is just going
        # to be run on the command line, and the default Python errors will be fine.
        experiment_html = generate_html(setcounter=None, overview=False)
        overview_html = generate_html(setcounter=None, overview=True)
        ef = open(os.path.join(gh[0][1], 'experiment.html'), "w")
        ef.write(experiment_html)
        ef.close()
        of = open(os.path.join(gh[0][1], 'overview.html'), "w")
        of.write(overview_html)
        of.close()
        sys.exit(0)


import types
import logging
import getopt
import itertools
import StringIO
if (sys.version.split(' ')[0]) >= '3.0': # No md5 module in Python 3000.
    import hashlib as md5
else:
    import md5
import time as time_module
import types
import cgi
import string
import urllib


# The 'json' module was introduced in Python 2.6. If it's not available we use a simple
# method to serialize a dict of strings to JSON.
dict_to_json = None
try:
    import json
    dict_to_json = json.dumps
except ImportError:
    def dtj(d):
        out = StringIO()
        out.write("{")
        its = d.items()
        count = 0
        for k, v in its:
            if not isinstance(v, basestring):
                raise TypeError("dict_to_json cannot handle non-string key values")
            out.write('"')
            for c in k:
                out.write("\\u%04x" % ord(c))
            out.write('":"')
            for c in v:
                out.write("\\u%04x" % ord(c))
            out.write('"')
            if count < len(its) - 1:
                out.write(',')
            count += 1
        out.write("}")
        return out.getvalue()
    dict_to_json = dtj


#
# ========== START OF jsmin.py FROM http://www.crockford.com/javascript/jsmin.py.txt ==========
#
#
# This code is originally from jsmin by Douglas Crockford, it was translated to
# Python by Baruch Even. The original code had the following copyright and
# license.
#
# /* jsmin.c
#    2007-05-22
#
# Copyright (c) 2002 Douglas Crockford  (www.crockford.com)
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
# of the Software, and to permit persons to whom the Software is furnished to do
# so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# The Software shall be used for Good, not Evil.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
# */

from StringIO import StringIO

def jsmin(js):
    ins = StringIO(js)
    outs = StringIO()
    JavascriptMinify().minify(ins, outs)
    str = outs.getvalue()
    if len(str) > 0 and str[0] == '\n':
        str = str[1:]
    return str

def isAlphanum(c):
    """return true if the character is a letter, digit, underscore,
           dollar sign, or non-ASCII character.
    """
    return ((c >= 'a' and c <= 'z') or (c >= '0' and c <= '9') or
            (c >= 'A' and c <= 'Z') or c == '_' or c == '$' or c == '\\' or (c is not None and ord(c) > 126));

class UnterminatedComment(Exception):
    pass

class UnterminatedStringLiteral(Exception):
    pass

class UnterminatedRegularExpression(Exception):
    pass

class JavascriptMinify(object):

    def _outA(self):
        self.outstream.write(self.theA)
    def _outB(self):
        self.outstream.write(self.theB)

    def _get(self):
        """return the next character from stdin. Watch out for lookahead. If
           the character is a control character, translate it to a space or
           linefeed.
        """
        c = self.theLookahead
        self.theLookahead = None
        if c == None:
            c = self.instream.read(1)
        if c >= ' ' or c == '\n':
            return c
        if c == '': # EOF
            return '\000'
        if c == '\r':
            return '\n'
        return ' '

    def _peek(self):
        self.theLookahead = self._get()
        return self.theLookahead

    def _next(self):
        """get the next character, excluding comments. peek() is used to see
           if an unescaped '/' is followed by a '/' or '*'.
        """
        c = self._get()
        if c == '/' and self.theA != '\\':
            p = self._peek()
            if p == '/':
                c = self._get()
                while c > '\n':
                    c = self._get()
                return c
            if p == '*':
                c = self._get()
                while 1:
                    c = self._get()
                    if c == '*':
                        if self._peek() == '/':
                            self._get()
                            return ' '
                    if c == '\000':
                        raise UnterminatedComment()

        return c

    def _action(self, action):
        """do something! What you do is determined by the argument:
           1   Output A. Copy B to A. Get the next B.
           2   Copy B to A. Get the next B. (Delete A).
           3   Get the next B. (Delete B).
           action treats a string as a single character. Wow!
           action recognizes a regular expression if it is preceded by ( or , or =.
        """
        if action <= 1:
            self._outA()

        if action <= 2:
            self.theA = self.theB
            if self.theA == "'" or self.theA == '"':
                while 1:
                    self._outA()
                    self.theA = self._get()
                    if self.theA == self.theB:
                        break
                    if self.theA <= '\n':
                        raise UnterminatedStringLiteral()
                    if self.theA == '\\':
                        self._outA()
                        self.theA = self._get()


        if action <= 3:
            self.theB = self._next()
            if self.theB == '/' and (self.theA == '(' or self.theA == ',' or
                                     self.theA == '=' or self.theA == ':' or
                                     self.theA == '[' or self.theA == '?' or
                                     self.theA == '!' or self.theA == '&' or
                                     self.theA == '|' or self.theA == ';' or
                                     self.theA == '{' or self.theA == '}' or
                                     self.theA == '\n'):
                self._outA()
                self._outB()
                while 1:
                    self.theA = self._get()
                    if self.theA == '/':
                        break
                    elif self.theA == '\\':
                        self._outA()
                        self.theA = self._get()
                    elif self.theA <= '\n':
                        raise UnterminatedRegularExpression()
                    self._outA()
                self.theB = self._next()


    def _jsmin(self):
        """Copy the input to the output, deleting the characters which are
           insignificant to JavaScript. Comments will be removed. Tabs will be
           replaced with spaces. Carriage returns will be replaced with linefeeds.
           Most spaces and linefeeds will be removed.
        """
        self.theA = '\n'
        self._action(3)

        while self.theA != '\000':
            if self.theA == ' ':
                if isAlphanum(self.theB):
                    self._action(1)
                else:
                    self._action(2)
            elif self.theA == '\n':
                if self.theB in ['{', '[', '(', '+', '-']:
                    self._action(1)
                elif self.theB == ' ':
                    self._action(3)
                else:
                    if isAlphanum(self.theB):
                        self._action(1)
                    else:
                        self._action(2)
            else:
                if self.theB == ' ':
                    if isAlphanum(self.theA):
                        self._action(1)
                    else:
                        self._action(3)
                elif self.theB == '\n':
                    if self.theA in ['}', ']', ')', '+', '-', '"', '\'']:
                        self._action(1)
                    else:
                        if isAlphanum(self.theA):
                            self._action(1)
                        else:
                            self._action(3)
                else:
                    self._action(1)

    def minify(self, instream, outstream):
        self.instream = instream
        self.outstream = outstream
        self.theA = '\n'
        self.theB = None
        self.theLookahead = None

        self._jsmin()
        self.instream.close()
#
# ========== END OF jsmin.py =========
#


#
# ========== START OF decoder.py AND scanner.py FROM simple_json PACKAGE ==========
#
# This package is licensed under the MIT license (which is compatible with the BSD
# license used for Ibex).
#
# http://pypi.python.org/pypi/simplejson
#
import re

# In the original code: from simplejson.scanner import Scanner, pattern
import sre_parse, sre_compile, sre_constants
from sre_constants import BRANCH, SUBPATTERN
from re import VERBOSE, MULTILINE, DOTALL
import re

__all__ = ['Scanner', 'pattern']

FLAGS = (VERBOSE | MULTILINE | DOTALL)
class Scanner(object):
    def __init__(self, lexicon, flags=FLAGS):
        self.actions = [None]
        # combine phrases into a compound pattern
        s = sre_parse.Pattern()
        s.flags = flags
        p = []
        for idx, token in enumerate(lexicon):
            phrase = token.pattern
            try:
                subpattern = sre_parse.SubPattern(s,
                    [(SUBPATTERN, (idx + 1, sre_parse.parse(phrase, flags)))])
            except sre_constants.error:
                raise
            p.append(subpattern)
            self.actions.append(token)

        p = sre_parse.SubPattern(s, [(BRANCH, (None, p))])
        self.scanner = sre_compile.compile(p)


    def iterscan(self, string, idx=0, context=None):
        """
        Yield match, end_idx for each match
        """
        match = self.scanner.scanner(string, idx).match
        actions = self.actions
        lastend = idx
        end = len(string)
        while True:
            m = match()
            if m is None:
                break
            matchbegin, matchend = m.span()
            if lastend == matchend:
                break
            action = actions[m.lastindex]
            if action is not None:
                rval, next_pos = action(m, context)
                if next_pos is not None and next_pos != matchend:
                    # "fast forward" the scanner
                    matchend = next_pos
                    match = self.scanner.scanner(string, matchend).match
                yield rval, matchend
            lastend = matchend

def pattern(pattern, flags=FLAGS):
    def decorator(fn):
        fn.pattern = pattern
        fn.regex = re.compile(pattern, flags)
        return fn
    return decorator

FLAGS = re.VERBOSE | re.MULTILINE | re.DOTALL

def _floatconstants():
    import struct
    import sys
    _BYTES = '7FF80000000000007FF0000000000000'.decode('hex')
    if sys.byteorder != 'big':
        _BYTES = _BYTES[:8][::-1] + _BYTES[8:][::-1]
    nan, inf = struct.unpack('dd', _BYTES)
    return nan, inf, -inf

NaN, PosInf, NegInf = _floatconstants()

def linecol(doc, pos):
    lineno = doc.count('\n', 0, pos) + 1
    if lineno == 1:
        colno = pos
    else:
        colno = pos - doc.rindex('\n', 0, pos)
    return lineno, colno

def errmsg(msg, doc, pos, end=None):
    lineno, colno = linecol(doc, pos)
    if end is None:
        return '%s: line %d column %d (char %d)' % (msg, lineno, colno, pos)
    endlineno, endcolno = linecol(doc, end)
    return '%s: line %d column %d - line %d column %d (char %d - %d)' % (
        msg, lineno, colno, endlineno, endcolno, pos, end)

_CONSTANTS = {
    '-Infinity': NegInf,
    'Infinity': PosInf,
    'NaN': NaN,
    'true': True,
    'false': False,
    'null': None,
}

def JSONConstant(match, context, c=_CONSTANTS):
    return c[match.group(0)], None
pattern('(-?Infinity|NaN|true|false|null)')(JSONConstant)

def JSONNumber(match, context):
    match = JSONNumber.regex.match(match.string, *match.span())
    integer, frac, exp = match.groups()
    if frac or exp:
        res = float(integer + (frac or '') + (exp or ''))
    else:
        res = int(integer)
    return res, None
pattern(r'(-?(?:0|[1-9]\d*))(\.\d+)?([eE][-+]?\d+)?')(JSONNumber)

STRINGCHUNK = re.compile(r'(.*?)(["\\])', FLAGS)
BACKSLASH = {
    '"': u'"', '\\': u'\\', '/': u'/',
    'b': u'\b', 'f': u'\f', 'n': u'\n', 'r': u'\r', 't': u'\t',
}

DEFAULT_ENCODING = "UTF-8"

def scanstring(s, end, encoding=None, _b=BACKSLASH, _m=STRINGCHUNK.match):
    if encoding is None:
        encoding = DEFAULT_ENCODING
    chunks = []
    _append = chunks.append
    begin = end - 1
    while 1:
        chunk = _m(s, end)
        if chunk is None:
            raise ValueError(
                errmsg("Unterminated string starting at", s, begin))
        end = chunk.end()
        content, terminator = chunk.groups()
        if content:
            if not isinstance(content, unicode):
                content = unicode(content, encoding)
            _append(content)
        if terminator == '"':
            break
        try:
            esc = s[end]
        except IndexError:
            raise ValueError(
                errmsg("Unterminated string starting at", s, begin))
        if esc != 'u':
            try:
                m = _b[esc]
            except KeyError:
                raise ValueError(
                    errmsg("Invalid \\escape: %r" % (esc,), s, end))
            end += 1
        else:
            esc = s[end + 1:end + 5]
            try:
                m = unichr(int(esc, 16))
                if len(esc) != 4 or not esc.isalnum():
                    raise ValueError
            except ValueError:
                raise ValueError(errmsg("Invalid \\uXXXX escape", s, end))
            end += 5
        _append(m)
    return u''.join(chunks), end

def JSONString(match, context):
    encoding = getattr(context, 'encoding', None)
    return scanstring(match.string, match.end(), encoding)
pattern(r'"')(JSONString)

WHITESPACE = re.compile(r'\s*', FLAGS)

def JSONObject(match, context, _w=WHITESPACE.match):
    pairs = {}
    s = match.string
    end = _w(s, match.end()).end()
    nextchar = s[end:end + 1]
    # trivial empty object
    if nextchar == '}':
        return pairs, end + 1
    if nextchar != '"':
        raise ValueError(errmsg("Expecting property name", s, end))
    end += 1
    encoding = getattr(context, 'encoding', None)
    iterscan = JSONScanner.iterscan
    while True:
        key, end = scanstring(s, end, encoding)
        end = _w(s, end).end()
        if s[end:end + 1] != ':':
            raise ValueError(errmsg("Expecting : delimiter", s, end))
        end = _w(s, end + 1).end()
        try:
            value, end = iterscan(s, idx=end, context=context).next()
        except StopIteration:
            raise ValueError(errmsg("Expecting object", s, end))
        pairs[key] = value
        end = _w(s, end).end()
        nextchar = s[end:end + 1]
        end += 1
        if nextchar == '}':
            break
        if nextchar != ',':
            raise ValueError(errmsg("Expecting , delimiter", s, end - 1))
        end = _w(s, end).end()
        nextchar = s[end:end + 1]
        end += 1
        if nextchar != '"':
            raise ValueError(errmsg("Expecting property name", s, end - 1))
    object_hook = getattr(context, 'object_hook', None)
    if object_hook is not None:
        pairs = object_hook(pairs)
    return pairs, end
pattern(r'{')(JSONObject)

def JSONArray(match, context, _w=WHITESPACE.match):
    values = []
    s = match.string
    end = _w(s, match.end()).end()
    # look-ahead for trivial empty array
    nextchar = s[end:end + 1]
    if nextchar == ']':
        return values, end + 1
    iterscan = JSONScanner.iterscan
    while True:
        try:
            value, end = iterscan(s, idx=end, context=context).next()
        except StopIteration:
            raise ValueError(errmsg("Expecting object", s, end))
        values.append(value)
        end = _w(s, end).end()
        nextchar = s[end:end + 1]
        end += 1
        if nextchar == ']':
            break
        if nextchar != ',':
            raise ValueError(errmsg("Expecting , delimiter", s, end))
        end = _w(s, end).end()
    return values, end
pattern(r'\[')(JSONArray)

ANYTHING = [
    JSONObject,
    JSONArray,
    JSONString,
    JSONConstant,
    JSONNumber,
]

JSONScanner = Scanner(ANYTHING)

class JSONDecoder(object):
    """
    Simple JSON <http://json.org> decoder

    Performs the following translations in decoding:

    +---------------+-------------------+
    | JSON          | Python            |
    +===============+===================+
    | object        | dict              |
    +---------------+-------------------+
    | array         | list              |
    +---------------+-------------------+
    | string        | unicode           |
    +---------------+-------------------+
    | number (int)  | int, long         |
    +---------------+-------------------+
    | number (real) | float             |
    +---------------+-------------------+
    | true          | True              |
    +---------------+-------------------+
    | false         | False             |
    +---------------+-------------------+
    | null          | None              |
    +---------------+-------------------+

    It also understands ``NaN``, ``Infinity``, and ``-Infinity`` as
    their corresponding ``float`` values, which is outside the JSON spec.
    """

    _scanner = Scanner(ANYTHING)
    __all__ = ['__init__', 'decode', 'raw_decode']

    def __init__(self, encoding=None, object_hook=None):
        """
        ``encoding`` determines the encoding used to interpret any ``str``
        objects decoded by this instance (utf-8 by default).  It has no
        effect when decoding ``unicode`` objects.

        Note that currently only encodings that are a superset of ASCII work,
        strings of other encodings should be passed in as ``unicode``.

        ``object_hook``, if specified, will be called with the result
        of every JSON object decoded and its return value will be used in
        place of the given ``dict``.  This can be used to provide custom
        deserializations (e.g. to support JSON-RPC class hinting).
        """
        self.encoding = encoding
        self.object_hook = object_hook

    def decode(self, s, _w=WHITESPACE.match):
        """
        Return the Python representation of ``s`` (a ``str`` or ``unicode``
        instance containing a JSON document)
        """
        obj, end = self.raw_decode(s, idx=_w(s, 0).end())
        end = _w(s, end).end()
        if end != len(s):
            raise ValueError(errmsg("Extra data", s, end, len(s)))
        return obj

    def raw_decode(self, s, **kw):
        """
        Decode a JSON document from ``s`` (a ``str`` or ``unicode`` beginning
        with a JSON document) and return a 2-tuple of the Python
        representation and the index in ``s`` where the document ended.

        This can be used to decode a JSON document from a string that may
        have extraneous data at the end.
        """
        kw.setdefault('context', self)
        try:
            obj, end = self._scanner.iterscan(s, **kw).next()
        except StopIteration:
            raise ValueError("No JSON object could be decoded")
        return obj, end

__all__ = ['JSONDecoder']
#
# ========== END OF decoder.py AND scanner.py ==========
#

#
# Random utility.
#
def nice_time(t):
    return time_module.strftime(u"%a, %d-%b-%Y %H:%M:%S", time_module.gmtime(t))

#
# CSS namespaceifier.
#
# This function performs a partial parse of a CSS file (we're only interested
# in the selectors).
def css_parse(css):
    KINDS_CHARS = "#."
    OPS_CHARS = "+>," # We treat comma as an operator just like '>' or '+', since
                      # this works fine for our purposes, despite not being
                      # semantically correct.

    state = "selector"
    prev_char = None
    precomment_return_to_state = None
    current_selectors = []   # Of the form [["tagname", "#/./whatever", "blah"]] (where "blah" includes ":whatever" unparsed).
                             # Empty string is used to indicate that something (e.g. tag name) is missing.
                             # Note that the empty string counts as a false value in Python conditionals.
    current_selector_tagname = None
    current_selector_kind = None
    current_selector_rest = None
    current_op = None
    current_body = None
    definitions = []
    i = 0
    while i < len(css):
        c = css[i]

        if state is "selector":
            if c.isspace():
                pass
            elif c == "/":
                precomment_state = "selector"
                state = "precomment"
            elif c == "{":
                current_body = StringIO()
                state = "body"
            elif c in KINDS_CHARS:
                current_selector_tagname = None
                current_selector_kind = c
                current_selector_rest = StringIO()
                state = "selector_rest"
            elif c in OPS_CHARS:
                current_op = StringIO()
                current_op.write(c)
                state = "operator"
            elif c.isalnum() or c in "_*": # '*' used to indicate any tag; we'll allow underscores in tag names.
                current_selector_tagname = StringIO()
                current_selector_tagname.write(c)
                state = "selector_tagname"
            else:
                assert False
        elif state is "precomment":
            if c == "*":
                state = "comment"
            else:
                state = precomment_return_to_state
        elif state is "comment":
            if c == "*":
                state = "preclose_comment"
        elif state is "preclose_comment":
            if c == "/":
                state = precomment_return_to_state
        elif state is "operator":
            # Special handling of comments since they separate operators. (We don't
            # want to go back to this state, but rather to the "selector" state.)
            if c == "/":
                state = "operator_comment"
                current_selectors.append(current_op.getvalue())
            elif c in OPS_CHARS:
                current_op.write(c)
            else:
                current_selectors.append(current_op.getvalue())
                i -= 1 # IMPORTANT IMPORTANT IMPORTANT
                state = "selector"
        elif state is "operator_comment":
            if c == "*":
                current_selectors.append(current_op.getvalue())
                precomment_return_to_state = "selector"
                state = "precomment"
            else:
                current_op.write(c) # We'll allow '/' chars in the middle of operators -- this is a permissive parser.
                state = "operator"
        elif state is "selector_tagname":
            if c == "/":
                current_selectors.append([current_selector_tagname.getvalue(), '', ''])
                precomment_return_to_state = "selector"
                state = "precomment"
            elif c.isalnum() or c in ":-":
                current_selector_tagname.write(c)
            elif c == "{":
                selector_kind = None
                current_body = StringIO()
                state = "body"
            elif c in OPS_CHARS:
                current_selectors.append([current_selector_tagname.getvalue(), '', ''])
                current_op = StringIO()
                current_op.write(c)
                state = "operator"
            elif c.isspace():
                current_selectors.append([current_selector_tagname.getvalue(), '', ''])
                state = "selector"
            else:
                current_selector_kind = (c in KINDS_CHARS and (c,) or (None,))[0]
                current_selector_rest = StringIO()
                state = "selector_rest"
        elif state is "selector_rest":
            if c.isalnum() or c in ":-":
                current_selector_rest.write(c)
            else:
                current_selectors.append([
                    (current_selector_tagname and (current_selector_tagname.getvalue(),) or ("",))[0],
                    current_selector_kind or "",
                    (current_selector_rest and (current_selector_rest.getvalue(),) or ("",))[0]
                ])
                if c.isspace():
                    state = "selector"
                elif c == "/":
                    state = "precomment"
                    precomment_return_to_state = "selector"
                elif c in OPS_CHARS:
                    current_op = StringIO()
                    current_op.write(c)
                    state = "operator"
                else: #elif c == "{": # Being lax here because we don't want this parser to ever fail.
                    current_body = StringIO()
                    state = "body"
        elif state is "body":
            if c == "}":
                definitions.append((current_selectors, current_body.getvalue()))

                current_selectors = []
                current_selector_tagname = None
                current_selector_kind = None
                current_selector_rest = None
                current_op = None
                current_body = None

                state = "selector"
            elif c == "/": # We effectively strip comments out of the body.
                precomment_return_to_state = "body"
                state = "precomment"
            elif c in "\"'":
                current_body.write(c)
                quote_char = c
                state = "body_instring"
            else:
                current_body.write(c)
        elif state is "body_instring":
            current_body.write(c)
            if c == quote_char and prev_char != "\\":
                state = "body"
        else:
            assert False

        i += 1
        prev_char = c

    return definitions

def css_add_namespace(css_definitions, name):
    for d in css_definitions:
        for sel in d[0]:
            if type(sel) is type([]) and sel[2]:
                sel[2] = name + sel[2]

def css_spit_out(css_definitions, ofile):
    for d in css_definitions:
        for sel in d[0]:
            if type(sel) is type(""): # It's an operator (e.g. '>')
                ofile.write(" %s " % sel)
            else:
                ofile.write("%s%s%s " % (sel[0], sel[1], sel[2]))
        ofile.write("{%s}\n" % d[1])

# TEST CODE
#defs = css_parse("foo/**/>#amp/**/gob>++>dd/**/ { ./*.. }*/} foo { ... } amp { 56 }")
#defs = css_parse("a { b} c { d} ")
#print defs
#css_add_namespace(defs, "ns-")
#css_spit_out(defs, sys.stdout)
#sys.exit(0)


#
# Logging and configuration variables.
#

# If EXTERNAL_CONFIG_URL has already been defined in this file, don't attempt
# to open SERVER_CONF_PY_FILE, even if it's defined.
CFG = { }
if (not globals().has_key('EXTERNAL_CONFIG_URL') or (not globals()['EXTERNAL_CONFIG_URL'])) and globals().has_key('SERVER_CONF_PY_FILE') and globals()['SERVER_CONF_PY_FILE']:
    try:
        execfile(SERVER_CONF_PY_FILE, CFG)
    except Exception, e:
        print "Could not open/load config file: %s" % e
        sys.exit(1)
else:
    CFG = globals()

# Check if we're using external or internal config.
extkeys = ['EXTERNAL_CONFIG_URL', 'EXTERNAL_CONFIG_METHOD', 'EXTERNAL_CONFIG_PASS_PARAMS']
for k in extkeys: # Note that logging can't be set up till config is parsed, so we use sys.stderr here.
    if CFG.has_key(k) and CFG[k]:
        for kk in extkeys:
            if not (CFG.has_key(kk) and CFG[kk]):
                vs = ', '.join(map(lambda x: "'%s'" % x))
                sys.stderr.write("If one of the configuration variables %s is present, then all %i must be present." % (vs, len(vs)))
                sys.exit(1)

        # Check that EXTERNAL_CONFIG_METHOD IS 'GET' (haven't added support for POST yet).
        if not CFG['EXTERNAL_CONFIG_METHOD'] == 'GET':
            sys.stderr.write("'GET' is currently the only supported method for getting external config via HTTP.")
            sys.exit(1)

        # Make a request to the external config HTTP server, receiving a JSON record as a reply (we hope).
        r = None
        try:
            url = CFG['EXTERNAL_CONFIG_URL']
            if CFG['EXTERNAL_CONFIG_PASS_PARAMS'] and CFG['EXTERNAL_CONFIG_METHOD'].upper() == "GET":
                sepchr = '?' in url and '&' or '?' # Don't screw it up if the url already has params.
                url += sepchr + "dir=" + urllib.quote(PY_SCRIPT_DIR)
            try:
                req_data = None
#                if CFG['EXTERNAL_CONFIG_PASS_PARAMS'] and CFG['EXTERNAL_CONFIG_METHOD'].upper() == "POST":
#                    sys.stderr.write("NOT IMPLEMENTED!!!!\n")
#                    sys.exit(1)
                r = urllib.urlopen(url)
                data = r.read()
                dec = JSONDecoder()
                try:
                     json = dec.decode(data)
                     if type(json) != type({}):
                         sys.stderr.write("JSON data received from the following external configuration URL parsed correctly but was not a dictionary as required: %s" % url)
                         sys.exit(1)
                     CFG = json
                except ValueError:
                    sys.stderr.write("Bad JSON data received from the following external configuration URL: %s" % url)
                    sys.exit(1)
            except IOError, e:
                sys.stderr.write("Error opening the following URL to get external configuration: %s (%s)" % (url, str(e)))
                sys.exit(1)
        finally:
            if r: r.close()

        break

# Back compat.
if CFG.has_key('WEBSPR_WORKING_DIR') and not CFG.has_key('IBEX_WORKING_DIR'):
    CFG['IBEX_WORKING_DIR'] = CFG['WEBSPR_WORKING_DIR']

logging.basicConfig()
logger = logging.getLogger("server")
logger.addHandler(logging.StreamHandler())
log_filename = os.path.join(CFG.has_key('IBEX_WORKING_DIR') and CFG['IBEX_WORKING_DIR'] or '', 'server.log')
try:
    open(log_filename, "w").close();
except:
    sys.stderr.write("Error touching server log file '%s'" % log_filename)
logger.addHandler(logging.FileHandler(filename=log_filename))

# Check that all conf variables have been defined
# (except the optional IBEX_WORKING_DIR and PORT variables).
for k in ['RESULT_FILE_NAME',
          'RAW_RESULT_FILE_NAME', 'SERVER_STATE_DIR',
          'SERVER_MODE', 'JS_INCLUDES_DIR', 'DATA_INCLUDES_DIR', 'CHUNK_INCLUDES_DIR',
          'CSS_INCLUDES_DIR', 'OTHER_INCLUDES_DIR', 'CACHE_DIR', 'JS_INCLUDES_LIST', 'DATA_INCLUDES_LIST',
          'CSS_INCLUDES_LIST', 'STATIC_FILES_DIR', 'INCLUDE_COMMENTS_IN_RESULTS_FILE',
          'SIMPLE_RESULTS_FILE_COMMENTS', 'INCLUDE_HEADERS_IN_RESULTS_FILE']:
    if not CFG.has_key(k):
        logger.error("Configuration variable '%s' was not defined." % k)
        sys.exit(1)
# Define optional variables if they are not already defined.
CFG['PORT'] = CFG.has_key('PORT') and CFG['PORT'] or None
CFG['IBEX_WORKING_DIR'] = CFG.has_key('IBEX_WORKING_DIR') and CFG['IBEX_WORKING_DIR'] or None
CFG['MINIFY_JS'] = CFG.has_key('MINIFY_JS') and CFG['MINIFY_JS'] or False

# Check for "-m" and "-p" options (sets server mode and port respectively).
# Also check for "-r" option (resest counter on startup).
COUNTER_SHOULD_BE_RESET = False
try:
    for k,v in command_line_options:
        if k == "-m":
            CFG['SERVER_MODE'] = v
        elif k == "-p":
            CFG['PORT'] = int(v)
        elif k == "-r":
            COUNTER_SHOULD_BE_RESET = True
except ValueError:
    logger.error("Argument to -p must be an integer")
    sys.exit(1)

# Check values of (some) conf variables.
if CFG['SERVER_MODE'] != "cgi" and type(CFG['PORT']) != types.IntType:
    logger.error("Bad value (or no value) for server port.")
    sys.exit(1)
if type(CFG['JS_INCLUDES_LIST']) != types.ListType or len(CFG['JS_INCLUDES_LIST']) < 1 or (CFG['JS_INCLUDES_LIST'][0] not in ["block", "allow"]):
    logger.error("Bad value for 'JS_INCLUDES_LIST' conf variable.")
    sys.exit(1)
if type(CFG['CSS_INCLUDES_LIST']) != types.ListType or len(CFG['CSS_INCLUDES_LIST']) < 1 or (CFG['CSS_INCLUDES_LIST'][0] not in ["block", "allow"]):
    logger.error("Bad value for 'CSS_INCLUDES_LIST' conf variable.")
    sys.exit(1)
if type(CFG['DATA_INCLUDES_LIST']) != types.ListType or len(CFG['DATA_INCLUDES_LIST']) < 1 or (CFG['DATA_INCLUDES_LIST'][0] not in ["block", "allow"]):
    logger.error("Bad value for 'DATA_INCLUDES_LIST' conf variable.")
    sys.exit(1)


# File locking on UNIX/Linux/OS X
HAVE_FLOCK = False
if (sys.version.split(' ')[0]) >= '2.4': # File locking doesn't seem to work well in Python 2.3.
    try:
        import fcntl # For flock.
        if 'flock' in dir(fcntl) and \
                type(fcntl.flock) == types.BuiltinFunctionType:
            HAVE_FLOCK = True
    except:
        pass

# Configuration.
if CFG['SERVER_MODE'] not in ["paste", "toy", "cgi"]:
    logger.error("Unrecognized value for SERVER_MODE configuration variable (or '-m' command line option).")
    sys.exit(1)

if CFG['SERVER_MODE'] in ["toy", "paste"]:
    import threading
    import BaseHTTPServer
    import SimpleHTTPServer
    import SocketServer

PWD = None
if CFG.has_key('IBEX_WORKING_DIR'):
    PWD = CFG['IBEX_WORKING_DIR']
if os.environ.get("IBEX_WORKING_DIR"):
    PWD = os.environ.get("IBEX_WORKING_DIR")
if PWD is None:
    logger.error("No value was given for config variable IBEX_WORKING_DIR")
    sys.exit(1)

#
# Some utility functions/classes.
#

def lock_and_open(filename, mode):
    f = open(filename, mode)
    if HAVE_FLOCK:
        fcntl.flock(f.fileno(), 2)
    return f
def unlock_and_close(f):
    # Apparently, unlocking prior to closing is unnecessary and can lead to data loss.
#    if HAVE_FLOCK:
#        fcntl.flock(f.fileno(), 8)
    f.close()

def get_counter():
    try:
        f = lock_and_open(os.path.join(PWD, CFG['SERVER_STATE_DIR'], 'counter'), "r")
        n = int(f.read().strip())
        unlock_and_close(f)
        return n
    except (IOError, ValueError), e:
        logger.error("Error reading counter from server state: %s" % str(e))
        sys.exit(1)
def set_counter(n):
    try:
        f = lock_and_open(os.path.join(PWD, CFG['SERVER_STATE_DIR'], 'counter'), "w")
        f.write(str(n))
        unlock_and_close(f)
    except IOError, e:
        logger.error("Error setting counter in server state: %s" % str(e))
        sys.exit(1)
def update_counter(update_func):
    try:
        f = lock_and_open(os.path.join(PWD, CFG['SERVER_STATE_DIR'], 'counter'), "r+")
        n = int(f.read().strip())
        newn = update_func(n)
        f.truncate(0)
        f.seek(0)
        f.write(str(newn))
        unlock_and_close(f)
    except IOError, e:
        logger.error("Error updating counter in server state: %s" % str(e))
        sys.exit(1)

class HighLevelParseError(Exception):
    def __init__(self, *args):
        Exception.__init__(self, *args)

def group_list(l, n):
    """Written in this slightly awkward way so that it works with iterators."""
    assert n > 0

    newl = []
    count = 0
    current_sub = []
    for elem in l:
        if count >= n:
            newl.append(current_sub)
            current_sub = [elem]
            count = 1
        else:
            current_sub.append(elem)
            count += 1
    newl.append(current_sub)
    return newl

def rearrange(parsed_json, thetime, ip, user_agent):
    if type(parsed_json) != types.ListType or len(parsed_json) != 6:
        raise HighLevelParseError()

    random_counter = parsed_json[0]
    if type(random_counter) != types.BooleanType:
        raise HighLevelParseError()

    counter = None
    try:
        counter = int(parsed_json[1])
    except ValueError:
        raise HighLevelParseError()

    names_array = parsed_json[2]
    def getname(index):
        if index >= len(names_array) or index < 0:
            raise HighLevelParseError()
        return names_array[index]

    unique_md5 = parsed_json[4]
    if (type(unique_md5) != type("") and type(unique_md5) != type(u"")) or \
       len(unique_md5) != 22:
        raise HighLevelParseError()
    uid = ip + ':' + user_agent + unique_md5
    uid_hexdigest = md5.md5(uid).hexdigest()

    should_update_counter = parsed_json[5]
    if (type(random_counter) != types.BooleanType):
        raise HighLeveLParseError()

    #
    # This is a fairly horrible bit of code that does most of the work
    # of inserting comments for columns into the results file. As well as detecting
    # adjacent lines with identical column names, it is also able to detect regular
    # patterns of alternating identical columns. The nice thing about having this
    # monstrosity is that it makes it possible to maintain a very simple concept of
    # results from the point of view of writing a controller (each controller just
    # returns a list of lines, where each line is a list of name/value pairs).
    #
    # Unfortunately, this is almost impossible to understand. If it needs to be
    # changed at all it's probably best to rewrite it. Sorry.
    #
    new_results = []
    column_names = []
    main_index = 0
    next_comment_index = None
    while main_index < len(parsed_json[3]):
        old_main_index = main_index
        for phase in xrange(1, 6): # [1, 2, 3, 4, 5]
            next_comment_index = main_index
            subs = group_list(itertools.islice(parsed_json[3], main_index, None), phase)

            rs = []
            old_names = None
            for sub in subs:
                names = []
                for line in sub:
                    names.append(map(lambda x: getname(x[0]), line))

                if not old_names:
                    old_names = names
                if old_names != names:
                    break
                else:
                    # Add columns common to all lines.
                    rs.extend(map(lambda l: [int(round(thetime)), uid_hexdigest] + map(lambda x: x[1], l), sub))
                    main_index += phase
            if len(rs) == 1:
                main_index -= phase
            elif len(rs) > 1:
                column_names.append([next_comment_index, old_names])
                new_results.extend(rs)
                break

            if main_index >= len(parsed_json[3]):
                break # while loop will now also exit, since it perfoms the same test.

        # Fallback to commenting each line.
        if old_main_index == main_index:
            for line, i in itertools.izip(itertools.islice(parsed_json[3], main_index, None), itertools.count(0)):
                new_results.append([int(round(thetime)), uid_hexdigest] + map(lambda x: x[1], line))
                column_names.append([main_index + i, [map(lambda x: getname(x[0]), line)]])
            break

    return random_counter, counter, new_results, column_names, should_update_counter

def ensure_period(s):
    if s.endswith(u".") or s.endswith(u"?") or s.endswith(u"!"):
        return s
    else:
        return s + u"."

def intersperse_comments(main, name_specs):
    newr = []
    for line, i in itertools.izip(main, itertools.count(0)):
        for idx, name_spec in name_specs:
            if idx == i:
                if len(name_spec) == 1:
                    newr.append([u"# Columns below this comment are as follows:"])
                    newr.append([u"# 1. Time results were received."])
                    newr.append([u"# 2. MD5 hash of participant's IP address."])
                    for colname,n in itertools.izip(name_spec[0], itertools.count(3)):
                        newr.append([u"# %i. %s" % (n, ensure_period(unicode(colname)))])
                    break
                else:
                    newr.append([u"# The lines below this comment are in groups of %i." % len(name_spec)])
                    newr.append([u"# The formats of the lines in each of these groups are as follows:"])
                    newr.append([u"#"])
                    for names, i in itertools.izip(name_spec, itertools.count(1)):
                        newr.append([u"# Line %i:" % i])
                        newr.append([u"#     Col. 1: Time results were received."])
                        newr.append([u"#     Col. 2: MD5 hash of participant's IP address."])
                        for name, j in itertools.izip(names, itertools.count(3)):
                            newr.append([u"#     Col. %i: %s" % (j, ensure_period(unicode(name)))])
                    break
        newr.append(line)
    return newr

def simple_intersperse_comments(main, name_specs):
    """Just adds one comment per line."""
    newr = [["#"],
            ["# IMPORTANT NOTE: As of ibex 0.3-beta15, the default format of the"],
            ["# comments in this file has changed, so that a comment is inserted"],
            ["# for each individual line giving the names of the columns (except"],
            ["# the first seven, which are always the same; see manual). The format"],
            ["# of the results themselves has not changed. You can revert to the"],
            ["# old-style comments by setting the 'SIMPLE_RESULTS_FILE_COMMENTS'"],
            ["# configuration variable to False."],
            ["#"]]
    name_specs_index = 0
    start_i = 0
    for line, i in itertools.izip(main, itertools.count(0)):
        if name_specs_index < len(name_specs)-1 and \
           name_specs[name_specs_index+1][0] == i:
            start_i = i
            name_specs_index += 1

        ns = name_specs[name_specs_index][1]
        cns = ns[(i - start_i) % len(ns)]
        assert len(cns) == len(line) - 2 # -2 because of time and IP MD5 columns.
        assert len(cns) >= 5
        newr.append([u"# ...First 7... " + u" -- ".join([("[%i] %s" % (i+8,s)) for i,s in itertools.izip(itertools.count(0), cns[5:])])])
        newr.append(line)
    return newr

def get_comment_intersperser():
    if CFG['SIMPLE_RESULTS_FILE_COMMENTS']:
        return simple_intersperse_comments
    else:
        return intersperse_comments

def to_csv(lines):
    s = StringIO()
    for l in lines:
        s.write(u','.join(map(unicode, l)))
        s.write(u'\n')
    return s.getvalue()


#
# The server itself.
#

def create_monster_string(dir, extension, block_allow, cacheKey=None, manipulator=None):
    if cacheKey and os.path.isfile(os.path.join(PWD, CFG['CACHE_DIR'], cacheKey)):
        cacheCreatedTime = os.path.getmtime(os.path.join(PWD, CFG['CACHE_DIR'], cacheKey))
        try:
            ds = os.listdir(dir)
            canUseCache = True
            for path in ds:
                if os.path.getmtime(os.path.join(dir, path)) >= cacheCreatedTime:
                    canUseCache = False
                    break
            if canUseCache:
                f = open(os.path.join(PWD, CFG['CACHE_DIR'], cacheKey))
                return f.read()
        except IOError:
            # Just ignore the error -- it just means we won't use the cache this time.
            pass

    # We can't use the cache, so go ahead and create the string...

    filenames = []
    try:
        ds = os.listdir(dir)
        ds.sort()
        for path in ds:
            fullpath = os.path.join(dir, path)
            if os.path.isfile(fullpath) and path.endswith(extension):
                if block_allow[0] == "block" and path not in block_allow[1:]:
                    filenames.append(fullpath)
                elif block_allow[0] == "allow" and path in block_allow[1:]:
                    filenames.append(fullpath)
    except IOError:
        logger.error("Error getting directory listing for Javascript include directory '%s'" % dir)
        sys.exit(1)

    s = StringIO()
    f = None
    try:
        try:
            for fn in filenames:
                f = open(fn)
                if not manipulator:
                    s.write(f.read())
                else:
                    content = f.read()
                    newcontent = manipulator(os.path.split(fn)[1], content, s)
                s.write('\n\n')
                f.close()
        except Exception, e:
            logger.error("Error reading Javascript files in '%s'" % dir)
            sys.exit(1)
    finally:
        if f: f.close()

    val = s.getvalue()

    # If a cache key was given, create a cache of the result before returning it.
    if cacheKey:
        f = None
        try:
            try:
                f = open(os.path.join(PWD, CFG['CACHE_DIR'], cacheKey), 'w')
                f.write(val)
            except IOError:
                # Ignore errors -- it just means that a cache won't be created.
                pass
        finally:
            if f: f.close()

    return val

def js_create_monster_string(dir, extension, block_allow, cacheKey=None):
    def manipulator(filename, content, ofile):
        if CFG['MINIFY_JS']:
            ofile.write(jsmin(content))
        else:
            ofile.write(content)
    return create_monster_string(dir, extension, block_allow, cacheKey, manipulator)

def css_create_monster_string(dir, extension, block_allow, cacheKey=None):
    def manipulator (filename, content, ofile):
        if filename.startswith("global_"):
            ofile.write(content)
        else:
            parsed = css_parse(content)
            name = filename.split('.')[0] + '-'
            css_add_namespace(parsed, name)
            css_spit_out(parsed, ofile)
    return create_monster_string(dir, extension, block_allow, cacheKey, manipulator)

# Create a directory for storing results (if it doesn't already exist).
try:
    # Create the directory.
    if os.path.isfile(os.path.join(PWD, CFG['RESULT_FILES_DIR'])):
        logger.error("'%s' is a file, so could not create results directory" % CFG['RESULT_FILES_DIR'])
        sys.exit(1)
    elif not os.path.isdir(os.path.join(PWD, CFG['RESULT_FILES_DIR'])):
        os.mkdir(os.path.join(PWD, CFG['RESULT_FILES_DIR']))
except os.error, IOError:
    logger.error("Could not create results directory at %s" % os.path.join(PWD, CFG['RESULT_FILES_DIR']))
    sys.exit(1)

# Create a directory for storing the server state
# (if it doesn't already exist), and initialize the counter.
try:
    # Create the directory.
    if os.path.isfile(os.path.join(PWD, CFG['SERVER_STATE_DIR'])):
        logger.error("'%s' is a file, so could not create server state directory" % CFG['SERVER_STATE_DIR'])
        sys.exit(1)
    elif not os.path.isdir(os.path.join(PWD, CFG['SERVER_STATE_DIR'])):
        os.mkdir(os.path.join(PWD, CFG['SERVER_STATE_DIR']))

    # Initialize the counter, if there isn't one already.
    if not os.path.isfile(os.path.join(PWD, CFG['SERVER_STATE_DIR'], 'counter')):
        f = open(os.path.join(PWD, CFG['SERVER_STATE_DIR'], 'counter'), "w")
        f.write("0")
        f.close()
except os.error, IOError:
    logger.error("Could not create server state directory at %s" % os.path.join(PWD, CFG['SERVER_STATE_DIR']))
    sys.exit(1)

# Create a cache directory (if it doesn't already exist).
mjs = None # To get this in the scope of finally.
try:
    try:
        if os.path.isfile(os.path.join(PWD, CFG['CACHE_DIR'])):
            logger.error("'%s' is a file, so could not create cache directory" % CFG['CACHE_DIR'])
            sys.exit(1)
        elif not os.path.isdir(os.path.join(PWD, CFG['CACHE_DIR'])):
            os.mkdir(os.path.join(PWD, CFG['CACHE_DIR']))

        # We need to be careful to clear out the cache if the value of the MINIFY_JS config
        # variable has changed. Note that the lack of file locking here isn't too much of
        # a problem -- if the file is read when it's in an inconsistent state, all that will
        # happen is that the cache will be reset.
        if not os.path.isfile(os.path.join(PWD, CFG['CACHE_DIR'], 'MINIFY_JS')):
            mjs = open(os.path.join(PWD, CFG['CACHE_DIR'], 'MINIFY_JS'), 'w')
            mjs.write(str(CFG['MINIFY_JS']) + '\r\n')
        else:
            mjs = open(os.path.join(PWD, CFG['CACHE_DIR'], 'MINIFY_JS'), 'r+')
            contents = mjs.read()
            if contents != str(CFG['MINIFY_JS']):
                mjs.truncate(0)
                mjs.seek(0)
                mjs.write(str(CFG['MINIFY_JS']) + '\r\n')

                # Clean out the cache. We do this because changes to the server configuration
                # since the last time the server was run may have implications for what should
                # be stored in the cache (e.g. if JS minification has been turned on/off).
                fs = os.listdir(os.path.join(PWD, CFG['CACHE_DIR']))
                for fname in fs:
                    if fname != 'MINIFY_JS' and os.path.isfile(os.path.join(PWD, CFG['CACHE_DIR'], fname)):
                        os.remove(os.path.join(PWD, CFG['CACHE_DIR'], fname))
    except os.error, IOError:
        logger.error("Could not create cache directory at %s" % os.path.join(PWD, CFG['CACHE_DIR']))
finally:
    if mjs: mjs.close()

def control(env, start_response):
    # Save the time the results were received.
    thetime = time_module.time()

    ip = None
    if env.has_key('HTTP_X_FORWARDED_FOR'):
        ip = env['HTTP_X_FORWARDED_FOR']
    else:
        ip = env['REMOTE_ADDR']

    user_agent = "Unknown user agent"
    if env.has_key('USER_AGENT'):
        user_agent = env['USER_AGENT']
    elif env.has_key('HTTP_USER_AGENT'):
        user_agent = env['HTTP_USER_AGENT']

    base = None
    if env.has_key('REQUEST_URI'):
        base = env['REQUEST_URI']
    else:
        base = env['PATH_INFO']
    # Sometimes the query string likes to stick around.
    base = base.split('?')[0]

    if not base:
        # Redirect to experiment.html by default.
        start_response('302 Found', [('Location', '/experiment.html')])
        return []

    last = filter(lambda x: x != [], base.split('/'))[-1];

    if last == PY_SCRIPT_NAME:
        qs = env.has_key('QUERY_STRING') and env['QUERY_STRING'].lstrip('?') or ''
        qs_hash = cgi.parse_qs(qs)

        # Is it a request for a JS/CSS include file?
        if qs_hash.has_key('include'):
            if qs_hash['include'][0] == 'serverinfo_js':
                start_response('200 OK', [('Content-Type', 'text/javascript; charset=UTF-8')])
                # Can't use a generator expression here because we need to maintain Python 2.3 compat.
                return ["var __server_py_script_name__ = \"%s\";\n" % ''.join(["\\u%.4x" % ord(c) for c in PY_SCRIPT_NAME])]
            elif qs_hash['include'][0] == 'js':
                m = js_create_monster_string(os.path.join(PWD, CFG['JS_INCLUDES_DIR']), '.js', CFG['JS_INCLUDES_LIST'], "js_includes")
                start_response('200 OK', [('Content-Type', 'text/javascript; charset=UTF-8'), ('Pragma', 'no-cache')])
                return [m]
            elif qs_hash['include'][0] == 'css':
                sys.stderr.write(os.path.join(PWD, CFG['CSS_INCLUDES_DIR']))
                m = css_create_monster_string(os.path.join(PWD, CFG['CSS_INCLUDES_DIR']), '.css', CFG['CSS_INCLUDES_LIST'], "css_includes")
                start_response('200 OK', [('Content-Type', 'text/css; charset=UTF-8'), ('Pragma', 'no-cache')])
                return [m]
            elif qs_hash['include'][0] == 'data':
                m = js_create_monster_string(os.path.join(PWD, CFG['DATA_INCLUDES_DIR']), '.js', CFG['DATA_INCLUDES_LIST'], "data_includes")
                start_response('200 OK', [('Content-Type', 'text/javascript; charset=UTF-8'), ('Pragma', 'no-cache')])
                return [m]
            elif qs_hash['include'][0] == 'main.js':
                contents = None
                f = None
                try:
                    try:
                        f = open(os.path.join(PWD, CFG['OTHER_INCLUDES_DIR'], 'main.js'))
                        contents = f.read()
                    except IOError:
                        start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=UTF-8')])
                        return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
                finally:
                    if f: f.close()

                # UGLY: Holds some var defs that we'll prepend to the main.js.
                defs = []

                # Do we set the 'overview' option?
                retlist = [contents]
                if qs_hash.has_key('overview') and qs_hash['overview'][0].upper() == "YES":
                    defs.append("var conf_showOverview = true;\n")

                # Set the value of the counter (either saved, or provided as part of the URL).
                counter_value = None
                try:
                    counter_value = (qs_hash.has_key('withsquare') and (int(qs_hash['withsquare'][0]),) or (get_counter(),))[0]
                except ValueError:
                    start_response('400 Bad Request', [('Content-Type', 'text/html; charset=UTF-8')])
                    return ["<html><body><h1>400 Bad Request</h1></body></html>"]
                defs.append("var __counter_value_from_server__ = %i;\n" % counter_value)

                retlist = defs + retlist
                start_response('200 OK', [('Content-Type', 'text/javascript; charset=UTF-8')])
                return retlist

        # Is it a request for a JSON dict of all chunks? This should maybe be cached at some point.
        if qs_hash.has_key('allchunks'):
            jsondict = { }
            f = None
            try:
                for fname in os.listdir(os.path.join(PWD, CFG['CHUNK_INCLUDES_DIR'])):
                    if fname.endswith(".wav") or fname.endswith(".mp3") or fname.endswith("m4a"):
                        continue
                    f = None
                    try:
                        try:
                            f = open(os.path.join(PWD, CFG['CHUNK_INCLUDES_DIR'], fname))
                            jsondict[fname] = f.read()
                        except IOError, e:
                            if e.errno == errno.EISDIR:
                                pass
                            else:
                                start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=UTF-8')])
                                return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
                    finally:
                        if f: f.close()
            except IOError, e:
                start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=UTF-8')])
                return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]

            start_response('200 OK', [('Content-Type', 'text/plain; charset=UTF-8')]) # Still trying to support IE 6 LOL
            return [dict_to_json(jsondict)]

        # or a resource?
        if qs_hash.has_key('resource'):
            f = None
            try:
                p = os.path.join(PWD, CFG['CHUNK_INCLUDES_DIR'], qs_hash['resource'][0])
                stats = os.stat(p)
                # Don't allow files bigger than 10MB to be downloaded.
                if stats.st_size > 10 * 1024 * 1024:
                    start_response('500 Internal Server Error' [('Content-Type', 'text/html; charset=UTF-8')])
                    return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
                f = open(p, 'rb')
                def it():
                    block = None
                    while block is None or len(block) > 0:
                        block = f.read(2048)
                        if len(block) == 0:
                            f.close()
                            raise StopIteration
                        yield block

                start_response('200 OK', [('Content-Type', 'audio/mpeg'), ('Content-Length', stats.st_size)])
                return it()
            except IOError, e:
                start_response('500 Internal Server Error' [('Content-Type', 'text/html; charset=UTF-8')])
                return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]

        if qs_hash.has_key('withsquare'):
            ivalue = None
            try:
                ivalue = int(qs_hash['withsquare'][0])
            except ValueError:
                start_response('400 Bad Request', [('Content-Type', 'text/html; charset=UTF-8')])
                return ["<html><body><h1>400 Bad Request</h1></body></html>"]

            start_response('200 OK', [('Content-Type', 'text/html; charset=UTF-8')])
            return [generate_html(setcounter=ivalue, overview=False)]

        if qs_hash.has_key('setsquare'):
            updatef = None
            setsquare = qs_hash['setsquare'][0]
            try:
                if setsquare.startswith('inc-'):
                    ivalue = int(setsquare[4:])
                    updatef = lambda x: x + ivalue
                else:
                    ivalue = int(setsquare)
                    updatef = lambda x: ivalue
            except ValueError, e:
                start_response('400 Bad Request', [('Content-Type', 'text/html; charset=UTF-8')])
                return ["<html><body><h1>400 Bad Request</h1></body></html>"]
            update_counter(updatef)
            start_response('200 OK', [('Content-Type', 'text/html; charset=UTF-8')])
            return []

        # (All branches above end with a return from this function.)

        # ...if none of the above, it's some results.
        if not (env['REQUEST_METHOD'] == 'POST' and env.has_key('CONTENT_LENGTH')):
            start_response('400 Bad Request', [('Content-Type', 'text/html; charset=UTF-8')])
            return ["<html><body><h1>400 Bad Request</h1></body></html>"]

        content_length = None
        content_encoding = None
        try:
            content_length = int(env['CONTENT_LENGTH'])
            encoding_re = re.compile(r"((charset)|(encoding))\s*=\s*(?P<encoding>[A-Za-z0-9_-]+)")
            res = encoding_re.search(env['CONTENT_TYPE'])
            if res: content_encoding = res.group('encoding')
        except ValueError:
            start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=UTF-8')])
            return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
        except IndexError:
            pass
        if not content_encoding: content_encoding = DEFAULT_ENCODING

        post_data = env['wsgi.input'].read(content_length)
        post_data = post_data.decode(content_encoding, 'ignore')

        # This will be called in the normal course of events, and if
        # there is an error parsing the JSON.
        def backup_raw_post_data(header=None):
            bf = None
            try:
                try:
                    bf = lock_and_open(os.path.join(PWD, CFG['RESULT_FILES_DIR'], CFG['RAW_RESULT_FILE_NAME']), "a")
                    if header:
                        bf.write(u"\n")
                        bf.write(header.encode(DEFAULT_ENCODING))
                    bf.write(post_data.encode(DEFAULT_ENCODING))
                except:
                    pass
            finally:
                if bf: unlock_and_close(bf)

        rf = None
        try:
            try:
                dec = JSONDecoder()
                parsed_json = dec.decode(post_data)
                random_counter, counter, main_results, column_names, should_update_counter = rearrange(parsed_json, thetime, ip, user_agent)
                header = None
                if CFG['INCLUDE_HEADERS_IN_RESULTS_FILE']:
                    header = u'#\n# Results on %s.\n# USER AGENT: %s\n# %s\n#\n' % \
                        (time_module.strftime(u"%A %B %d %Y %H:%M:%S UTC",
                                              time_module.gmtime(thetime)),
                         user_agent,
                         u"Design number was " + ((random_counter and u"random = " or u"non-random = ") + unicode(counter)))
                backup_raw_post_data(header)
                if CFG['INCLUDE_COMMENTS_IN_RESULTS_FILE']:
                    main_results = get_comment_intersperser()(main_results, column_names)
                csv_results = to_csv(main_results)
                rf = lock_and_open(os.path.join(PWD, CFG['RESULT_FILES_DIR'], CFG['RESULT_FILE_NAME']), "a")
                rf.write(header.encode(DEFAULT_ENCODING))
                rf.write(csv_results.encode(DEFAULT_ENCODING))

                # Everything went OK with receiving and recording the results, so
                # update the counter.
                if should_update_counter:
                    update_counter(lambda x: x + 1)

                start_response('200 OK', [('Content-Type', 'text/plain; charset=ascii')])
                return ["OK"]
            except ValueError: # JSON parse failed.
                backup_raw_post_data(header="# BAD REQUEST FROM %s\n" % user_agent)
                start_response('400 Bad Request', [('Content-Type', 'text/html; charset=UTF-8')])
                return ["<html><body><1>400 Bad Request</h1></body></html>"]
            except HighLevelParseError:
                backup_raw_post_data(header="# BAD REQUEST FROM %s\n" % user_agent)
                start_response('400 Bad Request', [('Content-Type', 'text/html; charset=UTF-8')])
                return ["<html><body><1>400 Bad Request</h1></body></html>"]
            except IOError:
                start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=UTF-8')])
                return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
        finally:
            if rf: unlock_and_close(rf)
    else:
        start_response('404 Not Found', [('Content-Type', 'text/html; charset=UTF-8')])
        return ["<html><body><h1>404 Not Found</h1></body></html>"]

if CFG['SERVER_MODE'] != "cgi":
    class ThreadedHTTPServer(SocketServer.ThreadingMixIn, BaseHTTPServer.HTTPServer):
        pass

    class MyHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler, ):
        STATIC_FILES = [
            'experiment.html',
            'overview.html',
            'json.js',
            'conf.js',
            'shuffle.js',
            'util.js',
            'backcompatcruft.js',
            'jquery.min.js',
            'jquery-ui.min.js',
            'PluginDetect.js',
            'jsDump.js',
            'soundmanager2-jsmin.js',
            'soundmanager2_debug.swf'
        ]

        def __init__(self, request, client_address, server):
            self.extensions_map = {
                '' : "application/octet-stream",
                ".html" : "text/html; charset=UTF-8",
                ".css"  : "text/css",
                ".js"   : "text/javascript",
                ".swf"  : "application/x-shockwave-flash"
            }

            SimpleHTTPServer.SimpleHTTPRequestHandler.__init__(self, request, client_address, server)

        def do_either(self, method_name):
            last = filter(lambda x: x != [], self.path.split('/'))[-1];
            ps = last.split('?')
            qs = len(ps) > 1 and ps[1] or None
            path = ps[0]
            if method_name == 'GET' and path in MyHTTPRequestHandler.STATIC_FILES:
                return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self);
            else:
                # Bit of a hack. The 'control' function was written for use with the
                # paste module's simple HTTP server, but SimpleHTTPServer has a different
                # interface, so we bridge the gap here.
                response_type = [None]
                headers = [None]
                def start_response(response_type_, headers_):
                    response_type[0] = response_type_
                    headers[0] = headers_
                env = {
                    "REMOTE_ADDR"    : self.client_address[0], # self.client_address is a (host,port) tuple.
                    "REQUEST_URI"    : path,
                    "REQUEST_METHOD" : method_name,
                }
                if qs:
                    env['QUERY_STRING'] = qs
                if method_name == "POST":
                    env['wsgi.input'] = self.rfile
                cl = self.headers.getheader("Content-Length")
                if cl:
                    env['CONTENT_LENGTH'] = cl
                ct = self.headers.getheader("Content-Type")
                if ct:
                    env['CONTENT_TYPE'] = ct
                ua = self.headers.getheader("User-Agent")
                if ua:
                    env['USER_AGENT'] = ua

                body = control(env, start_response)
                assert response_type[0]
                rts = response_type[0].split(' ')
                try:
                    self.send_response(int(rts[0]), ' '.join(rts[1:]))
                    if headers[0]:
                        for h in headers[0]:
                            self.send_header(h[0], h[1])
                    self.wfile.write('\n')
                    for cs in body:
                        self.wfile.write(cs)
                except:
                    # If we let exceptions percolate, we end up serving things as static
                    # files which shouldn't be.
                    logger.error("Error in responding to GET/POST request for toy Python HTTP server.");

        def do_GET(self):
            self.do_either('GET')

        def do_POST(self):
            self.do_either('POST')

if __name__ == "__main__":
    if COUNTER_SHOULD_BE_RESET:
        set_counter(0)
        print "Counter for latin square designs has been reset.\n"

    if CFG['SERVER_MODE'] in ["paste", "toy"]:
        server_address = ('', CFG['PORT'])
        httpd = ThreadedHTTPServer(server_address, MyHTTPRequestHandler)
        httpd.path = CFG['STATIC_FILES_DIR']
        httpd.serve_forever()
    elif CFG['SERVER_MODE'] == "cgi":
        #wsgiref.handlers.CGIHandler().run(control)
        env = { }
        for k in os.environ:
            env[k] = os.environ[k]
        env['wsgi.input'] = sys.stdin
        def start_response(type, headers):
            sys.stdout.write("Content-Type: %s\n" % type)
            for h in headers:
                sys.stdout.write("%s: %s\n" % h)
            sys.stdout.write("\n")
        for l in control(env, start_response):
            sys.stdout.write(l)
