process.env.Node = 'test';

let server = require('../index.js');
let expect = require('chai').expect;
const request = require('supertest');

//unit test case to test the health of the server
describe('Server health check', () => {
  it('GET /', async () => {
    const response = await request(server).get('/healthz');
    expect(response.statusCode).to.equal(200);
  });
});
//testing valid post request
describe('To test valid Post request ', () => {
  it('POST /account', async () => {
    const response = await request(server).post('/v1/account').send({
      first_name: 'Raksha',
      last_name: 'Kagadalu',
      username: 'abcd@abc.com',
      password: 'password12',
    });
    expect(response.statusCode).to.equal(201);
  });
});

//test valid password
describe('To test valid password in the Post request ', () => {
    it('POST /account', async () => {
      const response = await request(server).post('/v1/account').send({
        first_name: 'Raksha',
        last_name: 'Kagadalu',
        username: 'raksha.kagadalu@gmail.com',
        password: 'pass',
      });
      expect(response.statusCode).to.equal(400);
    });
  });

  //test valid emailID
describe('To test valid username in the Post request ', () => {
    it('POST /account', async () => {
      const response = await request(server).post('/v1/account').send({
        first_name: 'Raksha',
        last_name: 'Kagadalu',
        username: 'rakshakagadalu@gmailcom',
        password: 'password123',
      });
      expect(response.statusCode).to.equal(400);
    });
  });


