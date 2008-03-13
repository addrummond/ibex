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
import types
import logging
import getopt
import itertools
import StringIO
import md5
import time as time_module
import types
import os
import os.path
import cgi
import string

PY_SCRIPT_NAME = "server.py"


#
# =========== START OF decoder.py AND scanner.py FROM simple_json PACKAGE ==========
#
# This package is licensed under the MIT license (which is compatible with the BSD
# license used for webspr).
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

DEFAULT_ENCODING = "utf-8"

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


c = { }
try:
    execfile(SERVER_CONF_PY_FILE, c)
except Exception, e:
    print "Could not open/load config file: %s" % e
    sys.exit(1)


#
# Random utility.
#
def nice_time(t):
    return time_module.strftime("%a, %d-%b-%Y %H:%M:%S", time_module.gmtime(t))


#
# Logging and configuration variables.
#

logging.basicConfig(filename=os.path.join(c.has_key('WEBSPR_WORKING_DIR') and c['WEBSPR_WORKING_DIR'] or '',
                                          "server.log"))
logger = logging.getLogger("server")
logger.addHandler(logging.StreamHandler())

# Check that all conf variables have been defined
# (except the optional WEBSPR_WORKING_DIR and PORT variables).
for k in ['RESULT_FILE_NAME',
          'RAW_RESULT_FILE_NAME', 'SERVER_STATE_DIR',
          'SERVER_MODE', 'JS_INCLUDES_DIR', 'DATA_INCLUDES_DIR',
          'CSS_INCLUDES_DIR', 'OTHER_INCLUDES_DIR', 'JS_INCLUDES_LIST', 'DATA_INCLUDES_LIST',
          'CSS_INCLUDES_LIST', 'STATIC_FILES_DIR']:
    if not c.has_key(k):
        logger.error("Configuration variable '%s' was not defined." % k)
        sys.exit(1)
# Define optional variables if they are not already defined.
c['PORT'] = c.has_key('PORT') and c['PORT'] or None
c['WEBSPR_WORKING_DIR'] = c.has_key('WEBSPR_WORKING_DIR') and c['WEBSPR_WORKING_DIR'] or None

# Check for "-m" and "-p" options (sets server mode and port respectively).
# Also check for "-r" option (resest counter on startup).
COUNTER_SHOULD_BE_RESET = False
try:
    opts, _ = getopt.getopt(sys.argv[1:], "m:p:r")
    for k,v in opts:
        if k == "-m":
            c['SERVER_MODE'] = v
        elif k == "-p":
            c['PORT'] = int(v)
        elif k == "-r":
            COUNTER_SHOULD_BE_RESET = True
except getopt.GetoptError:
    logger.error("Bad arguments")
    sys.exit(1)
except ValueError:
    logger.error("Argument to -p must be an integer")
    sys.exit(1)

# Check values of (some) conf variables.
if type(c['PORT']) != types.IntType:
    logger.error("Bad value (or no value) for server port.")
    sys.exit(1)
if type(c['JS_INCLUDES_LIST']) != types.ListType or len(c['JS_INCLUDES_LIST']) < 1 or (c['JS_INCLUDES_LIST'][0] not in ["block", "allow"]):
    logger.error("Bad value for 'JS_INCLUDES_LIST' conf variable.")
    sys.exit(1)
if type(c['CSS_INCLUDES_LIST']) != types.ListType or len(c['CSS_INCLUDES_LIST']) < 1 or (c['CSS_INCLUDES_LIST'][0] not in ["block", "allow"]):
    logger.error("Bad value for 'CSS_INCLUDES_LIST' conf variable.")
    sys.exit(1)
if type(c['DATA_INCLUDES_LIST']) != types.ListType or len(c['DATA_INCLUDES_LIST']) < 1 or (c['DATA_INCLUDES_LIST'][0] not in ["block", "allow"]):
    logger.error("Bad value for 'DATA_INCLUDES_LIST' conf variable.")
    sys.exit(1)


# File locking on UNIX/Linux/OS X
HAVE_FLOCK = False
try:
    import fcntl # For flock.
    if 'flock' in dir(fcntl) and \
       type(fcntl.flock) == types.BuiltinFunctionType:
        HAVE_FLOCK = True
except:
    pass

# Configuration.
if c['SERVER_MODE'] == "paste":
    from paste import httpserver
elif c['SERVER_MODE'] == "cgi":
    import wsgiref.handlers
else:
    logger.error("Unrecognized value for SERVER_MODE configuration variable (or '-m' command line option).")
    sys.exit(1)

PWD = None
if c.has_key('WEBSPR_WORKING_DIR'):
    PWD = c['WEBSPR_WORKING_DIR']
if os.environ.get("WEBSPR_WORKING_DIR"):
    PWD = os.environ.get("WEBSPR_WORKING_DIR")
if PWD is None: PWD = ''


#
# Some utility functions/classes.
#

def lock_and_open(filename, mode):
    if os.path.exists(filename):
        f = open(filename, "r") # Open first as read-only.
        if HAVE_FLOCK:
            fcntl.flock(f.fileno(), 2)
        if mode != "r": # If necessary, reopen with the given mode.
            f.close()
            f = open(filename, mode)
        return f
    else:
        f = open(filename, mode)
        return f
def unlock_and_close(f):
    if HAVE_FLOCK:
        fcntl.flock(f.fileno(), 8)
    f.close()

def get_counter():
    try:
        f = lock_and_open(os.path.join(PWD, c['SERVER_STATE_DIR'], 'counter'), "r")
        n = int(f.read().strip())
        unlock_and_close(f)
        return n
    except IOError, ValueError:
        logger.error("Error reading counter from server state")
        sys.exit(1)
def set_counter(n):
    try:
        f = lock_and_open(os.path.join(PWD, c['SERVER_STATE_DIR'], 'counter'), "w")
        f.write(str(n))
        unlock_and_close(f)
    except IOError:
        logger.error("Error setting counter in server state")
        sys.exit(1)

class HighLevelParseError(Exception):
    def __init__(self, *args):
        Exception.__init__(self, *args)

def rearrange(parsed_json, thetime, ip):
    if type(parsed_json) != types.ListType or len(parsed_json) != 3:
        raise HighLevelParseError()

    random_counter = parsed_json[0]
    if type(random_counter) != types.BooleanType:
        raise HighLevelParseError()

    counter = None
    try:
        counter = int(parsed_json[1])
    except ValueError:
        raise HighLevelParseError()
    
    new_results = []
    for line in parsed_json[2]:
        new_results.append([int(round(thetime)), md5.md5(ip).hexdigest()] + line)

    return random_counter, counter, new_results

def to_csv(lines):
    s = StringIO.StringIO()
    for l in lines:
        s.write(','.join(map(str, l)))
        s.write('\n')
    return s.getvalue()


#
# The server itself.
#

def counter_cookie_header(c):
    return (
        "Set-Cookie",
        "counter=%i; path=/; expires=%s GMT" % \
        (c,
         nice_time(time_module.time() + 60 * 60))
    )

def create_monster_string(dir, extension, block_allow):
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
    except:
        logger.error("Error getting directory listing for Javascript include directory '%s'" % dir)
        sys.exit(1)

    s = StringIO.StringIO()
    f = None
    try:
        for fn in filenames:
            f = open(fn)
            s.write(f.read())
            s.write('\n\n')
            f.close()
    except Exception, e:
        logger.error("Error reading Javascript files in '%s'" % dir)
        sys.exit(1)
    finally:
        if f: f.close()

    return s.getvalue()

# Not used when this module is run as a CGI process.
STATIC_FILES = [
    'experiment.html',
    'overview.html',
    'json.js',
    'conf.js',
    'shuffle.js',
    'util.js',
]

def control(env, start_response):
    # Save the time the results were received.
    thetime = time_module.time()

    def cc_start_response(status, headers):
        c = get_counter()
        start_response(status, headers + [counter_cookie_header(c)])
        set_counter(c + 1)

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

    base = env.has_key('REQUEST_URI') and env['REQUEST_URI'] or env['PATH_INFO']
    # Sometimes the query string likes to stick around.
    base = base.split('?')[0]

    last = filter(lambda x: x != [], base.split('/'))[-1];

    if last in STATIC_FILES:
        contents = None
        f = None
        try:
            f = open(os.path.join(PWD, c['STATIC_FILES_DIR'], last))
            contents = f.read()
        except IOError:
            start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
        finally:
            if f: f.close()
        start_response('200 OK', [('Content-Type', (last.endswith('.html') and 'text/html' or 'text/javascript') +'; charset=utf-8')])
        return [contents]
    elif last == PY_SCRIPT_NAME:
        qs = env.has_key('QUERY_STRING') and env['QUERY_STRING'].lstrip('?') or ''
        qs_hash = cgi.parse_qs(qs)

        # Is it a request for a JS/CSS include file?
        if qs_hash.has_key('include'): 
            if qs_hash['include'][0] == 'js':
                m = create_monster_string(os.path.join(PWD, c['JS_INCLUDES_DIR']), '.js', c['JS_INCLUDES_LIST'])
                start_response('200 OK', [('Content-Type', 'text/javascript; charset=utf-8'), ('Pragma', 'no-cache')])
                return [m]
            elif qs_hash['include'][0] == 'css':
                m = create_monster_string(os.path.join(PWD, c['CSS_INCLUDES_DIR']), '.css', c['CSS_INCLUDES_LIST'])
                start_response('200 OK', [('Content-Type', 'text/css; charset=utf-8'), ('Pragma', 'no-cache')])
                return [m]
            elif qs_hash['include'][0] == 'data':
                m = create_monster_string(os.path.join(PWD, c['DATA_INCLUDES_DIR']), '.js', c['DATA_INCLUDES_LIST'])
                start_response('200 OK', [('Content-Type', 'text/javascript; charset=utf-8'), ('Pragma', 'no-cache')])
                return [m]
            elif qs_hash['include'][0] == 'main.js':
                contents = None
                f = None
                try:
                    f = open(os.path.join(PWD, c['OTHER_INCLUDES_DIR'], 'main.js'))
                    contents = f.read()
                except IOError:
                    start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=utf-8')])
                    return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
                finally:
                    if f: f.close()
                # Do we set the 'overview' option?
                if qs_hash.has_key('overview') and qs_hash['overview'][0].upper() == "YES":
                    # UGLY: We just prepend a variable declaration to the file.
                    contents = "var conf_showOverview = true;\n\n" + contents
                cc_start_response('200 OK', [('Content-Type', 'text/javascript; charset=utif-8')])
                return [contents]

        # ...if not, it's some results.

        if not (env['REQUEST_METHOD'] == 'POST') and (env.has_key('CONTENT_LENGTH')):
            start_response('400 Bad Request', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><h1>400 Bad Request</h1></body></html>"]

        content_length = None
        try:
            content_length = int(env['CONTENT_LENGTH'])
        except ValueError:
            start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]

        post_data = env['wsgi.input'].read(content_length)

        # This will be called in the normal course of events, and if
        # there is an error parsing the JSON.
        def backup_raw_post_data(header=None):
            bf = None
            try:
                bf = lock_and_open(os.path.join(PWD, c['RESULT_FILES_DIR'], c['RAW_RESULT_FILE_NAME']), "a")
                if header:
                    bf.write("\n")
                    bf.write(header)
                bf.write(post_data)
            except:
                pass
            finally:
                if bf: unlock_and_close(bf)

        rf = None
        try:
            dec = JSONDecoder()
            parsed_json = dec.decode(post_data)
            random_counter, counter, main_results = rearrange(parsed_json, thetime, ip)
            header = '#\n# Results on %s.\n# USER AGENT: %s\n# %s\n#\n' % \
                (time_module.strftime("%A %B %d %Y %H:%M:%S UTC",
                                      time_module.gmtime(thetime)),
                 user_agent,
                 "Design number was " + ((random_counter and "random = " or "non-random = ") + str(counter)))
            rf = lock_and_open(os.path.join(PWD, c['RESULT_FILES_DIR'], c['RESULT_FILE_NAME']), "a")
            backup_raw_post_data(header)
            csv_results = to_csv(main_results)
            rf.write(header)
            rf.write(csv_results)

            start_response('200 OK', [('Content-Type', 'text/plain; charset=ascii')])
            return ["OK"]
        except ValueError: # JSON parse failed.
            backup_raw_post_data(header="# BAD REQUEST FROM %s\n" % user_agent)
            start_response('400 Bad Request', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><1>400 Bad Request</h1></body></html>"]
        except HighLevelParseError:
            backup_raw_post_data(header="# BAD REQUEST FROM %s\n" % user_agent)
            start_response('400 Bad Request', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><1>400 Bad Request</h1></body></html>"]
        except IOError:
            start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
        finally:
            if rf: unlock_and_close(rf)
    else:
        start_response('404 Not Found', [('Content-Type', 'text/html; charset=utf-8')])
        return ["<html><body><h1>404 Not Found</h1></body></html>"]

# Create a directory for storing results (if it doesn't already exist).
try:
    # Create the directory.
    if os.path.isfile(os.path.join(PWD, c['RESULT_FILES_DIR'])):
        logger.error("'%s' is a file, so could not create results directory" % c['RESULT_FILES_DIR'])
        sys.exit(1)
    elif not os.path.isdir(os.path.join(PWD, c['RESULT_FILES_DIR'])):
        os.mkdir(os.path.join(PWD, c['RESULT_FILES_DIR']))
except os.error, IOError:
    logger.error("Could not create results directory at %s" % os.path.join(PWD, c['RESULT_FILES_DIR']))
    sys.exit(1)

# Create a directory for storing the server state
# (if it doesn't already exist), and initialize the counter.
try:
    # Create the directory.
    if os.path.isfile(os.path.join(PWD, c['SERVER_STATE_DIR'])):
        logger.error("'%s' is a file, so could not create server state directory" % c['SERVER_STATE_DIR'])
        sys.exit(1)
    elif not os.path.isdir(os.path.join(PWD, c['SERVER_STATE_DIR'])):
        os.mkdir(os.path.join(PWD, c['SERVER_STATE_DIR']))

    # Initialize the counter, if there isn't one already.
    if not os.path.isfile(os.path.join(PWD, c['SERVER_STATE_DIR'], 'counter')):
        f = open(os.path.join(PWD, c['SERVER_STATE_DIR'], 'counter'), "w")
        f.write("0")
        f.close()
except os.error, IOError:
    logger.error("Could not create server state directory at %s" % os.path.join(PWD, c['SERVER_STATE_DIR']))
    sys.exit(1)

if COUNTER_SHOULD_BE_RESET:
    print "Counter for latin square designs has been reset.\n"
    set_counter(0)

if c['SERVER_MODE'] == "paste":
    httpserver.serve(control, port=c['PORT'])
elif c['SERVER_MODE'] == "cgi":
    wsgiref.handlers.CGIHandler().run(control)
