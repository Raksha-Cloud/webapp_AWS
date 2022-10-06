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
-All API request/response payloads should be in JSON.

-No UI should be implemented for the application.

-As a user, I expect all APIs calls to return with a proper HTTP status codeLinks to an external site.

-As a user, I expect the code quality of the application is maintained to the highest standards using the unit or integration tests.

-Your web application must only support Token-Based authentication and not Session AuthenticationLinks to an external site.

-As a user, I must provide a basicLinks to an external site. authenticationLinks to an external site. token when making an API call to the authenticated endpoint.
Create a new user

-As a user, I want to create an account by providing the following information.
Email Address
Password
First Name
Last Name

-account_created field for the user should be set to the current time when user creation is successful.
Users should not be able to set values for account_created and account_updated. Any value provided for these fields must be ignored.

-Password should never be returned in the response payload.

-As a user, I expect to use my email address as my username.

-Application must return 400 Bad Request HTTP response code when a user account with the email address already exists.

-As a user, I expect my password to be stored securely using the BCrypt password hashing schemeLinks to an external site. with saltLinks to an external site..
Update user information

-As a user, I want to update my account information. I should only be allowed to update the following fields.
First Name
Last Name
Password

-Attempt to update any other field should return 400 Bad Request HTTP response code.
account_updated field for the user should be updated when the user update is successful.

-A user can only update their own account information.
Get user information

-As a user, I want to get my account information. Response payload should return all fields for the user except for password.

### 3.Technology and external libraries Used


- Nodejs
- Express
- Postgres SQL
- Bcrypt
- Basic auth
  

### 4. Prerequisites


- Node.js
- Postgres SQL
- npm
- VScode


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

#### 4. PUT request to update an account with a particular ID
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


