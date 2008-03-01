#
# You may need to edit these.
#
SERVER_CONF_PY_FILE = "server_conf.py"
PY_SCRIPT_NAME = "server.py"


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
from server_conf import *
import string

#
# ========== START OF json.py ==========
#

##    json.py implements a JSON (http://json.org) reader and writer.
##    Copyright (C) 2005  Patrick D. Logan
##    Contact mailto:patrickdlogan@stardecisions.com
##
##    This library is free software; you can redistribute it and/or
##    modify it under the terms of the GNU Lesser General Public
##    License as published by the Free Software Foundation; either
##    version 2.1 of the License, or (at your option) any later version.
##
##    This library is distributed in the hope that it will be useful,
##    but WITHOUT ANY WARRANTY; without even the implied warranty of
##    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
##    Lesser General Public License for more details.
##
##    You should have received a copy of the GNU Lesser General Public
##    License along with this library; if not, write to the Free Software
##    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA


class _StringGenerator(object):
	def __init__(self, string):
		self.string = string
		self.index = -1
	def peek(self):
		i = self.index + 1
		if i < len(self.string):
			return self.string[i]
		else:
			return None
	def next(self):
		self.index += 1
		if self.index < len(self.string):
			return self.string[self.index]
		else:
			raise StopIteration
	def all(self):
		return self.string

class WriteException(Exception):
    pass

class ReadException(Exception):
    pass

class JsonReader(object):
    hex_digits = {'A': 10,'B': 11,'C': 12,'D': 13,'E': 14,'F':15}
    escapes = {'t':'\t','n':'\n','f':'\f','r':'\r','b':'\b'}

    def read(self, s):
        self._generator = _StringGenerator(s)
        result = self._read()
        return result

    def _read(self):
        self._eatWhitespace()
        peek = self._peek()
        if peek is None:
            raise ReadException, "Nothing to read: '%s'" % self._generator.all()
        if peek == '{':
            return self._readObject()
        elif peek == '[':
            return self._readArray()            
        elif peek == '"':
            return self._readString()
        elif peek == '-' or peek.isdigit():
            return self._readNumber()
        elif peek == 't':
            return self._readTrue()
        elif peek == 'f':
            return self._readFalse()
        elif peek == 'n':
            return self._readNull()
        elif peek == '/':
            self._readComment()
            return self._read()
        else:
            raise ReadException, "Input is not valid JSON: '%s'" % self._generator.all()

    def _readTrue(self):
        self._assertNext('t', "true")
        self._assertNext('r', "true")
        self._assertNext('u', "true")
        self._assertNext('e', "true")
        return True

    def _readFalse(self):
        self._assertNext('f', "false")
        self._assertNext('a', "false")
        self._assertNext('l', "false")
        self._assertNext('s', "false")
        self._assertNext('e', "false")
        return False

    def _readNull(self):
        self._assertNext('n', "null")
        self._assertNext('u', "null")
        self._assertNext('l', "null")
        self._assertNext('l', "null")
        return None

    def _assertNext(self, ch, target):
        if self._next() != ch:
            raise ReadException, "Trying to read %s: '%s'" % (target, self._generator.all())

    def _readNumber(self):
        isfloat = False
        result = self._next()
        peek = self._peek()
        while peek is not None and (peek.isdigit() or peek == "."):
            isfloat = isfloat or peek == "."
            result = result + self._next()
            peek = self._peek()
        try:
            if isfloat:
                return float(result)
            else:
                return int(result)
        except ValueError:
            raise ReadException, "Not a valid JSON number: '%s'" % result

    def _readString(self):
        result = ""
        assert self._next() == '"'
        try:
            while self._peek() != '"':
                ch = self._next()
                if ch == "\\":
                    ch = self._next()
                    if ch in 'brnft':
                        ch = self.escapes[ch]
                    elif ch == "u":
		        ch4096 = self._next()
			ch256  = self._next()
			ch16   = self._next()
			ch1    = self._next()
			n = 4096 * self._hexDigitToInt(ch4096)
			n += 256 * self._hexDigitToInt(ch256)
			n += 16  * self._hexDigitToInt(ch16)
			n += self._hexDigitToInt(ch1)
			ch = unichr(n)
                    elif ch not in '"/\\':
                        raise ReadException, "Not a valid escaped JSON character: '%s' in %s" % (ch, self._generator.all())
                result = result + ch
        except StopIteration:
            raise ReadException, "Not a valid JSON string: '%s'" % self._generator.all()
        assert self._next() == '"'
        return result

    def _hexDigitToInt(self, ch):
        try:
            result = self.hex_digits[ch.upper()]
        except KeyError:
            try:
                result = int(ch)
	    except ValueError:
	         raise ReadException, "The character %s is not a hex digit." % ch
        return result

    def _readComment(self):
        assert self._next() == "/"
        second = self._next()
        if second == "/":
            self._readDoubleSolidusComment()
        elif second == '*':
            self._readCStyleComment()
        else:
            raise ReadException, "Not a valid JSON comment: %s" % self._generator.all()

    def _readCStyleComment(self):
        try:
            done = False
            while not done:
                ch = self._next()
                done = (ch == "*" and self._peek() == "/")
                if not done and ch == "/" and self._peek() == "*":
                    raise ReadException, "Not a valid JSON comment: %s, '/*' cannot be embedded in the comment." % self._generator.all()
            self._next()
        except StopIteration:
            raise ReadException, "Not a valid JSON comment: %s, expected */" % self._generator.all()

    def _readDoubleSolidusComment(self):
        try:
            ch = self._next()
            while ch != "\r" and ch != "\n":
                ch = self._next()
        except StopIteration:
            pass

    def _readArray(self):
        result = []
        assert self._next() == '['
        done = self._peek() == ']'
        while not done:
            item = self._read()
            result.append(item)
            self._eatWhitespace()
            done = self._peek() == ']'
            if not done:
                ch = self._next()
                if ch != ",":
                    raise ReadException, "Not a valid JSON array: '%s' due to: '%s'" % (self._generator.all(), ch)
        assert ']' == self._next()
        return result

    def _readObject(self):
        result = {}
        assert self._next() == '{'
        done = self._peek() == '}'
        while not done:
            key = self._read()
            if type(key) is not types.StringType:
                raise ReadException, "Not a valid JSON object key (should be a string): %s" % key
            self._eatWhitespace()
            ch = self._next()
            if ch != ":":
                raise ReadException, "Not a valid JSON object: '%s' due to: '%s'" % (self._generator.all(), ch)
            self._eatWhitespace()
            val = self._read()
            result[key] = val
            self._eatWhitespace()
            done = self._peek() == '}'
            if not done:
                ch = self._next()
                if ch != ",":
                    raise ReadException, "Not a valid JSON array: '%s' due to: '%s'" % (self._generator.all(), ch)
	assert self._next() == "}"
        return result

    def _eatWhitespace(self):
        p = self._peek()
        while p is not None and p in string.whitespace or p == '/':
            if p == '/':
                self._readComment()
            else:
                self._next()
            p = self._peek()

    def _peek(self):
        return self._generator.peek()

    def _next(self):
        return self._generator.next()

class JsonWriter(object):
        
    def _append(self, s):
        self._results.append(s)

    def write(self, obj, escaped_forward_slash=False):
        self._escaped_forward_slash = escaped_forward_slash
        self._results = []
        self._write(obj)
        return "".join(self._results)

    def _write(self, obj):
        ty = type(obj)
        if ty is types.DictType:
            n = len(obj)
            self._append("{")
            for k, v in obj.items():
                self._write(k)
                self._append(":")
                self._write(v)
                n = n - 1
                if n > 0:
                    self._append(",")
            self._append("}")
        elif ty is types.ListType or ty is types.TupleType:
            n = len(obj)
            self._append("[")
            for item in obj:
                self._write(item)
                n = n - 1
                if n > 0:
                    self._append(",")
            self._append("]")
        elif ty is types.StringType or ty is types.UnicodeType:
            self._append('"')
	    obj = obj.replace('\\', r'\\')
            if self._escaped_forward_slash:
                obj = obj.replace('/', r'\/')
	    obj = obj.replace('"', r'\"')
	    obj = obj.replace('\b', r'\b')
	    obj = obj.replace('\f', r'\f')
	    obj = obj.replace('\n', r'\n')
	    obj = obj.replace('\r', r'\r')
	    obj = obj.replace('\t', r'\t')
            self._append(obj)
            self._append('"')
        elif ty is types.IntType or ty is types.LongType:
            self._append(str(obj))
        elif ty is types.FloatType:
            self._append("%f" % obj)
        elif obj is True:
            self._append("true")
        elif obj is False:
            self._append("false")
        elif obj is None:
            self._append("null")
        else:
            raise WriteException, "Cannot write in JSON: %s" % repr(obj)

def write(obj, escaped_forward_slash=False):
    return JsonWriter().write(obj, escaped_forward_slash)

def read(s):
    return JsonReader().read(s)

#
# ========== END OF json.py ==========
#


__import__(SERVER_CONF_PY_FILE.rstrip(".py"))


#
# Random utility.
#
def nice_time(t):
    return time_module.strftime("%a, %d-%b-%Y %H:%M:%S", time_module.gmtime(t))


#
# Logging and configuration variables.
#

logging.basicConfig(filename="server.log")
logger = logging.getLogger("server")
logger.addHandler(logging.StreamHandler())

# Check that all conf variables have been defined
# (except the optional WEBSPR_WORKING_DIR, PORT and email variables).
for k in ['RESULT_FILE_NAME',
          'RAW_RESULT_FILE_NAME', 'SERVER_STATE_DIR',
          'SERVER_MODE', 'JS_INCLUDES_DIR',
          'CSS_INCLUDES_DIR', 'JS_INCLUDES_LIST',
          'CSS_INCLUDES_LIST', 'STATIC_FILES_DIR']:
    if not globals().has_key(k):
        logger.error("Configuration variable '%s' was not defined." % k)
        sys.exit(1)
# Define optional variables if they are not already defined.
PORT = globals().has_key('PORT') and PORT or None
WEBSPR_WORKING_DIR = globals().has_key('WEBSPR_WORKING_DIR') and WEBSPR_WORKING_DIR or None

# Check for "-m" and "-p" options (sets server mode and port respectively).
# Also check for "-r" option (resest counter on startup).
COUNTER_SHOULD_BE_RESET = False
try:
    opts, _ = getopt.getopt(sys.argv[1:], "m:p:r")
    for k,v in opts:
        if k == "-m":
            SERVER_MODE = v
        elif k == "-p":
            PORT = int(v)
        elif k == "-r":
            COUNTER_SHOULD_BE_RESET = True
except getopt.GetoptError:
    logger.error("Bad arguments")
    sys.exit(1)
except ValueError:
    logger.error("Argument to -p must be an integer")
    sys.exit(1)

# Check values of (some) conf variables.
if type(PORT) != types.IntType:
    logger.error("Bad value (or no value) for server port.")
    sys.exit(1)
if type(JS_INCLUDES_LIST) != types.ListType or len(JS_INCLUDES_LIST) < 1 or (JS_INCLUDES_LIST[0] not in ["block", "allow"]):
    logger.error("Bad value for 'JS_INCLUDES_LIST' conf variable.")
    sys.exit(1)
if type(CSS_INCLUDES_LIST) != types.ListType or len(CSS_INCLUDES_LIST) < 1 or (CSS_INCLUDES_LIST[0] not in ["block", "allow"]):
    logger.error("Bad value for 'CSS_INCLUDES_LIST' conf variable.")
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
if SERVER_MODE == "paste":
    from paste import httpserver
elif SERVER_MODE == "cgi":
    import wsgiref.handlers
else:
    logger.error("Unrecognized value for SERVER_MODE configuration variable (or '-m' command line option).")
    sys.exit(1)

PWD = None
if globals().has_key('WEBSPR_WORKING_DIR'):
    PWD = WEBSPR_WORKING_DIR
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
        f = lock_and_open(os.path.join(PWD, SERVER_STATE_DIR, 'counter'), "r")
        n = int(f.read().strip())
        unlock_and_close(f)
        return n
    except IOError, ValueError:
        logger.error("Error reading counter from server state")
        sys.exit(1)
def set_counter(n):
    try:
        f = lock_and_open(os.path.join(PWD, SERVER_STATE_DIR, 'counter'), "w")
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
        for path in os.listdir(dir):
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
    'json.js',
    'main.js',
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

    last = filter(lambda x: x != [], base.split('/'))[-1];

    if last in STATIC_FILES:
        contents = None
        f = None
        try:
            f = open(os.path.join(STATIC_FILES_DIR, last))
            contents = f.read()
        except IOError:
            start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
        finally:
            if f: f.close()
        rr = last == 'main.js' and cc_start_response or start_response
        rr('200 OK', [('Content-Type', (last == 'experiment.html' and 'text/html' or 'text/javascript') +'; charset=utf-8')])
        return [contents]
    elif last == PY_SCRIPT_NAME:
        qs = env.has_key('QUERY_STRING') and env['QUERY_STRING'].lstrip('?') or ''
        qs_hash = cgi.parse_qs(qs)

        # Is it a request for a JS/CSS include file?
        if qs_hash.has_key('include'): 
            if qs_hash['include'][0] == 'js':
                m = create_monster_string(JS_INCLUDES_DIR, '.js', JS_INCLUDES_LIST)
                start_response('200 OK', [('Content-Type', 'text/javascript; charset=utf-8'), ('Pragma', 'no-cache')])
                return [m]
            elif qs_hash['include'][0] == 'css':
                m = create_monster_string(CSS_INCLUDES_DIR, '.css', CSS_INCLUDES_LIST)
                start_response('200 OK', [('Content-Type', 'text/css; charset=utf-8'), ('Pragma', 'no-cache')])
                return [m]

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
                bf = lock_and_open(os.path.join(PWD, RESULT_FILES_DIR, RAW_RESULT_FILE_NAME), "a")
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
            parsed_json = read(post_data)
            random_counter, counter, main_results = rearrange(parsed_json, thetime, ip)
            header = '#\n# Results on %s.\n# USER AGENT: %s\n# %s\n#\n' % \
                (time_module.strftime("%A %B %d %Y %H:%M:%S UTC",
                                      time_module.gmtime(thetime)),
                 user_agent,
                 "Design number was " + ((random_counter and "random = " or "non-random = ") + str(counter)))
            rf = lock_and_open(os.path.join(PWD, RESULT_FILES_DIR, RESULT_FILE_NAME), "a")
            backup_raw_post_data(header)
            csv_results = to_csv(main_results)
            rf.write(header)
            rf.write(csv_results)

            start_response('200 OK', [('Content-Type', 'text/plain; charset=ascii')])
            return ["OK"]
        except json.ReadException:
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
    if os.path.isfile(os.path.join(PWD, RESULT_FILES_DIR)):
        logger.error("'%s' is a file, so could not create results directory" % RESULT_FILES_DIR)
        sys.exit(1)
    elif not os.path.isdir(os.path.join(PWD, RESULT_FILES_DIR)):
        os.mkdir(os.path.join(PWD, RESULT_FILES_DIR))
except os.error, IOError:
    logger.error("Could not create results directory at %s" % os.path.join(PWD, RESULT_FILES_DIR))
    sys.exit(1)

# Create a directory for storing the server state
# (if it doesn't already exist), and initialize the counter.
try:
    # Create the directory.
    if os.path.isfile(os.path.join(PWD, SERVER_STATE_DIR)):
        logger.error("'%s' is a file, so could not create server state directory" % SERVER_STATE_DIR)
        sys.exit(1)
    elif not os.path.isdir(os.path.join(PWD, SERVER_STATE_DIR)):
        os.mkdir(os.path.join(PWD, SERVER_STATE_DIR))

    # Initialize the counter, if there isn't one already.
    if not os.path.isfile(os.path.join(PWD, SERVER_STATE_DIR, 'counter')):
        f = open(os.path.join(PWD, SERVER_STATE_DIR, 'counter'), "w")
        f.write("0")
        f.close()
except os.error, IOError:
    logger.error("Could not create server state directory at %s" % os.path.join(PWD, SERVER_STATE_DIR))
    sys.exit(1)

if COUNTER_SHOULD_BE_RESET:
    print "Counter for latin square designs has been reset.\n"
    set_counter(0)

if SERVER_MODE == "paste":
    httpserver.serve(control, port=PORT)
elif SERVER_MODE == "cgi":
    wsgiref.handlers.CGIHandler().run(control)
