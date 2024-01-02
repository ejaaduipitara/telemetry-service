const winston = require('winston');
const { Pool } = require('pg');
const _ = require('lodash')

const tableColumns = [
    {
      "name": "mid",
      "dataType": "TEXT",
      "primaryKey": true,
      "unique": true
    },
    {
        "name": "level",
        "dataType": "VARCHAR",
    },
    {
      "name": "message",
      "dataType": "JSONB"
    },
    {
      "name": "created_on",
      "dataType": "TIMESTAMP"
    }
];


class PostgresDispatcher extends winston.Transport {

    constructor(options) {
        if(!options?.host || !options?.username || !options?.password || !options?.db || !options?.tableName){
            console.error('Postgress details are required');
            process.exit(1)
        }
        super();
        this.name = 'postgres';
        this.options = options;
        this.pool = new Pool({
            user: options.username,
            host: options.host,
            database: options.db,
            password: options.password,
            port: 5432,
            max: options?.minPool || 10,
            ssl: { rejectUnauthorized: false }
        });

        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${options.tableName} (
            ${tableColumns.map(column => `${column.name} ${column.dataType}`).join(', ')},
            PRIMARY KEY (${tableColumns.filter(column => column.primaryKey).map(column => column.name).join(', ')}),
            UNIQUE (${tableColumns.filter(column => column.unique).map(column => column.name).join(', ')})
        );`;

        this.pool.connect()
            .then(client => {client
                .query(createTableQuery)
                .then(() => {
                    client.release()
                    console.log(`Table ${options.tableName} created successfully or already exists`);
                }).catch((error) => {
                    client.release();
                    console.error(`Error creating table ${options.tableName}:`, error);
                })
            }).catch(error => {
                console.error('Error connecting to the database:', error);
            });
    }

    log(level, msg, meta, callback) {
        const fields = tableColumns.map((column) => column.name)
        if(this.options.dataExtract === 'true' && msg.includes('events')){
            const dataToInsert = JSON.parse(msg).events;
            
            return this.pool.connect((err, client, release) => {
                if (err) {
                    return console.error('Error acquiring client:', err);
                }
                // Generate an array of parameterized values for the insert
                const values = dataToInsert.map(row => `('${row.mid}', '${level}', '${JSON.stringify(row)}', NOW())`).join(', ');
                // Construct and execute the insert query
                const query = `INSERT INTO ${this.options.tableName} (${fields.join(', ')}) VALUES ${values} ON CONFLICT (mid) DO NOTHING`;
                client.query(query, (err, result) => {
                    release(); // Release the client back to the pool
                    if (err) {
                        console.error('Error inserting multiple rows:', err);
                        callback(err, null);
                    } else {
                        callback(null, true);
                    }
                });
            });
        } else {
            const query = `INSERT INTO ${this.options.tableName} (${fields.join(', ')}) VALUES ('${meta.mid}', '${level}', '${msg}', NOW())`
            return this.pool.connect()
                .then(client => { client
                    .query(query)
                    .then(() => {
                        client.release();
                        return callback(null, true);
                    })
                    .catch((error) => {
                        client.release();
                        console.error(`Error while inserting table ${this.options.tableName}:`, error);
                        return callback(error.stack);
                    })
                }).catch(error => {
                    console.error('Error connecting to the database:', error);
                });
        }
        
    }

    health(callback) {
        this.pool.connect()
            .then(client => {
                client.release();
                callback(true);
            }).catch(error => {
                callback(false);
            });
    }

    async getMetricsData(req, callback){

        const startTimeStamp = req?.body?.request?.startTimeStamp;
        const endTimeStamp = req?.body?.request?.endTimeStamp;

        if((startTimeStamp || endTimeStamp) && (new Date(startTimeStamp) == "Invalid Date" || new Date(endTimeStamp) == "Invalid Date")){
            callback("Invalid startTimeStamp or endTimeStamp", null);
        }

        this.options.mobilePdataId =  this.options?.mobilePdataId || `${this.options.environment}.ejp.mobileapp`
        this.options.activityPdataId = this.options?.activityPdataId || 'ejp.story.api.service'
        this.options.IVRSPdataId = this.options?.IVRSPdataId || `${this.options.environment}.ejp.ivrs`
        this.options.sakhiPdataId = this.options?.sakhiPdataId || 'ejp.sakhi.api.service'
        const config =    [
                {
                    "id": "total_devices",
                    "label": "Total Devices",
                    "query": `SELECT COUNT(DISTINCT message->'context'->'did'::text) AS total_devices 
                                FROM ${this.options.tableName} WHERE message->'context'->'did' IS NOT NULL 
                                AND message->'context'->'pdata'->>'id' = '${this.options.mobilePdataId}'`,
                    "startTimeStamp": "2023-12-20 00:00:00",
                    "endTimeStamp": "2023-12-30 00:00:00"
                },
                {
                    "id": "total_plays",
                    "label": "Total Plays",
                    "query": `SELECT COUNT(*) AS total_plays 
                                FROM ${this.options.tableName} WHERE message->'edata'->>'type' = 'content' 
                                AND message->'edata'->>'mode' = 'play'`,
                    "startTimeStamp": "",
                    "endTimeStamp": ""
                },
                {
                    "id": "total_messages_from_activity_service",
                    "label": "Total messages from Activity Service",
                    "query": `SELECT COUNT(*) AS total_messages_from_activity_service 
                                FROM ${this.options.tableName} WHERE message->'context'->'pdata'->>'id'='${this.options.activityPdataId}'
                                AND message->>'eid' = 'LOG' AND message->'edata'->>'type' = 'api_access'`,
                    "startTimeStamp": "",
                    "endTimeStamp": ""
                },
                {
                    "id": "total_messages_from_sakhi_service",
                    "label": "Total messages from Sakhi Service",
                    "query": `SELECT COUNT(*) AS total_messages_from_sakhi_service 
                                FROM ${this.options.tableName} WHERE message->'context'->'pdata'->>'id'='${this.options.sakhiPdataId}'
                                AND message->>'eid' = 'LOG' AND message->'edata'->>'type' = 'api_access'`,
                    "startTimeStamp": "",
                    "endTimeStamp": ""
                },
                {
                    "id": "total_IVRS_calls",
                    "label": "Total Devices",
                    "query": `SELECT COUNT(*) AS total_IVRS_calls 
                                FROM ${this.options.tableName} 
                                WHERE message->'context'->'pdata'->>'id' = '${this.options.IVRSPdataId}'
                                AND message->>'eid' = 'START'`,
                    "startTimeStamp": "",
                    "endTimeStamp": ""
                }
            ]

        try{
            let asyncFunctions = []
            _.forEach(config, (data) => {
                if(data?.query) {
                    const query = this.prepareQuery(req, data);
                    asyncFunctions.push(this.pool.query(query));
                } else {
                    console.error(`Error: No query passed in ${data.id}`)
                }
            })

            let result = {};
            Promise.allSettled(asyncFunctions)
                .then(results => {
                    _.forEach(results, (res) => {
                        if(res.status === 'fulfilled'){
                            result = {...result, ...(res?.value?.rows[0] || {})}
                        } else {
                            console.error("error ", res?.reason)
                        }
                    })
                    callback(null, result);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } catch(err){
            console.error(`Error `, err);
            callback(err.stack);
        }
        
    }

    prepareQuery(req, data){
        const startTimeStamp = req?.body?.request?.startTimeStamp;
        const endTimeStamp = req?.body?.request?.endTimeStamp;
        
        let query = data.query
            
        if(!startTimeStamp && data.startTimeStamp){
            query = `${query} AND created_on >= '${data.startTimeStamp}'::timestamp`;
        }
        if(endTimeStamp && data.endTimeStamp){
            query = `${query} AND created_on <= '${data.endTimeStamp}'::timestamp`;
        }
        if(startTimeStamp){
            query = `${query} AND created_on >= '${startTimeStamp}'::timestamp`;
        }
        if(endTimeStamp){
            query = `${query} AND created_on <= '${endTimeStamp}'::timestamp`;
        }
    
        return query
    }


}

winston.transports.Postgres = PostgresDispatcher;

module.exports = { PostgresDispatcher };