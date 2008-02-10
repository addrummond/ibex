# The port the server will run on if running in stand-alone
# mode.
PORT = 3000

# The name of the directory where result files will be stored.
# The directory will automatically be created if it doesn't exist
# (but if it is itself contained within a non-existent directory,
# this won't happen).
RESULT_FILES_DIR = "results"

# The name of the file where results will be stored (within
# the RESULT_FILES_DIR directory).
RESULT_FILE_NAME = "results"
# The name of the file where raw results will be stored (within
# the RESULT_FILES_DIR directory).
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

# The name of the directory where Javascript includes are stored
# (relative to the working directory of the server).
JS_INCLUDES_DIR = "js_includes"
# The name of the directory where CSS includes are stored
# (relative to the working directory of the server).
CSS_INCLUDES_DIR = "css_includes"

# Optionally define this variable to set the working directory
# of the server. You can also define the environment variable of
# the same name (the value of the environment variable takes
# precedence over the value of this variable).
#
# WEBSPR_WORKING_DIR = "foo"

# These variables specify which of the files in the js_includes
# and css_includes directories should actually be included.
# The value of each variable should be a list whose first element
# is either the string "block" or the string "allow". The remainder
# of the list gives the filenames of those js/css files which should
# be allowed/blocked.
JS_INCLUDES_LIST = ["block"]  # Block nothing (i.e. allow everything)
CSS_INCLUDES_LIST = ["block"] # Ditto.
