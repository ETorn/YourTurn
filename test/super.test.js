var config = require('../config');
var request = require('request');
var expect = require('expect.js');

describe('Super', function() {

  var id = null;

  describe('Creation and deletion', function() {
    describe('POST /supers', function() {
      it('should create a super', function(done) {
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
          expect(body).to.have.property('message');
          expect(body.message).to.be('Super created!');
          expect(body).to.have.property('id');
          expect(body.id).to.be.a('string');

          id = body.id;

          done();
        });
      });

      it('should return error if exists', function(done) {
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
          expect(body).to.have.property('message');
          expect(body.message).to.be('This super already exists');

          done();
        });
      });
    });

    describe('DELETE /supers/:super_id', function(){
      it('should delete a super', function(done) {

        expect(id).not.to.be(null);

        request({
          url: config.node.address + "/supers/" + id,
          method: 'DELETE',
          json: true
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);
          expect(body).to.have.property('message');
          expect(body.message).to.be('Successfully deleted');

          id = null;

          done();
        });
      });
    });
  });

  describe('Rest of functionality', function() {

    beforeEach(function(done) {
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

        id = body.id;

        done();
      });
    });

    afterEach(function(done) {
      request({
        url: config.node.address + "/supers/" + id,
        method: 'DELETE',
        json: true
      }, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body).to.have.property('message');
        expect(body.message).to.be('Successfully deleted');

        id = null;

        done();
      });
    });

    describe('GET /supers', function(){
      it('should return a list of supers', function(done) {
        request({
          url: config.node.address + "/supers",
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

    describe('GET /supers/:super_id', function(){
      it('should return a super', function(done) {

        expect(id).not.to.be(null);

        request({
          url: config.node.address + "/supers/" + id,
          method: 'GET',
          json: true
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);
          expect(body).to.have.property('name');
          expect(body).to.have.property('address');
          expect(body).to.have.property('phone');
          expect(body).to.have.property('fax');
          expect(body.name).to.be('testSuper');
          expect(body.address).to.be('testAddress');
          expect(body.phone).to.be('testPhone');
          expect(body.fax).to.be('testFax');

          done();
        });
      });
    });

    describe('PUT /supers/:super_id', function(){
      it('should update a super', function(done) {

        expect(id).not.to.be(null);

        request({
          url: config.node.address + "/supers/" + id,
          method: 'PUT',
          json: true,
          body: {
            name: 'updatedSuper',
            address: 'updatedAddress',
            phone: 'updatedPhone',
            fax: 'updatedFax'
          }
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);
          expect(body).to.have.property('message');
          expect(body.message).to.be('Super updated!');

          done();
        });
      });

      it('shouldnt update name nor address', function(done) {

        expect(id).not.to.be(null);

        request({
          url: config.node.address + "/supers/" + id,
          method: 'GET',
          json: true
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);
          expect(body).to.have.property('name');
          expect(body).to.have.property('address');
          expect(body).to.have.property('phone');
          expect(body).to.have.property('fax');
          expect(body.name).to.be('testSuper');
          expect(body.address).to.be('testAddress');
          expect(body.phone).to.be('updatedPhone');
          expect(body.fax).to.be('updatedFax');

          done();
        });
      });
    });

    describe('Totem functionality', function() {

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

      describe('POST /supers/:super_id/totems/:totem_id', function(){
        it('should add a totem to the super', function(done) {

          expect(id).not.to.be(null);
          expect(totemId).to.be.a('string');

          request({
            url: config.node.address + "/supers/" + id + '/totems/' + totemId,
            method: 'POST',
            json: true,
            body: {
              // Hmm?
            }
          }, function(err, res, body) {
            expect(err).to.be(null);
            expect(res.statusCode).to.be(200);
            // expect(body).to.have.property('name');
            // expect(body).to.have.property('address');
            // expect(body).to.have.property('phone');
            // expect(body).to.have.property('fax');
            // expect(body.name).to.be('testSuper');
            // expect(body.address).to.be('testAddress');
            // expect(body.phone).to.be('updatedPhone');
            // expect(body.fax).to.be('updatedFax');

            done();
          });
        });
      });

      describe('GET /supers/:super_id/totems', function(){
        it('should return the list of totems in this super', function(done) {

          expect(id).not.to.be(null);
          expect(totemId).to.be.a('string');

          request({
            url: config.node.address + "/supers/" + id + '/totems/' + totemId,
            method: 'GET',
            json: true,
            body: {
              // Hmm?
            }
          }, function(err, res, body) {
            expect(err).to.be(null);
            expect(res.statusCode).to.be(200);
            // expect(body).to.have.property('name');
            // expect(body).to.have.property('address');
            // expect(body).to.have.property('phone');
            // expect(body).to.have.property('fax');
            // expect(body.name).to.be('testSuper');
            // expect(body.address).to.be('testAddress');
            // expect(body.phone).to.be('updatedPhone');
            // expect(body.fax).to.be('updatedFax');

            done();
          });
        });
      });
    });
  });
});
