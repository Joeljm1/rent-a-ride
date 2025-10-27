import { DurableObject } from "cloudflare:workers";

export class GPS extends DurableObject {
  lat: number | null;
  long: number | null;
  time: Date | null;
  sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    // need to change to get from storage
    this.lat = null;
    this.long = null;
    this.time = null;
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS GPS(
		id INTEGER PRIMARY KEY, 
		time INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
		lat REAL,
		lon REAL
      );`);
  }

  //@ts-ignore
  async fetch(request: Request): Promise<Response> {
    // if i need to check path later use below line
    // const url = new URL(request.url);
    const webSockPair = new WebSocketPair();
    const [client, server] = Object.values(webSockPair);

    this.ctx.acceptWebSocket(server);
    // Always load the latest position from database if not in memory or if time is null
    if (!this.lat || !this.long || !this.time) {
      const cursor = this.sql.exec(
        "SELECT lat,lon,time from GPS ORDER BY time DESC LIMIT 1",
      );
      if (cursor.rowsRead > 0) {
        const next = cursor.next();
        if (!next.done) {
          // should always be true but need type system to obey 😭
          const lat = next.value["lat"]?.valueOf();
          const long = next.value["lon"]?.valueOf();
          const time = next.value["time"]?.valueOf();
          if (
            typeof lat == "number" &&
            typeof long == "number" &&
            typeof time == "number"
          ) {
            this.lat = lat;
            this.long = long;
            // Use the timestamp from database, not current time
            this.time = new Date(time * 1000);
          }
        }
      }
    }

    server.send(
      `Lat:${this.lat} Long:${this.long} Time:${this.time ? Math.floor(this.time.getTime() / 1000) : null}`,
    );
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  async updateCord(lat: number, lon: number) {
    try {
      const wsArr = this.ctx.getWebSockets();
      this.lat = lat;
      this.long = lon;
      this.time = new Date();
      wsArr.forEach((ws) => {
        const sendMsg =
          `Lat:${lat} Long:${lon} Time:${this.time ? Math.floor(this.time.getTime() / 1000) : null}` as const;
        ws.send(sendMsg);
      });
      this.sql.exec(
        "INSERT INTO GPS(lat,lon) VALUES (?,?);",
        ...[this.lat, this.long],
      );
      return "OK";
    } catch (err) {
      console.log(err);
      return `Error: ${err}`;
    }
  }
  // do this later
  async getHistory() {
    //    const sql = `SELECT lat, lon, time
    // FROM (
    //   SELECT lat, lon, time,
    //   ROW_NUMBER() OVER (ORDER BY time ASC) AS rn
    //   FROM GPS
    // )
    // WHERE rn % 10 = 0;`;

    const sql = `SELECT lat, lon, time FROM GPS;`;
    interface LatLong {
      lat: number;
      long: number;
      time: number;
    }

    const cursor = this.sql.exec(sql);
    const loc: LatLong[] = [];
    if (cursor.rowsRead > 0) {
      while (true) {
        const next = cursor.next();
        if (next.done) {
          return loc;
        }
        // should always be true but need type system to obey 😭
        const lat = next.value["lat"]?.valueOf();
        const long = next.value["lon"]?.valueOf();
        const time = next.value["time"]?.valueOf();
        if (
          typeof lat == "number" &&
          typeof long == "number" &&
          typeof time == "number"
        ) {
          loc.push({ lat: lat, long: long, time: time });
          console.log(loc);
        }
        /////[]
      }
    }
  }
}
