import time

def nice_time(t):
    return time.strftime("%a, %d-%b-%Y %H:%M:%S", time.gmtime(t))
