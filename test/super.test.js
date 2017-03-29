var _ = require('lodash');
var _async = require('async');
var combinations = require('combinations');
var config = require('../config');
var expect = require('expect.js');
var request = require('request');

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
            city: 'testCity',
            address: 'testAddress',
            phone: 'testPhone',
            fax: 'testFax',
            location: {
              "lat": 41.385926,
              "long": 2.105943
            }
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
            city: 'testCity',
            address: 'testAddress',
            phone: 'testPhone',
            fax: 'testFax',
            location: {
              "lat": 41.385926,
              "long": 2.105943
            }
          }
        }, function(err, res, body) {
          expect(err).to.be(null);
          expect(res.statusCode).to.be(200);
          expect(body).to.have.property('message');
          expect(body.message).to.be('This super already exists');

          done();
        });
      });

      it('should return error if missing any property', function(done) {
        var allProps = ['city', 'address', 'phone', 'fax', 'location'];

        var combos = combinations(allProps);
        combos.pop();

        combos = combos.map(function(arr) {
          return _.zipObject(arr, arr.map(function(el) {
            return (el === 'location') ?
              {"lat": 41.385926, "long": 2.105943} :
              'test' + el;
          }));
        });

        _async.eachLimit(combos, 1,
          function(props, cb) {
            request({
              url: config.node.address + "/supers",
              method: 'POST',
              json: true,
              body: props
            }, function(err, res, body) {
              expect(err).to.be(null);
              expect(res.statusCode).to.be(200);
              expect(body).to.have.property('message');
              expect(body.message).to.match(/Missing properties: /);

              var returnedMissing = body.message
                .replace('Missing properties: ', '')
                .split(', ')
                ;

              expect(_.difference(allProps, _.union(_.keys(props), returnedMissing))).to.be.empty();

              cb();
            });
          },
          function(err) {done();}
        );
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
          city: 'testCity',
          name: 'testSuper',
          address: 'testAddress',
          phone: 'testPhone',
          fax: 'testFax',
          location: {
            "lat": 41.385926,
            "long": 2.105943
          }
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
          expect(body).to.have.property('city');
          expect(body).to.have.property('address');
          expect(body).to.have.property('phone');
          expect(body).to.have.property('fax');
          expect(body.city).to.be('testCity');
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

          request({
            url: config.node.address + "/supers/" + id,
            method: 'GET',
            json: true
          }, function(err, res, body) {
            expect(err).to.be(null);
            expect(res.statusCode).to.be(200);
            expect(body).to.have.property('city');
            expect(body).to.have.property('address');
            expect(body).to.have.property('phone');
            expect(body).to.have.property('fax');
            expect(body.city).to.be('testCity');
            expect(body.address).to.be('testAddress');
            expect(body.phone).to.be('updatedPhone');
            expect(body.fax).to.be('updatedFax');

            done();

          });
        });
      });
    });
  });
});
