/**
 * @preserve
 *
 *                                     .,,,;;,'''..
 *                                 .'','...     ..',,,.
 *                               .,,,,,,',,',;;:;,.  .,l,
 *                              .,',.     ...     ,;,   :l.
 *                             ':;.    .'.:do;;.    .c   ol;'.
 *      ';;'                   ;.;    ', .dkl';,    .c   :; .'.',::,,'''.
 *     ',,;;;,.                ; .,'     .'''.    .'.   .d;''.''''.
 *    .oxddl;::,,.             ',  .'''.   .... .'.   ,:;..
 *     .'cOX0OOkdoc.            .,'.   .. .....     'lc.
 *    .:;,,::co0XOko'              ....''..'.'''''''.
 *    .dxk0KKdc:cdOXKl............. .. ..,c....
 *     .',lxOOxl:'':xkl,',......'....    ,'.
 *          .';:oo:...                        .
 *               .cd,    ╔═╗┌─┐┬─┐┬  ┬┌─┐┬─┐   .
 *                 .l;   ╚═╗├┤ ├┬┘└┐┌┘├┤ ├┬┘   '
 *                   'l. ╚═╝└─┘┴└─ └┘ └─┘┴└─  '.
 *                    .o.                   ...
 *                     .''''','.;:''.........
 *                          .'  .l
 *                         .:.   l'
 *                        .:.    .l.
 *                       .x:      :k;,.
 *                       cxlc;    cdc,,;;.
 *                      'l :..   .c  ,
 *                      o.
 *                     .,
 *
 *             ╦ ╦┬ ┬┌┐ ┬─┐┬┌┬┐  ╔═╗┌┐  ┬┌─┐┌─┐┌┬┐┌─┐
 *             ╠═╣└┬┘├┴┐├┬┘│ ││  ║ ║├┴┐ │├┤ │   │ └─┐
 *             ╩ ╩ ┴ └─┘┴└─┴─┴┘  ╚═╝└─┘└┘└─┘└─┘ ┴ └─┘
 *
 * Created by Valentin on 10/22/14.
 *
 * Copyright (c) 2015 Shuhei Hiya
 *
 * All ascii characters above must be included in any redistribution.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var http = require('http').createServer().listen(8081, function () {

});
var io = require('socket.io')(http);
var socket = null;
var fs = require('fs');
var HybridObjectsUtilities = require(__dirname+'/../../libraries/HybridObjectsUtilities');

/**
 * @desc prototype for an interface input. The input is something like a server that waits for incoming data.
 * @param {object} objectExp is the object that holds all data about the object. - check structure in main program.
 * @param {object} objectLookup holds object names with their ids
 * @param {boolean} clear tells the system to hold until new data is written and then it continues again.
 * @param {boolean} developer is set to true means that the developer tools are accessible.
 * @param {string} directoryName is set to the root of the main program
 * @param {function} callback sends back the values that just has been changed and should be run with the engine.
 * @note you have to give the call back an object and possition like so: callback(objKey2, valueKey);
 * @note when adding a new object to objectExp. make sure that the object has the type of your folder name.
 * @note make sure that the name of the new object is added to objectLookup. The ID is the object name + uuidTime() from the HybridObjectsUtilities file.
 **/

exports.receive= function (objectExp, objectLookup, globalVariables, dirnameO, pluginModules, callback){
    // todo simplify the API to "clear", "add", "write", "developer"
    io.on('connection', function (_socket) {
    	socket = _socket;
        socket.on('add', function (msg) {
		    objectLookup[msg.obj] = {id : msg.obj, obj: msg.obj, pos: msg.pos};
        });
        socket.on('dev', function (msg) {
            globalVariables.developer = true;
        });
        socket.on('write', function (msg) {
            var objKey2 = HybridObjectsUtilities.readObject(objectLookup, msg.obj);
            var valueKey = msg.pos;// + objKey2;
            if(!objectExp[objKey2].objectValues[valueKey]) {
            	objectExp[objKey2].objectValues[valueKey] = {};
            }
            objectExp[objKey2].objectValues[valueKey].name = msg.pos;
            objectExp[objKey2].objectValues[valueKey].value = msg.value;
            objectExp[objKey2].objectValues[valueKey].plugin = 'default';
            objectExp[objKey2].objectValues[valueKey].type = 'socketio';
            objectExp[objKey2].objectValues[valueKey].mode = (msg.valueMode || 'f');
            callback(objKey2, valueKey, objectExp, pluginModules);
        });
    });
};

/**
 * @desc prototype for an interface output. The output is something like a sender that sends present data to an external source.
 * @param {object} objectExp is the object that holds all data about the object. - check structure in main program.
 * @param {string} object defines the object that the output should change.
 * @param {string} position defines the data point within the object
 * @param {number} value defines the actual value that is send to the object.
 **/

exports.send= function(objectExp, object, position, value){
	var mes = {
		objectExp:objectExp,
		obj:object,
		pos:position,
		value:value
	}
	socket.emit("read", mes);
	socket.broadcast.emit("read", mes);
};

/**
 * @desc prototype for an interface init. The init reinitialize the communication with the external source.
 * @note program the init so that it can be called anytime there is a change to the amount of objects.
 **/

exports.init= function(){

};

/**
 * @desc debug switch.
 * @param {boolean} debugEx represents if debugging is switched on in the main programm.
 **/

exports.debug = function  (debugE){
    debug = debugE;
};