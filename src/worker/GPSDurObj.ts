import { DurableObject } from "cloudflare:workers";
class GPS extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
  }
}
