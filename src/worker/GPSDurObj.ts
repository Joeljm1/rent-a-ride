import { DurableObject } from "cloudflare:workers";
export class GPS extends DurableObject {
  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
  }
}
