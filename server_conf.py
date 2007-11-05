# The URI for sending results to the server.
# Keep this in synch with the value of the 'serverURI'
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
SERVER_STATE_DIR = "server_state"

# Options are "paste" or "cgi" (case-sensitive).
# If "paste", the server will run in stand-alone mode.
# If "cgi", the server will run as a CGI process.
SERVER_MODE = "paste"
