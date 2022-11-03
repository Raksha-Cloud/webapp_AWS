# webapp Assignment - 02

Organization cloud application 

<table>
    <thead>
      <tr>
        <th>Name</th>
        <th>NUID</th>
      </tr>
    </thead>
    <tbody>
          <tr>
            <td>Raksha Kagadalu Raju</td>
            <td>002920092</td>
        </tr>
    </tbody>
</table>


### 1. Objective

Create a web application using a technology stack that meets Cloud-Native Web Application Requirements. Start implementing APIs for the web application. Features of the web application will be split among various applications. For this assignment, we will focus on the backend API (no UI) service. Additional features of the web application will be implemented in future assignments. We will also build the infrastructure on the cloud to host the application. This assignment will focus on the user management aspect of the application. You will implement RESTful APIs based on user stories you will find below.


### 2. Requirements

#### User Stories
##### Packer & AMIs
- Building Custom Application AMI using Packer
- Use Ubuntu 22.04 LTS AMI as your source image to create a custom AMI using Packer.
- As of 10/12/2022, the current AMI ID is ami-08c40ec9ead489470Links to an external site..
- All AMIs you build should be private.
- Only you can deploy EC2 instances from it.
- All AMI builds should happen in your dev AWS account and shared with your demo account.
- AMI builds should be set up to run in your default VPC.
- The AMI should include everything needed to run your application and the application binary itself. For e.g., if you are using Tomcat to run your Java web application, your AMI must have Java & Tomcat installed. You should also make sure the Tomcat service will start up when an instance is launched. If you are using Python, make sure you have the right version of python and the libraries you need to be installed in the AMI.
- The packer template should be stored in the same repo as the web application.
- For this assignment only, install MySQL or PostgreSQL locally in the AMI.

##### Continuous Integration: Add New GitHub Actions Workflow for Web App
- When a pull request is merged, a GitHub Actions workflow should be triggered to do the following:
- Run the unit test.
- Build the application artifact (war, jar, zip, etc.).
- Build the AMI with application dependencies and set up the application by copying the application artifacts and the configuration files.
- Configure the application to start automatically when VM is launched.

### 3.Technology and external libraries Used

- Nodejs
- Express
- Postgres SQL
- Bcrypt
- Basic auth
- CLI
- Packer
- Sequilize for ORM
- Multer to upload documents/files
- aws sdk to access s3 bucket
- Github Actions workflow for CI/CD
- Systemd to auto run the node application
  

### 4. Prerequisites

- Node.js
- Postgres SQL
- npm
- VScode
- CLI
- AWS 
- GITHUB


### 5. Instructions to Run application locally
- Clone the repository

```
$ git clone git@github.com:Raksha-Cloud/webapp.git
```

- Navigate to `webapp` folder to run the server


```
$ cd webapp
$ npm install
$ npm run dev
$ npm run test
```


### 6. Instructions to test on POSTMAN

#### 1. Healthz check
- Select GET request - and key in the request url - http://localhost:3300/healthz

#### 2. POST request to add an account
- Select POST request - and key in the request url - http://localhost:3300/swagger
```
{

    "first_name": "",
    "last_name": "two",
    "username":  "abc2.@abccom",
    "password": "password123"
 
}
```

#### 3. GET request to fetch an account with a particular ID
- Select GET request - and key in the request url - http://localhost:3300/healthz
- enable basic auth




#### 3.  PUT request to update an account with a particular ID
- Select PUT request - and key in the request url - http://localhost:3300/v1/account/id
- enable basic auth and jason body payload
```
{

    "first_name": "abc",
    "last_name": "zxc",
    "password": "password12",
    "updated_at":"2q02929"
     
}
```

#### Assignment 4:
##### Step 1 
- create a packer file to create the AMI and key in the steps to install softwares when you launch the instance
- Then test the format and validate the packer file
- Build the packer file to test if the ami is created 
  
  ```
  $ packer fmt ami.pkr.hcl
  $ packer validate ami.pkr.hcl
  $ packer build ami.pkr.hcl
  ```

##### Step 2
- create github actions one to perform unit test cases and another to validate the packer template
- create another github action to create an ami and to create a zip of the webapp from repo and upload it to the instance 

##### Step 3
- log into aws console copy the ami ID and run the cloud formation template to create a new EC2 instance with the web application server running and make postman request to the public ip of the ec2 instance
  
-  `aws cloudformation create-stack --stack-name demoTest2 --template-body file://csye6225-infra.yml --parameter ParameterKey=VpcCidrBlock,ParameterValue="10.0.0.0/16" ParameterKey=subnet1CidrBlock,ParameterValue="10.0.13.0/24" ParameterKey=subnet2CidrBlock,ParameterValue="10.0.12.0/24" ParameterKey=subnet3CidrBlock,ParameterValue="10.0.11.0/24" ParameterKey=AmiID,ParameterValue=" " `
  
-  `public_ip_address:3300/healthz`
  
------------------------------------------------------------

### Assignment 5:

#### Endpoint requirements- 

- The user should be able to upload multiple documents.
- The user should be able to delete documents. 
- Verify that document is deleted from the S3 bucket.
- Multiple users can upload the same document to their accounts.
- A separate copy of the document must be stored for each user.
- If one user deletes the document, it should not impact other users.
- Verify users cannot update/delete other users' documents.
- Create multiple accounts to verify this.

#### Changes Made- 
  - updated shell commands to remove postgres installation
  - Set up env file in webapp.service
  - Added new S3 provider to access
  - Used multer and sdk dependencies to upload documents on S3

#### Instructions to test S3 endpoints

##### 1. POST http://`IP address of EC2`:3300/v1/document 
- Select POST request - and select basic auth enter user credentials and body form data select file and upload required file from local and click on send

##### 2. GET http://`IP address of EC2`:3300/v1/document
- Select Get request - and select basic auth enter user credentials and click on send to see all the documents uploaded for a particular user

##### 3. GET http://`IP address of EC2`:3300/v1/document/uuid
- Select Get request - and select basic auth enter user credentials and click on send to see particular documents uploaded for a particular user


##### 4. DELETE http://`IP address of EC2`:3300/v1/document/uuid
- Select Delete request - and select basic auth enter user credentials and click on send to delete a particular document for a particular user.

#### Instructions to test POSTGRES DB through CLI
- To run psql : `sudo -u postgres psql`
- To see all Tables : `\d`
- To see all databases : `\l`
- To see all users from accounts table: `SELECT * FROM accounts;`
- To see all documents from files table:`SELECT * FROM files;`
- To exit `\q`
------------------------------------------------------------

### Assignment 6:
- Replaced ec2 ip address with domain name and auto directed all requests to port 3300
- Created domain and sub domains added to route 53
- created ses identity to send emails.