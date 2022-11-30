#!/bin/bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get clean
sudo chown ubuntu ./*
echo "###################################Installing the cloudwatch agent config file to /opt/cloudwatch-config.json##################"
sudo curl -o /root/amazon-cloudwatch-agent.deb https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E /root/amazon-cloudwatch-agent.deb

echo "Downloading SSL certificate bundle for Postgres SQL"
 sudo wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
 echo "To check if the global-bundle.pem file is downloaded"
 ls global-bundle.pem
 if [ $? -eq 0 ]; then
     echo "global-bundle.pem file downloaded successfully"
 else
     echo "global-bundle.pem file not downloaded"
     exit 1
 fi


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
 echo "###################################Copying the cloudwatch agent config file to /opt/cloudwatch-agent-config.json##################"
 sudo cp /home/ubuntu/cloudwatch-agent-config.json /opt/cloudwatch-agent-config.json
ls -lrta
pwd
 # Configuring CloudWatch Agent
 echo "######################################Configuring CloudWatch Agent#######################################################"
 sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/cloudwatch-agent-config.json -s

 sudo mkdir -p /home/ubuntu/logs
 sudo touch /home/ubuntu/logs/csye6225.log
 sudo chmod 775 /home/ubuntu/logs/csye6225.log

echo "############################################ unzip done #########################################################"
ls -lrta
pwd
echo "############################################ THE END #############################################################"


