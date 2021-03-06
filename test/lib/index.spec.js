/*global describe, it, expect, beforeEach */
'use strict';

var log4js = require('log4js'),
    sut = require('../../lib/index'),
    mongojs = require('mongojs'),
    connectionString = 'localhost:27017/test_log4js_mongo?w=0';

describe('log4js-node-mongoappender', function () {
    beforeEach(function (done) {
        log4js.clearAppenders();
        var db = mongojs(connectionString, ['log', 'audit']);

        db.log.drop(function () {
            db.audit.drop(function () {
                done();
            });
        });
    });

    it('should be initialized correctly', function () {
        expect(typeof sut.configure).toBe('function');
        expect(typeof sut.appender).toBe('function');
    });

    it('should throw an Error when the connectionString is not set', function () {
        expect(function () { return log4js.addAppender(sut.appender()); }).toThrow();
    });

    it('should log to the mongo database when initialized through the configure function', function (done) {
        var db = mongojs(connectionString, ['log']);
        log4js.addAppender(sut.configure({connectionString: 'localhost:27017/test_log4js_mongo'}));
        log4js.getLogger().info('Ready to log!');

        setTimeout(function () {
            db.log.find({}, function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({level: 20000, levelStr: 'INFO'});

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with a given layout', function (done) {
        var db = mongojs(connectionString, ['log']);
        log4js.addAppender(sut.configure({connectionString: 'localhost:27017/test_log4js_mongo', layout: 'colored'}));
        log4js.getLogger().info('Ready to log!');

        setTimeout(function () {
            db.log.find({}, function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({level: 20000, levelStr: 'INFO'});

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with category [default]', function (done) {
        var db = mongojs(connectionString, ['log']);
        log4js.addAppender(sut.appender({connectionString: 'localhost:27017/test_log4js_mongo'}));
        log4js.getLogger().info('Ready to log!');

        setTimeout(function () {
            db.log.find({}, function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({level: 20000, levelStr: 'INFO'});

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with a category', function (done) {
        var db = mongojs(connectionString, ['log']);
        log4js.addAppender(sut.appender({connectionString: 'localhost:27017/test_log4js_mongo'}), 'demo');
        log4js.getLogger('demo').warn({id: 1, name: 'test'});

        setTimeout(function () {
            db.log.find({}, function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('demo');
                expect(res[0].data).toEqual({id: 1, name: 'test'});
                expect(res[0].level).toEqual({level: 30000, levelStr: 'WARN'});

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with a given collection', function (done) {
        var db = mongojs(connectionString, ['audit']);
        log4js.addAppender(sut.appender({connectionString: 'localhost:27017/test_log4js_mongo', collectionName: 'audit'}), 'demo');
        log4js.getLogger('demo').error({id: 1, name: 'test'});

        setTimeout(function () {
            db.audit.find({}, function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('demo');
                expect(res[0].data).toEqual({id: 1, name: 'test'});
                expect(res[0].level).toEqual({level: 40000, levelStr: 'ERROR'});

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with write mode "normal"', function (done) {
        var db = mongojs(connectionString, ['log']);
        log4js.addAppender(sut.appender({connectionString: 'localhost:27017/test_log4js_mongo', write: 'normal'}));
        log4js.getLogger().fatal('Ready to log!');

        setTimeout(function () {
            db.log.find({}, function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({level: 50000, levelStr: 'FATAL'});

                done();
            });
        }, 100);
    });

    it('should log to the mongo database with write mode "safe"', function (done) {
        var db = mongojs(connectionString, ['log']);
        log4js.addAppender(sut.appender({connectionString: 'localhost:27017/test_log4js_mongo', write: 'safe'}));
        log4js.getLogger().debug('Ready to log!');

        setTimeout(function () {
            db.log.find({}, function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(1);
                expect(res[0].category).toBe('[default]');
                expect(res[0].data).toBe('Ready to log!');
                expect(res[0].level).toEqual({level: 10000, levelStr: 'DEBUG'});

                done();
            });
        }, 100);
    });
});