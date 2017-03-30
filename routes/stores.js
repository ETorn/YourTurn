var funcs = require('./store-funcs.js');

var newStore = funcs.newStore;
var getStoreList = funcs.getStoreList;
var getStoreById = funcs.getStoreById;
var updateStore = funcs.updateStore;
var removeStore = funcs.removeStore;
var addUserToStoreQueue = funcs.addUserToStoreQueue;
var removeUserFromStoreQueue = funcs.removeUserFromStoreQueue;
var getStoreTurn = funcs.getStoreTurn;
var getStoreQueue = funcs.getStoreQueue;
var advanceStoreTurn = funcs.advanceStoreTurn;


module.exports = function(router, mqttClient) {

  mqttClient.subscribe('etorn/store/+/advance');
  mqttClient.subscribe('etorn/store/+/idk');

  mqttClient.on('message', function(topic, message) {
    var match = /etorn\/store\/(\w{24})\/(\w+)/.exec(topic);
    var id = match[1];
    var chan = match[2];

    if (!match)
      return;

    if (chan === 'idk')
      publishUpdate(id);

    if (chan === 'advance') {
      advanceStoreTurn(match[1], function(err, result) {
        if (err)
          return;

        mqttClient.publish('etorn/store/' + match[1] + '/storeTurn', '' + result);

        getStoreQueue(match[1], function(err, queue) {
          if (!err)
            mqttClient.publish('etorn/store/' + match[1] + '/queue', '' + queue);
        });
      });
    }
  });

  var publishUpdate = function(id) {
    getStoreTurn(id, function(err, result) {
      if (!err)
        mqttClient.publish('etorn/store/' + id + '/storeTurn', '' + result);
    });

    getStoreQueue(id, function(err, queue) {
      if (!err)
        mqttClient.publish('etorn/store/' + id + '/queue', '' + queue);
    });
  };

  router.route('/stores')
    .post(function(req, res) {

      newStore(req.body, function(err, result) {
        if (err)
          return res.send({message: err});

        res.json({message: 'Store created!', storeId: result.storeId, superId: result.superId})
      });

    })
    .get(function(req, res) {

      getStoreList(function(err, result) {
        if (err)
          return res.json({message: err});

        res.json(result);
      });

    });

  router.route('/stores/:store_id')
    .get(function(req, res) {

      getStoreById(req.params.store_id, function(err, result) {
        if (err)
          return res.json({message: err});

        res.json(result);
      });

    })
    .put(function(req, res) {

      updateStore(req.params.store_id, {name: req.body.name}, function(err, result) {
        if (err)
          return res.json({message: err});

        res.json({message: 'store updated!'});
      });

    })
    .delete(function(req, res) {

      removeStore(req.params.store_id, function(err) {
        if (err)
          return res.json({message: err});

        res.json({message: 'Store successfully deleted'});
      });

    });

  router.route('/stores/:store_id/users/:user_id')
    .put(function(req, res){

      addUserToStoreQueue(req.params.user_id, req.params.store_id, function(err, result) {
        if (err)
          return res.json({message: err});

        var disponibleTurn = result+1;
        mqttClient.publish('etorn/store/' + req.params.store_id + '/usersTurn', '' + disponibleTurn);

        getStoreQueue(req.params.store_id, function(err, queue) {
          if (!err)
            mqttClient.publish('etorn/store/' + req.params.store_id + '/queue', '' + queue);
        });

        res.json({message: 'User added to store queue!', turn: result});
      });

    })
    .delete(function(req, res){

      removeUserFromStoreQueue(req.params.user_id, req.params.store_id, function(err, response) {
        if (err)
          return res.json({message: err});

        res.json({message: 'Successfully deleted'});
      });
    });

  router.route('/stores/:store_id/queue')
    .get(function(req, res){

      getStoreQueue(req.params.store_id, function(err, result) {
        if (err)
          return res.json({message: err});

        res.json({queue: result});
      });

    })

  router.route('/stores/:store_id/storeTurn')
    .get(function(req, res){

      getStoreTurn(req.params.store_id, function(err, result) {
        if (err)
          return res.json({message: err});

        res.json({storeTurn: result});
      });

    })
    .put(function(req, res){

      advanceStoreTurn(req.params.store_id, function(err, result) {
        if (err)
          res.json({message: err});

        mqttClient.publish('etorn/store/' + req.params.store_id + '/storeTurn', '' + result);

        getStoreQueue(req.params.store_id, function(err, queue) {
          if (!err)
            mqttClient.publish('etorn/store/' + req.params.store_id + '/queue', '' + queue);
        });

        res.json({message: 'StoreTurn updated', storeTurn: result});
      });

    });
}
