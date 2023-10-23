import fastify from "fastify"
import cookie from "@fastify/cookie"

import { transsactionsRoutes } from "./routes/transsactions"

export const app = fastify()

app.register(cookie)
app.register(transsactionsRoutes, {
  prefix: 'transactions'
})
