import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { knex } from "../database"
import { z } from 'zod'

export async function transactionsRoutes(app: FastifyInstance) {
    app.post('/', async (req, reply) => {
        
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(req.body)

        const transaction = await knex('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
        })

        return reply.status(201).send()
    })
}