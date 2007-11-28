import sys
import json
import time
from util import *
import smtplib

assert len(sys.argv) == 2
tmpfilename = sys.argv[1]
f = None
contents = None
try:
    try:
        f = open(tmpfilename, "r")
        s = f.read()
        print s
        contents = json.read(s)
    except (IOError, json.ReadException), e:
        # TODO: Should log error.
        print "ERROR 1"
        sys.exit(1)
finally:
    if f: f.close()

experiment_type = contents['experiment_type']
time = contents['time']
results_header = contents['results_header']
child_pid = contents['child_pid']

try:
    msg = "From: %s\r\nTo: %s\r\nSubject: %s at %s\r\nType: text/plain\r\n\r\n" % (contents['RESULTS_EMAIL_FROM'], contents['RESULTS_EMAIL_TO'], experiment_type, nice_time(time))
    msg += "At %s UTC, results were received by the server.\
 The following header was recorded:\r\n\r\n%s" % (nice_time(time), results_header)

    server = smtplib.SMTP(contents['RESULTS_SMTP'])
    if contents['RESULTS_PASSWORD']:
        server.esmtp_features["auth"] = "TLS" #"LOGIN PLAIN"
        server.login(contents['RESULTS_SMTP_USERNAME'], contents['RESULTS_PASSWORD'])
        server.sendmail(contents['RESULTS_EMAIL_FROM'], contents['RESULTS_EMAIL_TO'], msg)
except Exception, e:
    # TODO: Should log error.
    print "ERROR 2 %s" % str(e)
    sys.exit(1)

# Delete the temporary file.
os.unlink(tmpfilename)

# Wait on the child process.
#os.waitpid(child_pid)

