const Influx = require("influx");
const os = require("os");

class DataHandler {
  constructor() {
    this.influx = new Influx.InfluxDB({
      host: "localhost",
      database: "erdts_db",
      schema: [
        {
          measurement: "test",
          fields: {
            bytestring: Influx.FieldType.STRING,
            length: Influx.FieldType.INTEGER,
          },
          tags: ["host"],
        },
      ],
    });
    this.influx
      .getDatabaseNames()
      .then((names) => {
        if (!names.includes("erdts_db")) {
          return influx.createDatabase("eredts_db");
        }
      })
      .catch((err) => {
        console.error(`Error creating Influx database!`);
      });

  }

  write(bytestring) {
    this.influx
      .writePoints([
        {
          measurement: "test",
          tags: { host: os.hostname() },
          fields: { bytestring: bytestring, length: bytestring.length },
        },
      ])
      .catch((err) => {
        console.error(`Error saving data to InfluxDB! ${err.stack}`);
      });
  }

  read(limit) {
    this.influx
      .query(
        `
    select * from test
    where host = ${Influx.escape.stringLit(os.hostname())}
    order by time desc
    limit ${limit}
  `
      )
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }
}

module.exports = {
  DataHandler: DataHandler
}