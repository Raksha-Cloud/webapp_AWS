#!/bin/bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get clean
sudo chown ubuntu ./*
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install nodejs -y
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'admin';"
sudo apt-get install zip unzip
echo "=========================================== start unzipping changes ==========================================="
sleep 10
ls -lrta
whoami
unzip webapp.zip
sudo rm -rf webapp.zip
echo "############################################ unzip done #########################################################"
# sudo chown ubuntu:ubuntu webapp 
# cd webapp
sudo npm install
ls -lrta
pwd
echo "############################################ Installed Node Modules #############################################"
sudo npm run test

echo "############################################ Running Unit Test cases done ########################################"
sudo mv /home/ubuntu/webapp.service /etc/systemd/system/webapp.service
sudo systemctl enable webapp.service
sudo systemctl start webapp.service
echo "############################################ THE END #############################################################"


