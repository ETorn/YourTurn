var config = require('../config');
var request = require('request');
var expect = require('expect.js');

describe.skip('Totems', function() {
  describe('POST /totem', function() {
    it('should create an totem');
  });

  describe('GET /totem', function(){
    it('should return a list of totem');
  });

  describe('GET /totem/:totem_id', function(){
    it('should return a totem');
  });

  describe('PUT /totem/:totem_id', function(){
    it('should update a totem');
  });

  describe('DELETE /totem/:totem_id', function(){
    it('should delete a totem');
  });
});
