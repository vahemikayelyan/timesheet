#!/usr/bin/env bash
awhile=2

sleep $awhile && start http://localhost:3000/ &

node app.js