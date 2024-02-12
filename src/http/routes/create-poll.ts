import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { FastifyInstance } from 'fastify'


/** ANOTAÇÕES
 * GET - Buscar uma informação
 * POST - Criar/registrar uma informação
 * PUT - Alterar uma informação por completo
 * DELETE - Deletar uma informação
 * PATCH - Alteração de uma parte de um recurso
*/


export async function createPoll(app: FastifyInstance) {
    app.post('/polls', async (request, reply) => {
    const createPollBody = z.object({
        tittle : z.string(),
        options: z.array(z.string())
    })

    
    const { tittle, options } = createPollBody.parse(request.body)

    const poll = await prisma.poll.create({
        data: {
            tittle,
            options: {
                createMany: {
                    data: options.map(option => {
                        return {tittle: option}
                    }),
                }
            }
        }
    })

    
    return reply.status(201).send({ PollId : poll.id})
    
})
}