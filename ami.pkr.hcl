//setting up variables to build custom AMI
variable "aws_region" {
  type    = string
  default = "us-east-1"
}


variable "source_ami" {
  type    = string
  default = "ami-08c40ec9ead489470" # Ubuntu 22.04 LTS
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "subnet_id" {
  type    = string
  default = "subnet-08e78a1d44cd02b9c"
}


# https://www.packer.io/plugins/builders/amazon/ebs
source "amazon-ebs" "my-ami" {
  ami_users       = ["906950779573"]
  region          = "us-east-1"
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "AMI for CSYE 6225"
  instance_type   = "t2.micro"
  source_ami      = "ami-08c40ec9ead489470"
  ssh_username    = "ubuntu"
  subnet_id       = "subnet-08e78a1d44cd02b9c"
  ami_regions = [
    "us-east-1",
  ]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sda1"
    volume_size           = 8
    volume_type           = "gp2"
  }
}

build {
  sources = ["source.amazon-ebs.my-ami"]

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]
    inline = [
      "echo #############Started with provisioners#############",
    ]
  }

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/home/ubuntu/webapp.zip"
  }

  provisioner "file" {
    destination = "/home/ubuntu/webapp.service"
    source      = "webapp.service"
  }

  provisioner "shell" {
    // environment_vars = [
    //   "DB_HOST=localhost",
    //   "DB_PORT=5432",
    //   "DB_USERNAME=postgres",
    //   "DB_NAME=postgres",
    //   "PORT=3300"
    // ]
    scripts = ["shellCommands.sh"]
  }


}
