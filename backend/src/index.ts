import { Hono } from "hono";
import { logger } from "hono/logger";
import { swaggerUI } from "@hono/swagger-ui";

const app = new Hono();

app.use(logger());
app.get("/ui", swaggerUI({ url: "/api" }));
app.get("/", (c) => {
    return c.text("Hello Hono!");
});

export default app;
