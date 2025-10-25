import { DurableObject } from "cloudflare:workers";
export class GPS extends DurableObject {
  lat: number | null;
  long: number | null;
  sql: SqlStorage;
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    // need to change to get from storage
    this.lat = null;
    this.long = null;
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS GPS(
		id INTEGER PRIMARY KEY, 
		time INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
		lat INTEGER,
		long INTEGER,
      );`);
  }

  async fetch(request: Request): Promise<Response> {
    // if i need to check path later use below line
    // const url = new URL(request.url);
    if (request.headers.get("upgrade") === "websocket") {
      const webSockPair = new WebSocketPair();
      const [client, server] = Object.values(webSockPair);

      this.ctx.acceptWebSocket(server);
      if (!this.lat || !this.long) {
        const cursor = this.sql.exec(
          "SELECT lat,long from GPS ORDER BY time DESC LIMIT 1",
        );
        if (cursor.rowsRead > 0) {
          const next = cursor.next();
          if (!next.done) {
            // should always be true but need type system to obey 😭
            const lat = next.value["lat"]?.valueOf();
            const long = next.value["long"]?.valueOf();
            if (typeof lat == "number" && typeof long == "number") {
              this.lat = lat;
              this.long = long;
            }
          }
        }
      }

      server.send(`Lat:${this.lat} Long:${this.long}`);
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } else if (request.method === "POST") {
      const { lat, lon } = (await request.json()) as {
        lat: number | undefined;
        lon: number | undefined;
      };
      if (typeof lat == "number" && typeof lon == "number") {
        const wsArr = this.ctx.getWebSockets();
        this.lat = lat;
        this.long = lon;
        wsArr.forEach((ws) => {
          const sendMsg = `Lat:${lat} Long:${lon}` as const;
          ws.send(sendMsg);
        });
        this.sql.exec("INSERT INTO GPS(lat,long) VALUES (?,?)", [
          this.lat,
          this.long,
        ]);

        return new Response(JSON.stringify({ message: "Success" }), {
          status: 200,
        });
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid Latitude or Longitude" }),
          {
            status: 422,
          },
        );
      }
      //for getting history will do later if time
    } else if (request.method === "GET") {
      // prolly put logic to put to sqlite only after x time is odne or something and latest value in kv instead for history??
      // const cursor = this.sql.exec("SELECT lat,long from GPS ORDER BY time");
    }
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
    });
  }
}
