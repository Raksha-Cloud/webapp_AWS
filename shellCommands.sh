#!/bin/bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get clean
sudo chown ubuntu ./*
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install nodejs -y
sudo apt-get install zip unzip
echo "=========================================== start unzipping changes ==========================================="
sleep 10
ls -lrta
whoami
unzip webapp.zip
sudo rm -rf webapp.zip
echo "############################################ unzip done #########################################################"
ls -lrta
pwd
echo "############################################ THE END #############################################################"


