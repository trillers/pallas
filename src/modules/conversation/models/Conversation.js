var mongoose = require('../../../app/mongoose');
var DomainBuilder = require('../../../framework/model/DomainBuilder');
var ConversationState = require('../../common/models/TypeRegistry').item('ConversationState');

var schema = DomainBuilder
    .i('Conversation')
    .withBasis()
    .withProperties({
        stt: {type: String, enum: ConversationState.values(), default: ConversationState.Start.value, required: true}
        , initiator: {type: String, ref: 'UserBiz', required: true}
        , expire: {type: Date}
        , case: [{type: String, ref: 'Case'}]
        , createTime: {type: Date, required: true}
        , closeTime: {type: Date}
    })
    .build();


module.exports.schema = schema;
module.exports.model = schema.model(true);