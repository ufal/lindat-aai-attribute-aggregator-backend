// show
//

var fs = require('fs');
var path = require('path');
var express = require('express');
var settings = require('../../settings/settings')["backend"];
var utils = require('../libs/utils');
var router = express.Router();
var log = require('../libs/logger')("/v1/got/");
var solr = require('solr-client');

log.info("Creating SOLR client at %s:%s ", settings.solr_host, settings.solr_port);
var client = solr.createClient({
    host: settings.solr_host,
    port: settings.solr_port,
    core: settings.solr_core,
    solrVersion: '6.0'
});

// not storing dialogue
router.post('/', function(req, res) {
    return handle(req, res);
});

router.get('/', function(req, res) {
    return handle(req, res);
});

function handle(req, res) {
    var ret = {
        "ok": false
    };
    var remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (!remote_ip) {
            log.error("Ignoring request from [" + remote_ip + "]");
            ret["message"] = "forbidden";
            return res.json(ret);
        }

    var d = req.query;
    try {
        if (req.body) {
            d = JSON.stringify(req.body, null, 2);
        }

        var idp = d.idp;
        var sp = d.sp;
        var attributes = d.attributes;
        var timestamp = d.time;
        var our_timestamp = new Date();//.now();

            if (!idp || !sp) {
                ret["exception"] = "Invalid arguments supplied!";
                res.json(ret);
                return;
            }

        log.info("Got attributes [%s] from [%s] on [%s] at [%s]", attributes, idp, sp, timestamp);

        client.add({
            idp: idp,
            sp: sp,
            attributes: attributes,
            request_ip: remote_ip,
            timestamp: timestamp,
            our_timestamp: our_timestamp
        },function(err,obj){
            if(err){
                log.error(err);
            }else{
                log.log('Solr response:', obj);
            }
        });
        
        client.commit({},function(err,obj){
            if(err){
                log.error(err);
            }
        });

    }catch(err) {
        ret["exception"] = err;
        log.error(err);
    }

    res.json(ret);
}

module.exports = router;