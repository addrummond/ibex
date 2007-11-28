# The URI for sending results to the server.
# Keep this in sync with the value of the 'serverURI'
# variable in your data.js.
PY_SCRIPT_NAME = "server.py"
# The port the server will run on if running in stand-alone
# mode.
PORT = 3000

# The name of the file where results will be stored.
RESULT_FILE_NAME = "results"
# The name of the file where raw results will be stored.
RAW_RESULT_FILE_NAME = "raw_results"
# The name of the directory where server state will be stored.
# (This is relative to the working directory of the server;
# specifying an absolute path won't work.)
SERVER_STATE_DIR = "server_state"

# Options are "paste" or "cgi" (case-sensitive).
# If "paste", the server will run in stand-alone mode.
# If "cgi", the server will run as a CGI process.
#
# Note that the value of this variable can be overridden by the
# "-m" command line option.
SERVER_MODE = "paste"

# Optionally define this variable to set the working directory
# of the server. You can also define the environment variable of
# the same name (the value of the environment variable takes
# precedence over the value of this variable).
#
# WEBSPR_WORKING_DIR = "foo"

# Define ALL of the following variables if you want the server to send
# email when a subject has completed an experiment.
#
#RESULTS_SMTP          = "mail.umd.edu"
#RESULTS_SMTP_USERNAME = "alexdd@umd.edu"
#RESULTS_EMAIL_FROM    = "SA_results"
#RESULTS_EMAIL_TO      = "a.d.drummond@gmail.com"
#RESULTS_PASSWORD      = "mnWP[[]]"
#
# The 'RESULTS_PASSWORD' variable should be set to None if no
# authentication is required by the SMTP server.  Note that in most
# circumstances, it is not necessary for the value of
# RESULTS_EMAIL_FROM to be a real email address.
