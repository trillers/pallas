var cbUtil = require('../../../framework/callback');

var Service = function(context){
    //assert.ok(this.Tenant = context.models.Tenant, 'no Model Tenant');
    this.context = context;
};

Service.prototype.create = function(tenantJson, callback){
    var Tenant = this.context.models.Tenant;
    var tenant = new Tenant(tenantJson);
    tenant.save(function (err, result, affected) {
        //TODO: need logging
        cbUtil.handleAffected(callback, err, result, affected);
    });

};

module.exports = Service;