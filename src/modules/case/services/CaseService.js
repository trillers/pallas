var logger = require('../../../app/logging').logger;
var u = require('../../../app/util');
var Case = require('../models/Case').model;
var Promise = require('bluebird');

var Service = {};

Service.load = function (id, callback) {
    Case.findById(id).lean(true).exec(function (err, doc) {
        if (err) {
            logger.error('Fail to load Case [id=' + id + ']: ' + err);
            if (callback) callback(err);
            return;
        }

        logger.debug('Succeed to load  Case [id=' + id + ']');
        if (callback) callback(null, doc);
    })
};

Service.create = function (json, callback) {
    var myCase = new Case(json);
    myCase.save(function (err, doc, numberAffected) {
        if (err) {
            if (callback) callback(err, null);
            return;
        }
        if (numberAffected) {
            logger.debug('Succeed to create Case: ' + require('util').inspect(doc) + '\r\n');
            if (callback) callback(null, doc);
        }
        else {
            logger.error('Fail to create Case: ' + require('util').inspect(doc) + '\r\n');
            if (callback) callback(new Error('Fail to create Case'));
        }
    });
};

Service.delete = function (id, callback) {
    Case.findByIdAndRemove(id, function (err, doc) {
        if (err) {
            logger.error('Fail to delete Case [id=' + id + ']: ' + err);
            if (callback) callback(err);
            return;
        }

        logger.debug('Succeed to delete Case [id=' + id + ']');
        if (callback) callback(null, doc);
    });
};

Service.update = function (id, update, callback) {
    Case.findByIdAndUpdate(id, update, {new: true}, function (err, result){
        if(err) {
            callback(err);
        } else {
            logger.debug('Succeed to update Case [id=' + id + ']');
            callback(null, result);
        }
    });
};

Service.updateByCondition = function (condition, update, callback) {
    Case.findOneAndUpdate(condition, update, {new: true}, function (err, doc){
        if(err) {
            callback(err);
        } else {
            logger.debug('Succeed to update Case [id=' + doc._id + ']');
            callback(null, doc);
        }
    });
};

Service.find = function (params, callback) {
    var query = Case.find();

    if (params.options) {
        query.setOptions(params.options);
    }

    if (params.sort) {
        query.sort(params.sort);
    }

    if (params.page) {
        var skip = (params.page.no - 1) * params.page.size;
        var limit = params.page.size;
        if (skip) query.skip(skip);
        if (limit) query.limit(limit);
    }

    if (params.conditions) {
        query.find(params.conditions);
    }


    //TODO: specify select list, exclude comments in list view
    query.lean(true);
    query.exec(function (err, docs) {
        if (err) {
            callback(err);
            return;
        }

        if (callback) callback(null, docs);
    });
};

Service.filter = function (params, callback) {
    var query = Case.find();

    if (params.options) {
        query.setOptions(params.options);
    }

    if (params.sort) {
        query.sort(params.sort);
    }

    if (params.page) {
        var skip = (params.page.no - 1) * params.page.size;
        var limit = params.page.size;
        if (skip) query.skip(skip);
        if (limit) query.limit(limit);
    }

    if (params.conditions) {
        query.find(params.conditions);
    }
    query.lean(true);
    query.exec(function (err, docs) {
        if (err) {
            callback(err);
            return;
        }

        if (callback) callback(null, docs);
    });
};


Service = Promise.promisifyAll(Service);

module.exports = Service;