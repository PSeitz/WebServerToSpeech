
/* jshint strict: false */
var exec = require('child_process').exec;
var util = require('util');
var nodepath = require('path');

var running = false;

var service = {};
service.limit = 100;
service.queueOverFlowTimeout = 5000;
service.queueDelayStart = 450;
service.queueWorkSpeed = 60;
var queue = [];

var delayToWorkqueue;
var queueInterval;
var discardMode = false;

function onAfterDelay(){
    if (discardMode){
        util.log('discarding all entries');
        queue = [];
        discardMode = false;
        return;
    }
    startQueue();
}

function startDelayedQueue(queueFull){
    if (queueFull && !discardMode) {
        util.log('queue size too big. Stop Queue and wait...' );
        stopQueue();
        discardMode = true;
        startDelayedQueue();
        return;
    }

    if (delayToWorkqueue) clearTimeout(delayToWorkqueue);
    var timeout = discardMode ? service.queueOverFlowTimeout : service.queueDelayStart;
    delayToWorkqueue = setTimeout(onAfterDelay, timeout);
}

function addToQueue(entry){
    var queueFull = queue.length > service.limit;
    if (!queueFull) {
        queue.push(entry);
    }
    startDelayedQueue(queueFull);
}

function startQueue(){
    if (!running) workQueue();
}

function stopQueue(){
    if (queueInterval) clearInterval(queueInterval);
    running=false;
}

function workQueue(){
    "use strict";
    running = true;
    if (queueInterval) clearInterval(queueInterval);
    queueInterval = setInterval(function(){
        var entry = queue.pop();
        if (queue.length === 0){
            stopQueue();
        }
        if (!entry) return;

        if(entry.cb) entry.cb();

    }, service.queueWorkSpeed);
}


service.addToQueue = addToQueue;

service.setLimit = function(limit){
    service.limit = limit;
};

module.exports = service;