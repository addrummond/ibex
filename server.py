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
# THIS SOFTWARE IS PROVIDED BY ALEX DRUMMOND ``AS IS'' AND ANY
# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL ALEX DRUMMOND BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import sys
import types
import logging
import getopt
import json
import itertools
import StringIO
import md5
import time as time_module
import types
import os
import os.path
from util import *
from server_conf import *

#
# Logging and configuration variables.
#

logging.basicConfig(filename="server.log")
logger = logging.getLogger("server")
logger.addHandler(logging.StreamHandler())

# Check that all conf variables have been defined
# (except the optional WEBSPR_WORKING_DIR, PORT and email variables).
for k in ['PY_SCRIPT_NAME', 'RESULT_FILE_NAME',
          'RAW_RESULT_FILE_NAME', 'SERVER_STATE_DIR',
          'SERVER_MODE', 'JS_INCLUDES_DIR',
          'CSS_INCLUDES_DIR', 'JS_INCLUDES_LIST',
          'CSS_INCLUDES_LIST']:
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
    'spr.html',
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
    # Currently, we're ignoring the QS.
    # qs = ((env.has_key('QUERY_STRING') and env['QUERY_STRING']) and '?' + env['QUERY_STRING'] or '')

    last = filter(lambda x: x != [], base.split('/'))[-1];
    if last == "js_includes.js":
        m = create_monster_string(JS_INCLUDES_DIR, '.js', JS_INCLUDES_LIST)
        start_response('200 OK', [('Content-Type', 'text/javascript; charset=utf-8'), ('Pragma', 'no-cache')])
        return [m]
    elif last == "css_includes.css":
        m = create_monster_string(CSS_INCLUDES_DIR, '.css', CSS_INCLUDES_LIST)
        start_response('200 OK', [('Content-Type', 'text/css; charset=utf-8'), ('Pragma', 'no-cache')])
        return [m]
    elif last in STATIC_FILES:
        contents = None
        f = None
        try:
            f = open(os.path.join(PWD, last))
            contents = f.read()
        except IOError:
            start_response('500 Internal Server Error', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><h1>500 Internal Server Error</h1></body></html>"]
        finally:
            if f: f.close()
        rr = last == 'main.js' and cc_start_response or start_response
        rr('200 OK', [('Content-Type', (last == 'spr.html' and 'text/html' or 'text/javascript') +'; charset=utf-8')])
        return [contents]
    elif last == PY_SCRIPT_NAME:
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
                bf = lock_and_open(os.path.join(PWD, RAW_RESULT_FILE_NAME), "a")
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
            parsed_json = json.read(post_data)
            random_counter, counter, main_results = rearrange(parsed_json, thetime, ip)
            header = '#\n# Results on %s.\n# USER AGENT: %s\n# %s\n#\n' % \
                (time_module.strftime("%A %B %d %Y %H:%M:%S UTC",
                                      time_module.gmtime(thetime)),
                 user_agent,
                 "Design number was " + ((random_counter and "random = " or "non-random = ") + str(counter)))
            rf = lock_and_open(RESULT_FILE_NAME, "a")
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
