#!/bin/bash
set -ex
sudo pm2 stop all > /home/ubuntu/output.log
sudo pm2 delete all >> /home/ubuntu/output.log