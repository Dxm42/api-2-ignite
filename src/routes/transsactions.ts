import { FastifyInstance } from "fastify"
import {z} from  "zod"
import crypto from "node:crypto"
import { knex } from "../database"

export async function transsactionsRoutes(app: FastifyInstance){  
  app.get('/', async () => {
    const transactions = await knex('transactions').select()

    return { transactions }
  })

  // http://localhost:3333/transactions/:id
  app.get('/:id', async (request) => {
    const getTransactionparamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionparamsSchema.parse(request.params)
    
    const transaction = await knex('transactions').where('id', id).first()

    return { transaction }
  })

  app.get('/summary', async () => {
    const summary = await knex('transactions').sum('amount')
  })

  // { title, amount, type: credit ou debit }
  app.post('/', async (request, reply) => {
   const createTransactionBdySchema =  z.object({
    title: z.string(),
    amount: z.number(),
    type: z.enum(['credit', 'debit'])
   })

   const {title, amount, type} = createTransactionBdySchema.parse(request.body)

    await knex('transactions')
   .insert({
    id: crypto.randomUUID(),
    title,
    amount: type === 'credit' ? amount : amount * -1,
   })

   // HTTP Codes
    return reply.status(201).send()
  })

}