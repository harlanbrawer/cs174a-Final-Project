#!/bin/bash
cd "$(dirname "$0")"
python3 -m http.server
python3 -m SimpleHTTPServer
