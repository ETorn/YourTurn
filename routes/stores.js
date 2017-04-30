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
var postEvent = funcs.postEvent;
var getAverageTime = funcs.getAverageTime;
var getStoreTurns = funcs.getStoreTurns;
var notifyUser = funcs.notifyUser;

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
      advanceStoreTurn(id, function(err, result) {
        if (err)
          return;

        mqttClient.publish('etorn/store/' + id + '/storeTurn', '' + storeTurn);

        //Per cada torn demanat en aquesta parada, avisem a la app que ha de restar -1 a la cua del usuari
        getStoreTurns(id, function(err, turns) {
          var userIds = result.map(function(u) {
            return u.userId;
          });

          console.log('userIds: ',userIds);

          for (i = 0; i < turns.length; i++) {
            mqttClient.publish('etorn/store/' + id + '/user/' + userIds[i] + '/queue');
          }

          notifyUser(turns, storeTurn,  function(err, res) {
            for (i = 0; i < res.length; i++) {
              mqttClient.publish('etorn/store/' + id + '/user/' + res[i] + '/notification');
            }
          });
        });


        getStoreQueue(id, function(err, queue) {
          if (!err)
            mqttClient.publish('etorn/store/' + id + '/queue', '' + queue);
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

        postEvent('advanced turn', req.params.store_id, function(err,response) {
          if (err)
            return res.json({message: err});
          console.log('advanced turn');
        });

        getAverageTime(req.params.store_id, function(err, time) {
          if (err)
            return res.json({message: err});

          mqttClient.publish('etorn/store/' + req.params.store_id + '/aproxTime', '' + time);
        });

        /* Comentat ja que al demanar torn, si retornem la cua de la store, sera +1 a la actual
        getStoreQueue(req.params.store_id, function(err, queue) {
          if (!err)
            mqttClient.publish('etorn/store/' + req.params.store_id + '/queue', '' + queue);
        });*/

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

        getStoreTurns(req.params.store_id, function(err, turns) {
          console.log("turns", turns)
          var userIds = turns.map(function(u) {
            return u.userId;
          });

          //Per cada torn demanat en aquesta parada, avisem a la app que ha de restar -1 a la cua del usuari
          for (i = 0; i < turns.length; i++) {
            mqttClient.publish('etorn/store/' + req.params.store_id + '/user/' + userIds[i] + '/queue');
          }

          //Avisem a cada usuari que estigui a tants turns de distacia com ha decidit ell a preferencies
          notifyUser(turns, result,  function(err, res) {
            console.log("usersIDtoNotify RES", res);
              for (i = 0; i < res.length; i++) {
                if (res[i] != undefined && res[i] != null)
                  mqttClient.publish('etorn/store/' + req.params.store_id + '/user/' + res[i] + '/notification');
              }
          });
        });
        res.json({message: 'StoreTurn updated', storeTurn: result});
      });

    });
}
