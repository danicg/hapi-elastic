//Load Modules

var Hoek = require('hoek');
var Joi = require('joi');
var Boom = require('boom');
var ElasticSearch = require('elasticsearch');

// Declare internals
var internals = {
    defaults: {
        config: {
            hosts: { id: 'default', url: 'localhost:9200' }
        }
    }
};

exports.register = function (plugin, options, next) {

    var Hapi = plugin.hapi;
    var settings = Hoek.applyToDefaults(internals.defaults, options);
    plugin.log(['hapi-elastic'], 'Hapi Elastic plugin registration started.');

    if (!Array.isArray(settings.config.hosts)) {
        settings.config.hosts = [settings.config.hosts];
    }

    const arrayHosts = {};

    settings.config.hosts.forEach(function(host) {
        const configEs = Hoek.clone(settings.config);
        configEs.host = host.url;
        arrayHosts[host.id] = new ElasticSearch.Client(configEs);
    }, this);

    plugin.expose('es', arrayHosts);

    plugin.ext('onPostHandler', function (req, rep) {

        var response = req.response;
        if (response instanceof ElasticSearch.errors._Abstract) {
            rep(Boom.create(response.status, response.message, response));
        } else {
            rep(response);
        }
    });

    plugin.log(['hapi-elastic'], 'Hapi Elastic plugin registration ended.');
    return next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};
