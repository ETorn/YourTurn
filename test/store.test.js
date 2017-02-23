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

        expect(body).to.have.property('storeTurn');
        expect(body.storeTurn).to.be.a('number');
        expect(body.storeTurn).to.be.within(1, 99);

        expect(body).to.have.property('usersTurn');
        expect(body.usersTurn).to.be.a('number');
        expect(body.usersTurn).to.be.within(1, 99);

        done();
      });
    });
  });

  describe.skip('PUT /stores/:store_id', function(){
    it('should update a store');
  });

  describe('POST/DELETE /stores/:store_id/users/:user_id', function(){

    var userId;

    it('creting user for this test', function(done) {
      request({
        url: config.node.address + '/users',
        method: 'POST',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body.userId).not.to.be('undefined');

        userId = body.userId;

        done();
      });
    });

    it('POST should add an user to the store queue', function(done) {

      expect(id).not.to.be(null);
      expect(userId).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/users/' + userId,
        method: 'POST',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('User added to store queue!');
        expect(body.turn).to.be.a('number');

        done();
      });
    });

    it('DELETE should remove an user from the store queue', function(done) {

      expect(id).not.to.be(null);
      expect(userId).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/users/' + userId,
        method: 'DELETE',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('Successfully deleted');

        done();
      });
    });

    it('removing user for this test', function(done) {
      request({
        url: config.node.address + '/users/' + userId,
        method: 'DELETE',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);

        userId = null;

        done();
      });
    });
  });

  describe('GET /stores/:store_id/queue', function(){

    var userId;

    it('it should be 0 when there are no users', function(done) {

      expect(id).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/queue',
        method: 'GET',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('queue');
        expect(body.queue).to.be(0);

        done();
      });
    });

    it('creting user for this test', function(done) {
      request({
        url: config.node.address + '/users',
        method: 'POST',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body.userId).not.to.be('undefined');

        userId = body.userId;

        done();
      });
    });

    it('adding user to the store queue', function(done) {

      expect(id).not.to.be(null);
      expect(userId).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/users/' + userId,
        method: 'POST',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('User added to store queue!');

        done();
      });
    });

    it('it should be 1 when there is 1 user', function(done) {

      expect(id).not.to.be(null);
      expect(userId).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/queue',
        method: 'GET',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('queue');
        expect(body.queue).to.be(1);

        done();
      });
    });

    it('removing user from the store queue', function(done) {

      expect(id).not.to.be(null);
      expect(userId).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/users/' + userId,
        method: 'DELETE',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('Successfully deleted');

        done();
      });
    });

    it('it should be 0 when there are no users', function(done) {

      expect(id).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/queue',
        method: 'GET',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('queue');
        expect(body.queue).to.be(0);

        done();
      });
    });

    it('removing user for this test', function(done) {
      request({
        url: config.node.address + '/users/' + userId,
        method: 'DELETE',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);

        userId = null;

        done();
      });
    });
  });

  var turn;

  describe('GET /stores/:store_id/storeTurn', function(){
    it('it should return the current turn', function(done) {

      expect(id).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/storeTurn',
        method: 'GET',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('storeTurn');
        expect(body.storeTurn).to.be.a('number');
        expect(body.storeTurn).to.be.above(0);

        turn = body.storeTurn;

        done();
      });
    });
  });

  describe('PUT /stores/:store_id/storeTurn', function(){
    it('it should advance the current turn without error', function(done) {

      expect(id).not.to.be(null);
      expect(turn).not.to.be(null);

      request({
        url: config.node.address + "/stores/" + id + '/storeTurn',
        method: 'PUT',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('StoreTurn updated');
        expect(body).to.have.property('storeTurn');
        expect(body.storeTurn).to.be.a('number');
        expect(body.storeTurn).to.be(turn + 1);

        done();
      });
    });
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
