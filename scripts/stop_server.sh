#!/bin/bash

set -ex

pm2 stop all
pm2 delete all