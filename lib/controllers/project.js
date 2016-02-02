
'use strict';

var fs = require('fs');
var Util = require('./../Util');
var service = require('../service');

exports.add = function(req, res) {
  var name = req.body.name;

  service.saveFile(`public/projects/${name}.json`, JSON.stringify([]))
    .then(function() {
      res.send(200, { name: name });
    })
    .catch(function(err) {
      res.status(400).send({ message: err && err.message || '' });
    })
};

exports.fetch = function(req, res) {
  service.reddirFiles('public/projects')
    .then(function(files) {

      function read(path, file) {
        return service.readFile(path)
          .then(function(data) {
            return {
              name: file.slice(0, -5),
              data: JSON.parse(data)
            };
          })
          .catch(function(err) {
            console.log(err);
          });
      }

      var promises = files.map(function(file) {
        var target = `public/projects/${file}`;
        var isJSON = file.match(/^[^_].*\.json$/) !== null;
        return service.readStat(target)
          .then(function(stat){
            if(stat.isFile() && isJSON ) {
              return read(target, file);
            }
          })
          .catch(function(err) {
            res.status(400).send({ message: err && err.message || '' });
          })
      });

      Promise.all(promises).then(function(results) {
        res.send(200, results);
      })
      .catch(function(err) {
        res.status(400).send({ message: err && err.message || '' });
      })
    })
    .catch(function(err) {
      res.status(400).send({ message: err && err.message || '' });
    })
};

exports.update = function(req, res) {
  var projectName = req.params.name;
  var apiName = req.body.name;

  function save(path, fileData) {
    return service.saveFile(path, fileData)
      .then(function() {
        res.send(204);
      })
      .catch(function(err) {
        res.status(400).send({ message: err && err.message || '' });
      });
  }

  service.readFile(`public/datas/${apiName}.json`)
    .then(function(api) {
      api = JSON.parse(api);
      delete api.name;
      service.readFile(`public/projects/${projectName}.json`)
        .then(function(routes) {
          console.log(JSON.parse(routes));
          routes = JSON.parse(routes);
          if(!Util.isArray(routes)) save(`public/projects/${projectName}.json`, JSON.stringify([api]));
          var isExitUrl = false;

          routes = routes.map(function(route) {
            if(route.url !== api.url) return route;
            isExitUrl = true;
            return api;
          });

          if(!isExitUrl) routes.push(api);
          save(`public/projects/${projectName}.json`, JSON.stringify(routes));
        })
    })
    .catch(function(err) {
      res.status(400).send({ message: err && err.message || '' });
    });
};

exports.put = function(req, res) {
  var projectName = req.params.name;
  var api = req.body;

  function save(path, fileData) {
    return service.saveFile(path, fileData)
      .then(function() {
        res.send(204);
      })
      .catch(function(err) {
        res.status(400).send({ message: err && err.message || '' });
      });
  }

  service.readFile(`public/projects/${projectName}.json`)
    .then(function(routes) {
      routes = JSON.parse(routes);
      if(!Util.isArray(routes)) save(`public/projects/${projectName}.json`, JSON.stringify([api]));
      var isExitUrl = false;

      routes = routes.map(function(route) {
        if(route.url !== api.url) return route;
        isExitUrl = true;
        return api;
      });

      if(!isExitUrl) routes.push(api);
      save(`public/projects/${projectName}.json`, JSON.stringify(routes));
    })
};
exports.delete = function(req, res) {
  var projectName = req.params.name;
  var apiUrl = req.query.url;

  function save(path, fileData) {
    return service.saveFile(path, fileData)
      .then(function() {
        res.send(204);
      })
      .catch(function(err) {
        res.status(400).send({ message: err && err.message || '' });
      });
  }

  service.readFile(`public/projects/${projectName}.json`)
    .then(function(routes) {
      routes = JSON.parse(routes);
      routes.forEach(function(route, index) {
        if(route.url === apiUrl) routes.splice(index, 1);
      });
      save(`public/projects/${projectName}.json`, JSON.stringify(routes));
    })
};