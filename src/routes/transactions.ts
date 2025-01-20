import { FastifyInstance } from 'fastify'
import crypto, { randomUUID } from 'node:crypto'
import { knex } from "../database"
import { z } from 'zod'

export async function transactionsRoutes(app: FastifyInstance) {    
    app.get('/summary', async (req, reply) => {
        const summary = await knex('transactions').sum('amount', { as: 'amount' }).first()

        return { summary }
    })

    app.get('/', async (req, reply) => {
        const transactions = await knex('transactions').select()

        return {
            transactions
        }
    })

    app.get('/:id', async (req, reply) => {
        const getTransactionsParamsSchema = z.object({
            id: z.string().uuid()            
        })  

        const { id } = getTransactionsParamsSchema.parse(req.params)

        const transaction = await knex('transactions').where('id', id).first()

        return { transaction }
    })
    
    app.post('/', async (req, reply) => {        
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(req.body)

        let sessionId = req.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            })
        }

        const transaction = await knex('transactions').insert({
            id: crypto.randomUUID(),            
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId
        })

        return reply.status(201).send()
    })
}