var funcs = require('./store-funcs.js');
var fcm = require('../fcm');
var _async = require('async');

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
var turnRequest = funcs.turnRequest;
var updateTurn = funcs.updateTurn;
var removeStoreLastTurn = funcs.removeStoreLastTurn;

var advanceTurn = function (storeID, mqttClient, callback) {
  advanceStoreTurn(storeID, function(err, result) {
    if (err)
      callback(err);

    postEvent('advanced turn', storeID, function(err,response) {
      if (err)
        callback(err);
      console.log('advanced turn');
    });

    mqttClient.publish('etorn/store/' + storeID + '/storeTurn', '' + result);

    _async.waterfall([
      function(callback) {
        getStoreQueue(storeID, function(err, queue) {
          if (!err)
            mqttClient.publish('etorn/store/' + storeID + '/queue', '' + queue);
            callback(err, queue);
        });
      }
    ], function(err, queue) {
      getStoreById(storeID, function(err, foundStore) {

        getAverageTime(storeID, function(err, time) {
          var timeToSend;
          if (!err) {
            if (time != 0 && time != -1) {
              timeToSend = parseFloat((time).toFixed(1)) * queue;
              updateStore(storeID, {aproxTime: time}, function(){});
              console.log("UpdateStore; time: ", timeToSend);
            }
            else
              timeToSend = foundStore.aproxTime * queue;

            fcm.FCMNotificationBuilder()
            .setTopic('store.' + storeID)
            .addData('aproxTime', timeToSend)
            .send(function(err, res) {
            if (err)
              console.log('FCM error:', err);
            });

            mqttClient.publish('etorn/store/' + storeID + '/aproxTime', '' + timeToSend);
          }
        });

        //Posiblement canviar a una millor solucio
        _async.waterfall([
          function(callback) {
            removeStoreLastTurn(foundStore, function(err, user) {
              console.log("message", user);
              callback(null, user);
            });
          }
        ], function (err, deletedUser) {
          getStoreTurns(storeID, function(err, turns) {

            //Torns d'una store que ha avançat
            //Augmentar torns amb user info
            //Calcular cua usuari individual
            _async.map(turns, function(el, cb) {
              funcs.turnRequest(el, result, function(err, data) {
                cb(err, data);
              });
            }, function(err, arr) {
              //update de queue i temps dels torns

              _async.each(arr, function (turn, cb){
                updateTurn(turn.turnId, turn, function(){
                  cb(null);
                })
              }, function(err) {

                //notificar al ultim usuari de la cua, la app avisara de que es el seu torn
                console.log("deletedUserID: ", deletedUser._id);
                var fcmtmp = fcm.FCMNotificationBuilder()
                  .setTopic('store.' + storeID + '.user.' + deletedUser._id)
                  .addData('storeTurn', foundStore.storeTurn);

                if (deletedUser.notify)
                  fcmtmp
                    .addData('notification', 0);  // Forcem 0 a la cua per que al esborrar l'usuari aquesta propietat no estarà actualitzada

                fcmtmp
                  .send(function(err, res) {
                    if (err)
                      console.log('FCM error:', err);
                  });

                //filtrar, decidir si cal notificacio per user
                var toSend = arr;//.filter(function(el) {return el.notify;});

                //enviar notis
                _async.each(toSend, function(el, cb){

                  //Per cada torn demanat en aquesta parada, avisem a la app que ha de restar -1 a la cua del usuari
                  var fcmtmp = fcm.FCMNotificationBuilder()
                    .setTopic('store.' + storeID + '.user.' + el.user._id)
                    .addData('storeTurn', foundStore.storeTurn)
                    .addData('queue', el.queue);

                  var timeToSend;

                  if (el.aproxTime != 0 && el.aproxTime != -1)
                    timeToSend = el.aproxTime;
                  else
                    timeToSend = foundStore.aproxTime * el.queue;

                  fcmtmp
                    .addData('aproxTime', timeToSend)

                  if (el.notify)
                    fcmtmp
                      .addData('notification', el.queue) //App decideix quin missatge enviar com a notificacio

                  fcmtmp
                    .send(function(err, res) {
                      if (err)
                        console.log('FCM error:', err);

                      cb(null);
                    });
                },
                function(err) {
                  callback(err, {message: 'StoreTurn updated', storeTurn: result});
                });
              });
            });
          });
        });
      });
    });
  });
}

module.exports = function(router, mqttClient) {

  mqttClient.subscribe('etorn/store/+/advance');
  mqttClient.subscribe('etorn/store/+/aproxTime');
  mqttClient.subscribe('etorn/store/+/idk');

  mqttClient.on('message', function(topic, message) {
    var match = /etorn\/store\/(\w{24})\/(\w+)/.exec(topic);
    var id = match[1];
    var chan = match[2];

    if (!match)
      return;

    if (chan === 'idk')
      publishUpdate(id);

    if (chan === 'aproxTime') {
      //Cada vegada que caesar envia el temps aproximat, actualitzem la store
      //updateStore(id, {aproxTime: parseFloat(message.toString('utf8'))}, function(){}); // Convertim a utf8 el missatge ja que ve del caesar com a un buffer de bytes i el parsejem
    }

    if (chan === 'advance') {
      advanceTurn(id, mqttClient, function (err, response) {

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

      updateStore(req.params.store_id, {name: req.body.name, aproxTime: req.body.aproxTime}, function(err, result) {
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
        var storeQueue = result.store.users.length;
        mqttClient.publish('etorn/store/' + req.params.store_id + '/queue', '' + storeQueue);

        var disponibleTurn = result.store.usersTurn;
        mqttClient.publish('etorn/store/' + req.params.store_id + '/usersTurn', '' + disponibleTurn);

        getAverageTime(req.params.store_id, function(err, time) {
          var timeToSend;

          if (time != 0 && time != -1) {
            timeToSend = parseFloat((time).toFixed(1)) * storeQueue;
            updateStore(req.params.store_id, {aproxTime: time}, function(){});
          }
          //Si el temps aproximat es -1 o 0(no hi han events en els pasats 15 min) notifiquem l'ultim temps aproximat de la store
          else
            timeToSend = result.store.aproxTime * storeQueue;

          console.log("storequeue: ", storeQueue);

          mqttClient.publish('etorn/store/' + req.params.store_id + '/aproxTime', '' + timeToSend);
          fcm.FCMNotificationBuilder()
          .setTopic('store.' + req.params.store_id)
          .addData('aproxTime', timeToSend)
          .send(function(err, res) {
          if (err)
            console.log('FCM error:', err);
          });
        });

        res.json({message: 'User added to store queue!', turn: result.userTurn});
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
      advanceTurn(req.params.store_id, mqttClient, function(err, response){
        res.json(response);
      });
    });
}
