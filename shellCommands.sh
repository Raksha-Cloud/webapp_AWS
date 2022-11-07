#!/bin/bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get clean
sudo chown ubuntu ./*
echo "###################################Installing the cloudwatch agent config file to /opt/cloudwatch-config.json##################"
sudo curl -o /root/amazon-cloudwatch-agent.deb https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E /root/amazon-cloudwatch-agent.deb
echo "###################################Installing node##################"
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install nodejs -y
sudo apt-get install zip unzip
echo "=========================================== start unzipping changes ==========================================="
sleep 10
ls -lrta
whoami
unzip webapp.zip
sudo rm -rf webapp.zip
# Copying cloudwatch agent config file
 echo "###################################Copying the cloudwatch agent config file to /opt/cloudwatch-config.json##################"
 sudo cp /home/ubuntu/webapp/cloudwatch-agent-config.json /opt/cloudwatch-config.json

 # Configuring CloudWatch Agent
 echo "######################################Configuring CloudWatch Agent#######################################################"
 sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/cloudwatch-config.json -s

 sudo mkdir -p /home/ubuntu/webapp/logs
 sudo touch /home/ubuntu/webapp/logs/csye6225.log
 sudo chmod 775 /home/ubuntu/webapp/logs/csye6225.log

echo "############################################ unzip done #########################################################"
ls -lrta
pwd
echo "############################################ THE END #############################################################"


