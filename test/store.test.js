var config = require('../config');
var request = require('request');
var expect = require('expect.js');

describe('Stores', function() {

  var id;

  describe('POST /stores', function() {
    it('should create a store', function(done) {
      request({
        url: config.node.address + "/stores",
        method: 'POST',
        json: true,
        body: {
          name: 'testStore'
        }
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('Store created!');
        expect(body).to.have.property('id');
        expect(body.id).to.be.a('string');

        id = body.id;

        done();
      });
    });

    it('should return error if exists', function(done) {
      request({
        url: config.node.address + "/stores",
        method: 'POST',
        json: true,
        body: {
          name: 'testStore'
        }
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('This store already exists');

        done();
      });
    });
  });

  describe('GET /stores', function(){
    it('should return a list of stores', function(done) {
      request({
        url: config.node.address + "/stores",
        method: 'GET',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.be.an('array');
        expect(body.length).to.be.above(0);

        done();
      });
    });
  });

  describe('GET /stores/:store_id', function(){
    it('should return a store', function(done) {

      expect(id).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id,
        method: 'GET',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('name');
        expect(body.name).to.be('testStore');
        expect(body).to.have.property('currentTurn');
        expect(body.currentTurn).to.be.a('number')
        //expect(body.currentTurn).to.be.within(1, 99);

        done();
      });
    });
  });

  describe.skip('PUT /stores/:store_id', function(){
    it('should update a store');
  });

  describe('DELETE /stores/:store_id', function(){
    it('should delete a store', function(done) {

      expect(id).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id,
        method: 'DELETE',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('Store successfully deleted');

        id = null;

        done();
      });
    });
  });
});
