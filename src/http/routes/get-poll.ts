import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { redis } from '../../lib/redis'
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

    if(!poll) {
        return reply.status(400).send({message: 'Poll not found'})
    }

    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')

    const votes = result.reduce((obj, line, index) => {
        if(index % 2 === 0){
            const score = result[index + 1]
            Object.assign(obj, { [line]: Number(score)})
        }


        return obj
    }, {} as Record <String, Number>)
    
    return reply.send({
        poll: {
            id: poll.id,
            tittle: poll.tittle,
            options: poll.options.map(options => {
                return {
                    id: options.id,
                    tittle: options.tittle,
                    score: (options.id in votes) ? votes[options.id] : 0
                }
            })
        }
    })
    
})
}