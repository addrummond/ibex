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
import smtplib
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
          'RAW_RESULT_FILE_NAME', 'SERVER_STATE_DIR', 'SERVER_MODE']:
    if not globals().has_key(k):
        logger.error("Configuration variable '%s' was not defined." % k)
        sys.exit(1)
# Define optional variables if they are not already defined.
PORT = globals().has_key('PORT') and PORT or None
WEBSPR_WORKING_DIR = globals().has_key('WEBSPR_WORKING_DIR') and WEBSPR_WORKING_DIR or None
RESULTS_SMTP = globals().has_key('RESULTS_SMTP') and RESULTS_SMTP or None
RESULTS_SMTP_USERNAME = globals().has_key('RESULTS_SMTP_USERNAME') and RESULTS_SMTP_USERNAME or None
RESULTS_EMAIL_FROM = globals().has_key('RESULTS_EMAIL_FROM') and RESULTS_EMAIL_FROM or None
RESULTS_EMAIL_TO = globals().has_key('RESULTS_EMAIL_TO') and RESULTS_EMAIL_TO or None
RESULTS_PASSWORD = globals().has_key('RESULTS_PASSWORD') and RESULTS_PASSWORD or None

# Check for "-m" and "-p" options (sets server mode and port respectively).
try:
    opts, _ = getopt.getopt(sys.argv[1:], "m:p:")
    for k,v in opts:
        if k == "-m":
            SERVER_MODE = v
        elif k == "-p":
            PORT = int(v)
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
if PWD:
    PWD = PWD.rstrip("/\\") + "/"
else:
    PWD = ''


#
# Some utility functions/classes.
#

def lock_and_open(filename, mode):
    f = open(filename, "r") # Open first as read-only.
    if HAVE_FLOCK:
        fcntl.flock(f.fileno(), 2)
    if mode != "r": # If necessary, reopen with the given mode.
        f.close()
        f = open(filename, mode)
    return f
def unlock_and_close(f):
    if HAVE_FLOCK:
        fcntl.flock(f.fileno(), 8)
    f.close()

def get_counter():
    try:
        f = lock_and_open(PWD + SERVER_STATE_DIR + '/counter', "r")
        n = int(f.read().strip())
        unlock_and_close(f)
        return n
    except IOError, ValueError:
        logger.error("Error reading counter from server state")
        sys.exit(1)
def set_counter(n):
    try:
        f = lock_and_open(PWD + SERVER_STATE_DIR + '/counter', "w")
        f.write(str(n))
        unlock_and_close(f)
    except IOError:
        logger.error("Error setting counter in server state")
        sys.exit(1)

def nice_time(time):
    return time_module.strftime("%a, %d-%b-%Y %H:%M:%S", time_module.gmtime(time))

def send_email(experiment_type, time, results_header):
    # Note that we don't check RESULTS_PASSWORD because it may be None.
    if RESULTS_SMTP and RESULTS_SMTP_USERNAME and RESULTS_EMAIL_TO and RESULTS_EMAIL_FROM:
        try:
            msg = "From: %s\r\nTo: %s\r\nSubject: %s at %s\r\nType: text/plain\r\n\r\n" % (RESULTS_EMAIL_FROM, RESULTS_EMAIL_TO, experiment_type, nice_time(time))
            msg += "At %s, results were received by the server.\
 The following header was recorded:\r\n\r\n%s" % (nice_time(time), results_header)

            server = smtplib.SMTP(RESULTS_SMTP)
            if RESULTS_PASSWORD:
                server.esmtp_features["auth"] = "TLS" #"LOGIN PLAIN"
                server.login(RESULTS_SMTP_USERNAME, RESULTS_PASSWORD)
            server.sendmail(RESULTS_EMAIL_FROM, RESULTS_EMAIL_TO, msg)
        except Exception, e:
            logger.warning("Failed to send email notification: %s" % str(e))
        
class HighLevelParseError(Exception):
    def __init__(self, *args):
        Exception.__init__(self, *args)

class Row(object):
    __slots__ = ['words', 'times', 'newlines', 'type', 'group', 'sentence', 'ip_hash', 'answer']
    def __init__(self, **args):
        for k, v in args.iteritems():
            setattr(self, k, v)

def get_group(g):
    if g is None:
        return "NULL"
    else:
        return str(g)

class SPRResultSet(object):
    def __init__(self, rows):
        self.rows = rows

    def __repr__(self):
        return "SPRResultSet(%s)" % str(self.rows)

    def to_csv(self, thetime):
        out = StringIO.StringIO()
        for row in self.rows:
            sentence = ' '.join(row.words)
            sentence_md5 = md5.md5(sentence).hexdigest()
            for j, time, word, nl in itertools.izip(itertools.count(1), row.times, row.words, row.newlines):
                out.write(
                    "%i,%i,%i,%s,%i,%i,%i,%i,%s,%s,%s\n" % \
                    (thetime, row.sentence, j, str(row.type), time, nl, row.answer, len(word), row.ip_hash, sentence_md5, get_group(row.group))
                )
        return out.getvalue()

class SpeededResultSet(object):
    def __init__(self, rows):
        self.rows = rows

    def __repr__(self): 
        return "SpeededResultSet(%s)" % str(self.rows)

    def to_csv(self, thetime):
        out = StringIO.StringIO()
        for row in self.rows:
            # Where were newlines crossed?
            newline_words = []
            for nl, i in itertools.izip(row.newlines, itertools.count(1)):
                if nl:
                    newline_words.append(str(i))

            sentence = ' '.join(row.words)
            sentence_md5 = md5.md5(sentence).hexdigest()
            out.write("%i,%i,%s,%s,%s,%s,%s,%s\n" % (thetime, row.sentence, str(row.type), '(' + '-'.join(newline_words) + ')', row.answer, row.ip_hash, sentence_md5, get_group(row.group)))
        return out.getvalue()

def rearrange(parsed_json, ip):
    if len(parsed_json) < 2:
        raise HighLevelParseError()

    sentences  = None
    times      = None
    answers    = None
    newlines   = None
    user_agent = None

    # Are these the results of a self-paced reading experiment
    # or of a speeded accpetability experiment?
    if parsed_json[0] == "self-paced reading":
        if len(parsed_json) != 6:
            raise HighLevelParseError()

        sentences  = parsed_json[1]
        times      = parsed_json[2]
        answers    = parsed_json[3]
        newlines   = parsed_json[4]
        user_agent = parsed_json[5]
        if len(sentences) != len(times):
            raise HighLevelParseError()
    elif parsed_json[0] == "speeded acceptability":
        if len(parsed_json) != 5:
            raise HighLevelParseError()

        sentences  = parsed_json[1]
        answers    = parsed_json[2]
        newlines   = parsed_json[3]
        user_agent = parsed_json[4]
    else:
        raise HighLevelParseError()

    rows = []
    for s, t, a, nl in itertools.izip(sentences, times and times or itertools.repeat(None), answers, newlines):
        if not (type(s) == types.DictType and s.has_key('words') and s.has_key('type') and s.has_key('group') and s.has_key('num')):
            raise HighLevelParseError()
        if t and (len(s['words']) - 1 != len(t)):
            raise HighLevelParseError()
        if parsed_json[0] == "self-paced reading" and (not (a == 0 or a == 1 or a == -1)):
            raise HighLevelParseError()

        new_row = Row(words=s['words'], newlines=nl, type=s['type'], group=s['group'], sentence=s['num'], ip_hash=md5.md5(ip).hexdigest(), answer=a)
        if t:
            new_row.times = t
        rows.append(new_row)

    if parsed_json[0] == "self-paced reading":
        return SPRResultSet(rows), user_agent
    elif parsed_json[0] == "speeded acceptability":
        return SpeededResultSet(rows), user_agent
    else:
        raise HighLevelParseError()


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

# Not used when this module is run as a CGI process.
STATIC_FILES = [
    'spr.html',
    'data.js',
    'json.js',
    'main.js',
    'conf.js',
    'shuffle.js',
    'util.js',
    'dashed_sentence.js'
]

def control(env, start_response):
    def cc_start_response(status, headers):
        c = get_counter()
        start_response(status, headers + [counter_cookie_header(c)])
        set_counter(c + 1)

    ip = None
    if env.has_key('HTTP_X_FORWARDED_FOR'):
        ip = env['HTTP_X_FORWARDED_FOR']
    else:
        ip = env['REMOTE_ADDR']

    base = env.has_key('REQUEST_URI') and env['REQUEST_URI'] or env['PATH_INFO']
    # Currently, we're ignoring the QS.
    # qs = ((env.has_key('QUERY_STRING') and env['QUERY_STRING']) and '?' + env['QUERY_STRING'] or '')

    last = filter(lambda x: x != [], base.split('/'))[-1];
    if last in STATIC_FILES:
        contents = None
        f = None
        try:
            f = open(PWD + last)
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

        # Keep a backup of the raw post data.
        bf = None
        try:
            bf = lock_and_open(PWD + RAW_RESULT_FILE_NAME, "a")
            bf.write(post_data)
        except:
            pass
        finally:
            if bf: unlock_and_close(bf)

        rf = None
        try:
            parsed_json = json.read(post_data)
            rf = lock_and_open(RESULT_FILE_NAME, "a")
            thetime = time_module.time()
            main_results, user_agent = rearrange(parsed_json, ip)
            csv_results = main_results.to_csv(thetime)
            header = '#\n# Results on %s; %s.\n# USER AGENT: %s\n#\n' % \
                     (time_module.strftime("%A %B %d %Y %H:%M:%S UTC",
                                           time_module.gmtime(thetime)),
                      parsed_json[0],
                      user_agent)
            rf.write(header)
            rf.write(csv_results)

            send_email(parsed_json[0], thetime, header)

            start_response('200 OK', [('Content-Type', 'text/plain; charset=ascii')])
            return ["OK"]
        except (json.ReadException, HighLevelParseError), e:
            start_response('400 Bad Request', [('Content-Type', 'text/html; charset=utf-8')])
            return ["<html><body><h1>400 Bad Request</h1></body></html>"]
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
    if os.path.isfile(PWD + SERVER_STATE_DIR):
        logger.error("'%s' is a file, so could not create server state directory" % SERVER_STATE_DIR)
        sys.exit(1)
    elif not os.path.isdir(PWD + SERVER_STATE_DIR):
        os.mkdir(PWD + SERVER_STATE_DIR)

    # Initialize the counter, if there isn't one already.
    if not os.path.isfile(PWD + SERVER_STATE_DIR + '/counter'):
        f = open(PWD + SERVER_STATE_DIR + '/counter', "w")
        f.write("0")
        f.close()
except os.error, IOError:
    logger.error("Could not create server state directory at %s" % PWD + SERVER_STATE_DIR)
    sys.exit(1)

if SERVER_MODE == "paste":
    httpserver.serve(control, port=PORT)
elif SERVER_MODE == "cgi":
    wsgiref.handlers.CGIHandler().run(control)
