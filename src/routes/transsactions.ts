import { FastifyInstance } from "fastify"
import {z} from  "zod"
import crypto, { randomUUID } from "node:crypto"
import { knex } from "../database"
import { checkSessionIdExists } from "../middlewares/check-sessions-id-exixts"

// Cookies = Formas da gente manter contexto entre requisições
export async function transsactionsRoutes(app: FastifyInstance){  
  app.get('/',{
    preHandler:[checkSessionIdExists],
  },async (request, reply) => {

   const { sessionId } = request.cookies

    const transactions = await knex('transactions')
    .where('session_id', sessionId)
    .select()

    return { transactions }
  })

  // http://localhost:3333/transactions/:id
  app.get('/:id',{
    preHandler:[checkSessionIdExists],
  }, async (request) => {
    const getTransactionparamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionparamsSchema.parse(request.params)
    const { sessionId } = request.cookies
    const transaction = await knex('transactions')
    .where({
      session_id: sessionId,
      id,
    })
    .first()

    return { transaction }
  })

  app.get('/summary',{
    preHandler:[checkSessionIdExists],
  }, async (request) => {

    const { sessionId } = request.cookies
    const summary = await knex('transactions')
    .where('session_id', sessionId)
    .sum('amount', { as: 'amount'})
    .first()

    return {summary}
  })

  // { title, amount, type: credit ou debit }
  app.post('/', async (request, reply) => {
   const createTransactionBdySchema =  z.object({
    title: z.string(),
    amount: z.number(),
    type: z.enum(['credit', 'debit'])
   })

   const {title, amount, type} = createTransactionBdySchema.parse(request.body)

   let sessionId = request.cookies.sessionId

   if(!sessionId){
    sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,  // Expiration Cookies
    })
   }

    await knex('transactions')
   .insert({
    id: crypto.randomUUID(),
    title,
    amount: type === 'credit' ? amount : amount * -1,
    session_id: sessionId
   })

   // HTTP Codes
    return reply.status(201).send()
  })

}