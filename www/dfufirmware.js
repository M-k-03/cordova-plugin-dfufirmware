var DfuFirmware = function() {};

/*var CountryError = function(code, message) {
  this.code = code || null;
  this.message = message || '';
};*/


/* global cordova, module */
"use strict";

var stringToArrayBuffer = function(str) {
    var ret = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
        ret[i] = str.charCodeAt(i);
    }
    return ret.buffer;
};

var base64ToArrayBuffer = function(b64) {
    return stringToArrayBuffer(atob(b64));
};

function massageMessageNativeToJs(message) {
    if (message.CDVType == 'ArrayBuffer') {
        message = base64ToArrayBuffer(message.data);
    }
    return message;
}

// Cordova 3.6 doesn't unwrap ArrayBuffers in nested data structures
// https://github.com/apache/cordova-js/blob/94291706945c42fd47fa632ed30f5eb811080e95/src/ios/exec.js#L107-L122
function convertToNativeJS(object) {
    Object.keys(object).forEach(function (key) {
        var value = object[key];
        object[key] = massageMessageNativeToJs(value);
        if (typeof(value) === 'object') {
            convertToNativeJS(value);
        }
    });
}



DfuFirmware.prototype.get = function(args,success, fail) {
  cordova.exec(success, fail, 'DfuFirmware', 'get', [args]);
};

DfuFirmware.prototype.getDeviceName = function(args, success, fail) {
  cordova.exec(success, fail, 'DfuFirmware', 'getDeviceName', [args]);
};

DfuFirmware.prototype.getDeviceMacAddress = function(args, success, fail) {
  cordova.exec(success, fail, 'DfuFirmware', 'getDeviceMacAddress', [args]);
};


DfuFirmware.prototype.upgradeFirmware = function(args, success, fail) {
  var successWrapper = function(peripheral) {
    convertToNativeJS(peripheral);
    success(peripheral);
};
  cordova.exec(successWrapper, fail, 'DfuFirmware', 'upgradeFirmware', [args]);
};

if (!window.plugins) {
  window.plugins = {};
}
if (!window.plugins.dfufirmware) {
  window.plugins.dfufirmware = new DfuFirmware();
}

if (module.exports) {
  module.exports = DfuFirmware;
}
