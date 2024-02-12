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


export async function getPoll(app: FastifyInstance) {
    app.get('/polls/:pollId', async (request, reply) => {
    const getPollParams = z.object({
        pollId: z.string().uuid(),

    })

    
    const { pollId } = getPollParams.parse(request.params)

    const poll = await prisma.poll.findUnique({
        where: {
            id: pollId,

        },
        include: {
          options: {
            select: {
                id: true,
                tittle: true
            }
          }  
        }
    })

    
    return reply.send({ poll })
    
})
}