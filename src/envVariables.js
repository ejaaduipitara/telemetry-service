const os = require('os');

const envVariables = {
    level: process.env.telemetry_log_level || 'info',
    localStorageEnabled: process.env.telemetry_local_storage_enabled || 'true',
    telemetryProxyEnabled: process.env.telemetry_proxy_enabled,
    dispatcher: process.env.telemetry_local_storage_type,
    proxyURL: process.env.telemetry_proxy_url,
    proxyAuthKey: process.env.telemetry_proxy_auth_key,
    encodingType: process.env.telemetry_encoding_type,
    kafkaHost: process.env.telemetry_kafka_broker_list,
    topic: process.env.telemetry_kafka_topic,
    compression_type: process.env.telemetry_kafka_compression || 'none',
    filename: process.env.telemetry_file_filename || 'telemetry-%DATE%.log',
    maxSize: process.env.telemetry_file_maxsize || '100m',
    maxFiles: process.env.telemetry_file_maxfiles || '100',
    partitionBy: process.env.telemetry_cassandra_partition_by || 'hour',
    keyspace: process.env.telemetry_cassandra_keyspace,
    contactPoints: (process.env.telemetry_cassandra_contactpoints || 'localhost').split(','),
    cassandraTtl: process.env.telemetry_cassandra_ttl,
    port: process.env.telemetry_service_port || 9001,
    threads: process.env.telemetry_service_threads || os.cpus().length,
    host: process.env.telemetry_pg_host,
    username: process.env.telemetry_pg_username,
    password: process.env.telemetry_pg_password,
    db: process.env.telemetry_pg_db,
    tableName: process.env.telemetry_pg_tablename,
    dataExtract: process.env.telemetry_dataextract || 'false'
}
module.exports = envVariables;