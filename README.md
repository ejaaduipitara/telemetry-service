# Telemetry-service

The Telemetry service is designed to seamlessly capture data from various applications and services, providing valuable insights into user interactions and system performance. By leveraging this service(API), organizations can gain a comprehensive understanding of real-time usage patterns, enabling informed decision-making and optimization of their digital ecosystem.

# Prerequisites
*   NodeJs
*   PostgreSQL

# Installation
1. Clone the repository
   ```
   git clone https://github.com/Sunbird-AIAssistant/telemetry-service.git
   ```
2. Go to the root directory
   ```
   cd telemetry-service/src
   ```
3. Set up environment variables. update below veriables on `envVariables.js`  
   ```
   host: "localhost"  //postgresql db hostname or ip address 
   username: // postgresql db username
   password: // postgresql db password
   db: // postgresql database name
   tableName: // postgresql table name
   dataExtract: 'true' // true or false
   environment: 'dev' // dev, staging or prod
   dispatcher: 'postgres'
   ssl: false // true or false SSL enabnled or not
   supersetAdminUser: // superset admin username
   supersetAdminPass: // superset admin password
   supersethost: // // superset hostname or ip address  
   ```
4. Please use [link](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/) to install superset in locally
5. Run `npm install` to install node modules
6. Run `node app.js`

# API Specification and Documentation

### Telemetry send
The Telemetry API is a critical component of our system, designed to capture and store telemetry data in a PostgreSQL database. Telemetry is essential for monitoring, analysing, and optimizing the performance and behaviour of our applications.

|                |                          |
| --------       | -------                  |
| API end point  |  `/api/telemetry/v1`     |
| Method         | `POST`                   |
| Headers        | `NA`                     |
| Request        | `{"id":"api.djp.telemetry","ver":"3.0","params":{"msgid":"17afd6b09dd6448c891829d9f4af904a"},"ets":1703229372363,"events":[{"actor":{"id":12,"type":"System"},"context":{"channel":"ejp","did":"b8e7cad5-9fcb-11ee-8b98-acde48001122","env":"IVRS","pdata":{"id":"dev.ejp.ivrs","pid":"ivrs-service","ver":"1.0"},"sid":12},"mid":"START:b8e7cad5-9fcb-11ee-8b98-acde48001122","ver":"3.0","eid":"START","edata":{"mode":"start","type":"session"},"ets":1703229372363}]}`  |
| Response       | `{"id":"api.telemetry","ver":"1.0","ets":1703855749239,"params":{},"responseCode":"SUCCESS","result":{}}`    |
| Example cURL   | `curl --location '{{host}}/api/telemetry/v1' \ ` <br> `--header 'Content-Type: application/json' \ `<br> `--data '{"id":"api.djp.telemetry","ver":"3.0","params":{"msgid":"17afd6b09dd6448c891829d9f4af904a"},"ets":1703229372363,"events":[{"actor":{"id":12,"type":"System"},"context":{"channel":"ejp","did":"b8e7cad5-9fcb-11ee-8b98-acde48001122","env":"IVRS","pdata":{"id":"dev.ejp.ivrs","pid":"ivrs-service","ver":"1.0"},"sid":12},"mid":"START:b8e7cad5-9fcb-11ee-8b98-acde48001122","ver":"3.0","eid":"START","edata":{"mode":"start","type":"session"},"ets":1703229372363}]}'`                     |

### Telemetry Metrics
The Telemetry Metrics API is a powerful API that enables users to fetch counts of specific metrics directly without the need for Superset. This API serves as a lightweight alternative for quick metric retrieval.

|                |                          |
| --------       | -------                  |
| API end point  |  `/api/telemetry/v1/metrics`     |
| Method         | `POST`                   |
| Headers        | `NA`                     |
| Request        | `{"request":{"startTimeStamp":"2023-12-20 00:00:00","endTimeStamp":"2023-12-23 00:00:00"}}` <br> **Note:** Both startTimeStamp and endTimeStamp are optional.  |
| Response       | `{"id":"api.telemetry.metrics","ver":"1.0","ets":1703855265432,"params":{"resmsgid":"41f3d180-a64b-11ee-8050-83d462d95035","msgid":"41f3d181-a64b-11ee-8050-83d462d95035"},"responseCode":"SUCCESS","result":{"total_devices":"30","total_plays":"40","total_messages_from_activity_service":"20","total_messages_from_teacher_sakhi_service":"16","total_messages_from_parent_sakhi_service":"29","total_ivrs_calls":"50"}}`    |
| Example cURL   | `curl --location '{{host}}/api/telemetry/v1/metrics' \ --data ''`                     |

## Telemetry dashboard token
The Telemetry Dashboard Token API is a secure method to acquire an access token for the guest user of Superset. This token can be utilized to embed Superset charts in HTML pages without requiring explicit authentication.

|                |                          |
| --------       | -------                  |
| API end point  |  `/api/telemetry/v1/dashboard/token`     |
| Method         | `POST`                   |
| Headers        | `NA`                     |
| Request        | `{"request":{"dashboardIds":["3f0d276e-67cs-402f-8f9e-123cd67ab012","32c44b86-cs58-4c15-b8b5-123cd67ab012"]}}` <br> **Note:**  dashboardIds is mandatory.  |
| Response       | `{"id":"api.telemetry.access.token","ver":"1.0","ets":1705916905344,"params":{"resmsgid":"63193800-b90b-11ee-9b56-bb19a64b5c02","msgid":"63193801-b90b-11ee-9b56-bb19a64b5c02"},"responseCode":"SUCCESS","result":{"token":"{{token}}"}}`    |
| Example cURL   | `curl --location '{{host}}/api/telemetry/v1/dashboard/token' \ --data ''`                     |


# License
This project is licensed under the MIT License.

   
   


