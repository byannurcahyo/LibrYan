import { Hono } from "hono";
import { logger } from "hono/logger";
import { swaggerUI } from "@hono/swagger-ui";
import { serveStatic } from "hono/bun";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { userController } from "./controller/user-controller";

const app = new Hono();
const homepath =
    process.env.HOME ?? process.env.HOMEPATH ?? process.env.USERPROFILE ?? "";
app.use(serveStatic({ root: `${homepath}/libryan`, path: "/public" }));
app.use(logger());
app.get("/ui", swaggerUI({ url: "/api" }));
app.get("/", (c) => {
    return c.text("Hello Hono!");
});
app.route("/", userController);
app.onError(async (err, c) => {
    if (err instanceof HTTPException) {
        c.status(err.status);
        return c.json({
            errors: err.message,
        });
    } else if (err instanceof ZodError) {
        c.status(400);
        return c.json({
            errors: err.message,
        });
    } else {
        c.status(500);
        return c.json({
            errors: err.message,
        });
    }
});
export default app;
