/*jslint indent: 4, node: true, nomen:true, maxlen: 100*/
'use strict';

var log4js = require('log4js'),
    mongojs = require('mongojs');


/**
 * Returns a function to log data in mongodb.
 *
 * @param {Object} config The configuration object.
 * @param {string} config.connectionString The connection string to the mongo db.
 * @param {string=} config.layout The log4js layout.
 * @param {string=} config.write The write mode.
 * @returns {Function}
 */
function mongodbAppender(config) {
    if (!config || !config.connectionString) {
        throw new Error('connectionString is missing. Cannot connect to mongdb.');
    }

    var layout = config.layout || log4js.layouts.messagePassThroughLayout,
        collectionName = config.collectionName || 'log',
        db = mongojs(config.connectionString, [collectionName]),
        collection = db[collectionName],
        options = {w: 0},
        filterLevel = log4js.levels.toLevel(config.filterLevel);

    if (config.write === 'normal') {
        options.w = 1;
    }

    if (config.write === 'safe') {
        options.w = 1;
        options.journal = true;
    }

    return function (loggingEvent) {
        //Check if level is greater or equal to the Levelfilter
        if (loggingEvent.level.level < filterLevel.level) {
            return;
        }

        // get the information to log
        if (Object.prototype.toString.call(loggingEvent.data[0]) === '[object String]') {
            // format string with layout
            loggingEvent.data = layout(loggingEvent);
        } else if (loggingEvent.data.length === 1) {
            loggingEvent.data = loggingEvent.data[0];
        }

        if (collection) {
            if (options.w === 0) {
                // fast write
                collection.insert({
                    timestamp: loggingEvent.startTime.toISOString(),
                    data: loggingEvent.data,
                    level: loggingEvent.level,
                    category: loggingEvent.logger.category,
                    instance_id: config.instance_id,
                    public_hostname: config.hostname,
                    process_name: config.processName
                }, options);
            } else {
                // save write
                collection.insert({
                    timestamp: loggingEvent.startTime.toISOString(),
                    data: loggingEvent.data,
                    level: loggingEvent.level,
                    category: loggingEvent.logger.category,
                    instance_id: config.instance_id,
                    public_hostname: config.hostname,
                    process_name: config.processName
                }, options, function (error) {
                    if (error) {
                        console.error('log: Error writing data to log!');
                        console.error(error);
                        console.log('log: Connection: %s, collection: %, data: %j',
                            config.connectionString, collectionName, loggingEvent);
                    }
                });
            }
        }
    };
}

function configure(config) {
    if (config.layout) {
        config.layout = log4js.layouts.layout(config.layout.type, config.layout);
    }

    return mongodbAppender(config);
}


exports.appender = mongodbAppender;
exports.configure = configure;
