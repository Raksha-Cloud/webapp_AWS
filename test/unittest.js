process.env.Node = 'test';
//Require the dev-dependencies
let expect = require('chai').expect;
const request = require('supertest');
let server = require('../index.js');
describe('Launching server', () => {
  it('GET /', async () => {
    const response = await request(server).get('/healthz');
    expect(response.statusCode).to.equal(200);
  });
});
// //testing out sign ups
// describe('Testing sign up', () => {
//   it('POST /account', async () => {
//     const response = await request(server).post('/v1/account').send({
//       first_name: 'what',
//       last_name: 'nice',
//       username: 'nciecegmailcom',
//       password: '123456',
//     });
//     expect(response.statusCode).to.equal(400);
//   });
// });