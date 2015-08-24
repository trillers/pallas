var settings = require('athena-settings');
var Frankon = require('../../framework/frankon');
var Router = require('koa-router');
var co = require('co');
var wechat = require('co-wechat');
var WechatOperationService = require('../../modules/wechat/services/WechatOperationService');
var QrChannelDispatcher = require('../../modules/qrchannel');
var UserKv = require('../../modules/user/kvs/User');
var CSDispatcher = require('../../modules/customer_server');
var productionMode = settings.env.mode == 'production';
var logger = require('../../app/logging').logger;
var tokenConfig = productionMode ? {
    token: settings.wechat.token,
    appid: settings.wechat.appKey,
    encodingAESKey: settings.wechat.encodingAESKey
} : settings.wechat.token;
var thunkify = require("thunkify");
var WechatAuthenticator = require('../../framework/WechatAuthenticator');
var authenticator = new WechatAuthenticator({});
var authEnsureSignin = thunkify(authenticator.ensureSignin);
var customerDispatcher = require('../../modules/customer_server');
var frankon = new Frankon();

var ensureSignin = thunkify(authenticator.ensureSignin.bind(authenticator));

module.exports = function() {
    var router = new Router();
    //require('../common/routes-wechat')(router);

    frankon.use(function* (next) {
        var self = this;
        var message = self.weixin;
        var user = yield ensureSignin(message, self, next);
        this["wxUser"] = user;
        WechatOperationService.logActionAsync(message);
        yield next;
    });

    frankon.use(function* (next) {
    //根据角色，分别派遣session，然后next
        var self = this;
        var user = this.wxUser;
        var message = self.weixin;
        try{
            if(message.MsgType == 'event'){
                switch(message.Event.toLowerCase()){
                    case 'subscribe':
                        yield QrChannelDispatcher.dispatch(message, user, self);
                        break;
                    case 'unsubscribe':
                        //var update = {};
                        //update.wx_subscribe = 0;
                        self.body = '';
                        break;
                    case 'location':
                        self.body = 'Hi! What can I do for you?';
                        break;
                }

            }else{
                self.body = '';
                CSDispatcher.dispatch(user, message);
            }
        } catch (err){
            console.log('ensureSignin error:' + err);
        }
    });

    var handler = frankon.generateHandler();
    var wechatMiddleware = wechat(tokenConfig).middleware(handler);
    router.all('/wechat', wechatMiddleware);
    return router.routes();
}