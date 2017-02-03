module.exports = function(router) {

  //res.status(400).send('Bad Request');
  //res.status(406).send('Not Acceptable');

  router.use('/stores/:store_id', function(req, res, next) {

      if(req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE')
          return res.status(405).send('Method Not Allowed');

      next();
  });

  router.use('/stores/:store_id/addUser/:user_id', function(req, res, next) {

      if(req.method !== 'POST' && req.method !== 'DELETE')
          return res.status(405).send('Method Not Allowed');

      next();
  });

  router.use('/stores', function(req, res, next) {

      if (req.method !== 'GET' && req.method !== 'POST')
          return res.status(405).send('Method Not Allowed');

      next();
  });

}
