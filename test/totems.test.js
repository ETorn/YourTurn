var config = require('../config');
var request = require('request');
var expect = require('expect.js');

describe('Totems', function() {
  describe('Creation and deletion', function() {

    var totemId = null

    describe('POST /totems', function() {
      it('should create an totem', function(done) {
        request({
          url: config.node.address + "/totems",
          method: 'POST',
          json: true,
          body: {
            // Empty body
          }
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);

          expect(body).to.have.property('message');
          expect(body.message).to.be('Totem created!');
          expect(body).to.have.property('totemId');
          expect(body.totemId).to.be.a('string');

          totemId = body.totemId;

          done();
        });
      });
    });

    describe('DELETE /totems/:totem_id', function(){
      it('should delete a totem', function(done) {

        expect(totemId).to.be.a('string');

        request({
          url: config.node.address + "/totems/" + totemId,
          method: 'DELETE',
          json: true
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);

          expect(body).to.have.property('message');
          expect(body.message).to.be('Successfully deleted');

          totemId = null;

          done();
        });
      });
    });
  });

  describe('Rest of functionality', function() {

    var totemId = null

    beforeEach(function(done) {
      request({
        url: config.node.address + "/totems",
        method: 'POST',
        json: true,
        body: {
          // Empty body
        }
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);

        totemId = body.totemId;

        done();
      });
    });

    afterEach(function(done) {

      expect(totemId).to.be.a('string');

      request({
        url: config.node.address + "/totems/" + totemId,
        method: 'DELETE',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);

        totemId = null;

        done();
      });
    });

    describe('GET /totems', function(){
      it('should return a list of totem', function(done) {

        expect(totemId).to.be.a('string');

        request({
          url: config.node.address + "/totems",
          method: 'GET',
          json: true
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);

          expect(body).to.be.an('array');
          expect(body.length).to.be.above(0);
          expect(body[0]).to.be.an('object');
          expect(body.filter(function(e) {return e._id === totemId;}).length).to.be(1);

          done();
        });
      });
    });

    describe('GET /totems/:totem_id', function(){
      it('should return a totem', function(done) {

        expect(totemId).to.be.a('string');

        request({
          url: config.node.address + "/totems/" + totemId,
          method: 'GET',
          json: true
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);

          expect(body).to.be.an('object');
          expect(body._id).to.be(totemId);

          done();
        });
      });
    });

    describe('PUT /totems/:totem_id', function(){
      it('should update a totem');
    });
  });
});
