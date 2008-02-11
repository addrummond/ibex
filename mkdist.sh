#!/bin/sh

if [ ! -d dist ]; then
    mkdir dist
fi

tar -cz LICENSE conf.js css_includes/*.css js_includes/*.js json.js json.py main.js mkdist.sh server.py server_conf.py shuffle.js spr.html util.js util.py > dist/webspr-${1}.tar.gz