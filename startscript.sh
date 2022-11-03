#!/bin/bash

echo "#######using iptables to forward request coming in on port 80 to port 3000 internally.######"
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3300
