var config = require('../config');
var expect = require('expect.js');
var request = require('request');

describe.skip('Users', function() {
  describe('POST /users', function() {
    it('should create an user');
  });

  describe('GET /users', function(){
    it('should return a list of users');
  });

  describe('GET /users/:user_id', function(){
    it('should return a user');
  });

  describe('PUT /users/:user_id', function(){
    it('should update a user');
  });

  describe('DELETE /users/:user_id', function(){
    it('should delete a user');
  });
});
