import fastify from "fastify"
import cookie from "@fastify/cookie"
import {env} from "./env"
import { transsactionsRoutes } from "./routes/transsactions"

const app = fastify()

app.register(cookie)
app.register(transsactionsRoutes, {
  prefix: 'transactions'
})


app.listen({
  port: env.PORT,
}).then(() => {
  console.log('HTTP Server Running!')
})