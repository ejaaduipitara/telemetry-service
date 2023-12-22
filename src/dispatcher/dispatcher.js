const winston = require('winston');
    require('winston-daily-rotate-file');
    require('./kafka-dispatcher');
    require('./cassandra-dispatcher');
    require('./postgres-dispatcher');

const defaultFileOptions = {
    filename: 'dispatcher-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '100m',
    maxFiles: '100',
    zippedArchive: true,
    json: true
}

class Dispatcher {
    constructor(options) {
        if (!options) throw new Error('Dispatcher options are required');
        this.logger = new(winston.Logger)({level: 'info'});
        this.options = options;
        if (this.options.dispatcher == 'kafka') {
            this.logger.add(winston.transports.Kafka, this.options);
            console.log('Kafka transport enabled !!!');
        } else if (this.options.dispatcher == 'file') {
            const config = Object.assign(defaultFileOptions, this.options);
            this.logger.add(winston.transports.DailyRotateFile, config);
            console.log('File transport enabled !!!');
        } else if (this.options.dispatcher === 'cassandra') {
            this.logger.add(winston.transports.Cassandra, this.options);
            console.log('Cassandra transport enabled !!!');
        } else if (this.options.dispatcher === 'postgres') {
            // console.log(`winston.transports.Postgres ${winston.transports.Postgres}`)
            this.logger.add(winston.transports.Postgres, this.options);
            console.log('Postgres transport enabled !!!');
        } else { // Log to console
            this.options.dispatcher = 'console'
            const config = Object.assign({json: true,stringify: (obj) => JSON.stringify(obj)}, this.options);
            this.logger.add(winston.transports.Console, config);
            console.log('Console transport enabled !!!');
        }
    }

    dispatch(mid, message, callback) {
        this.logger.log('info', message, {mid: mid}, callback);
    }

    health(callback) {
        console.log(Object.keys(this.logger.transports))
        if (this.options.dispatcher === 'kafka') {
            this.logger.transports['kafka'].health(callback);
        } else if (this.options.dispatcher === 'postgres') {
            this.logger.transports['postgres'].health(callback);
        } else if (this.options.dispatcher === 'console') {
            callback(true)
        } else { // need to add health method for file/cassandra
            callback(false)
        }
    }

    getMetricsData(req, callback){
        this.logger.transports['postgres'].getMetricsData(req, callback);
    }


}

module.exports = { Dispatcher };
