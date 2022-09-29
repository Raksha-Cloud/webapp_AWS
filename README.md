# webapp

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

-All API request/response payloads should be in JSON.
-No UI should be implemented for the application.
-As a user, I expect all API calls to return with a proper HTTP status code (Links to an external site.).
-As a user, I expect the code quality of the application is maintained to the highest standards using the unit and/  or integration tests.

### 3.Technology Used


- Nodejs
- Express
- Postgres SQL

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
$ node index
```


### 6. Instructions to test on POSTMAN

#### 1. Check if the local host is connected
- Select GET request - and key in the request url - http://localhost:3300/

#### 2. Check swagger API health
- Select GET request - and key in the request url - http://localhost:3300/swagger

#### 3. Check Postgres health
- Select GET request - and key in the request url - http://localhost:3300/healthz
  

