import { DurableObject } from "cloudflare:workers";
export class GPS extends DurableObject {
  lat: number | null;
  long: number | null;
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    // need to change to get from storage
    this.lat = null;
    this.long = null;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.headers.get("upgrade") === "websocket") {
      const webSockPair = new WebSocketPair();
      const [client, server] = Object.values(webSockPair);

      this.ctx.acceptWebSocket(server);
    } else if (request.method === "POST") {
    }
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
    });
  }
}
