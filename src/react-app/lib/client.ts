import { hc } from "hono/client";
import { AppType } from "../../worker";
const client = hc<AppType>("/");
export default client;
