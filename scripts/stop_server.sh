#!/bin/bash

pm2 stop all >> /home/ubuntu/output.log

pm2 delete all >> /home/ubuntu/output.log