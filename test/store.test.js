var config = require('../config');
var request = require('request');
var expect = require('expect.js');

var series = require('async').series;

describe('Stores', function() {

  var superId = null;
  var storeId = null;

  before(function(done) {
    request({
      url: config.node.address + "/supers",
      method: 'POST',
      json: true,
      body: {
        name: 'testSuper',
        address: 'testAddress',
        phone: 'testPhone',
        fax: 'testFax'
      }
    }, function(err, res, body) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be(200);

      superId = body.id;

      done();
    });
  });

  after(function(done) {
    request({
      url: config.node.address + "/supers/" + superId,
      method: 'DELETE',
      json: true
    }, function(err, res, body) {
      expect(err).to.be(null);
      expect(res.statusCode).to.be(200);
      expect(body).to.have.property('message');
      expect(body.message).to.be('Successfully deleted');

      superId = null;

      done();
    });
  });

  describe('Creation and deletion', function() {
    describe('POST /stores', function() {
      it('should create a store', function(done) {

        expect(superId).not.to.be(null);

        request({
          url: config.node.address + "/stores",
          method: 'POST',
          json: true,
          body: {
            name: 'testStore',
            superId: superId
          }
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);
          expect(body).to.have.property('message');
          expect(body.message).to.be('Store created!');
          expect(body).to.have.property('superId');
          expect(body.superId).to.be.a('string');
          expect(body).to.have.property('storeId');
          expect(body.storeId).to.be.a('string');

          storeId = body.storeId;

          done();
        });
      });

      it('should return error if no super_id passed', function(done) {
        expect(superId).not.to.be(null);

        request({
          url: config.node.address + "/stores",
          method: 'POST',
          json: true,
          body: {
            name: 'testStore2'
          }
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);
          expect(body).to.have.property('message');
          expect(body.message).to.be('No super_id specicfied');

          done();
        });
      });

      it('should return error if exists', function(done) {

        expect(superId).not.to.be(null);

        request({
          url: config.node.address + "/stores",
          method: 'POST',
          json: true,
          body: {
            name: 'testStore',
            superId: superId
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

    describe('DELETE /stores/:store_id', function(){
      it('should delete a store', function(done) {

        expect(storeId).not.to.be(null);

        request({
          url: config.node.address + "/stores/" + storeId,
          method: 'DELETE',
          json: true
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);
          expect(body).to.have.property('message');
          expect(body.message).to.be('Store successfully deleted');

          done();
        });
      });
    });
  });

  describe('Rest of functionality', function() {
    beforeEach(function(done) {
      request({
        url: config.node.address + "/stores",
        method: 'POST',
        json: true,
        body: {
          name: 'testStore',
          superId: superId
        }
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('Store created!');
        expect(body).to.have.property('superId');
        expect(body.superId).to.be.a('string');
        expect(body).to.have.property('storeId');
        expect(body.storeId).to.be.a('string');

        storeId = body.storeId;

        done();
      });
    });

    afterEach(function(done) {
      request({
        url: config.node.address + "/stores/" + storeId,
        method: 'DELETE',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('Store successfully deleted');

        storeId = null;

        done();
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

        expect(storeId).not.to.be(undefined);

        request({
          url: config.node.address + "/stores/" + storeId,
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

        expect(storeId).not.to.be(null);
        expect(userId).not.to.be(null);

        request({
          url: config.node.address + "/stores/" + storeId + '/users/' + userId,
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

        expect(storeId).not.to.be(null);
        expect(userId).not.to.be(null);

        request({
          url: config.node.address + "/stores/" + storeId + '/users/' + userId,
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

      before(function(done) {
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

      after(function(done) {
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

      it('should be 0 when there are no users', function(done) {

        expect(storeId).not.to.be(null);

        request({
          url: config.node.address + "/stores/" + storeId + '/queue',
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

      it('should be 1 when there is 1 user', function(done) {

        expect(storeId).not.to.be(null);
        expect(userId).not.to.be(null);

        series([
          function(cb) {
            expect(storeId).not.to.be(null);
            expect(userId).not.to.be(null);

            request({
              url: config.node.address + "/stores/" + storeId + '/users/' + userId,
              method: 'POST',
              json: true
            }, function(err, res, body) {
              expect(err).to.be(null);
              expect(res.statusCode).to.be(200);
              expect(body).to.have.property('message');
              expect(body.message).to.be('User added to store queue!');

              cb();
            });
          }
        ], function() {
          request({
            url: config.node.address + "/stores/" + storeId + '/queue',
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
      });

      it('should be 0 when removing last user', function(done) {

        expect(storeId).not.to.be(null);

        series([
          function(cb){
            expect(storeId).not.to.be(null);
            expect(userId).not.to.be(null);

            request({
              url: config.node.address + "/stores/" + storeId + '/users/' + userId,
              method: 'DELETE',
              json: true
            }, function(err, res, body) {
              expect(err).to.be(null);
              expect(res.statusCode).to.be(200);
              expect(body).to.have.property('message');
              expect(body.message).to.be('Successfully deleted');

              cb();
            });
          }
        ], function(){
          request({
            url: config.node.address + "/stores/" + storeId + '/queue',
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
      });
    });

    var turn;

    describe('GET /stores/:store_id/storeTurn', function(){
      it('should return the current turn', function(done) {

        expect(storeId).not.to.be(null);

        request({
          url: config.node.address + "/stores/" + storeId + '/storeTurn',
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
      it('should advance the current turn without error', function(done) {

        expect(storeId).not.to.be(null);
        expect(turn).not.to.be(null);

        request({
          url: config.node.address + "/stores/" + storeId + '/storeTurn',
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
  });
});
