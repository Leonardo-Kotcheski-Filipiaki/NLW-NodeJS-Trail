import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { prisma } from '../../lib/prisma'
import { redis } from '../../lib/redis'
import { FastifyInstance } from 'fastify'
import { voting } from '../../utils/voting-pub-sub'



/** ANOTAÇÕES
 * GET - Buscar uma informação
 * POST - Criar/registrar uma informação
 * PUT - Alterar uma informação por completo
 * DELETE - Deletar uma informação
 * PATCH - Alteração de uma parte de um recurso
*/


export async function voteOnPoll(app: FastifyInstance) {
    app.post('/polls/:pollId/votes', async (request, reply) => {
    const votePollBody = z.object({
        pollOptionId: z.string().uuid(),

    })

    const voteOnPollParams = z.object({
        pollId: z.string().uuid()
    })
    
    const { pollOptionId } = votePollBody.parse(request.body)
    const { pollId } = voteOnPollParams.parse(request.params)

    let { sessionId } = request.cookies

    if(sessionId){
        const userPreviousVoteOnPoll = await prisma.vote.findUnique({
            where: {
                sessionId_pollId: {
                    sessionId,
                    pollId
                }
            }
        })
        if(userPreviousVoteOnPoll){
            if(userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId){
                await prisma.vote.delete({
                    where:{
                       id: userPreviousVoteOnPoll.id, 
                    }
                })

                const votes = await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId)
                voting.publish(pollId, {
                    pollOptionId: userPreviousVoteOnPoll.pollOptionId,
                    votes: Number(votes) 
                })


            }else if(userPreviousVoteOnPoll){
                return reply.status(400).send({ message: 'You already voted on this poll.' })
            }
            
        }
    }


    if(!sessionId){
        sessionId = randomUUID()
    
        reply.setCookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            signed: true,
            httpOnly: true,
        })
    }

    await prisma.vote.create({
        data: {
            sessionId,
            pollId,
            pollOptionId
        }
    })

    const votes = await redis.zincrby(pollId, 1, pollOptionId)

    voting.publish(pollId, {
        pollOptionId,
        votes: Number(votes) 
    })


    return reply.status(201).send()
    
})
}