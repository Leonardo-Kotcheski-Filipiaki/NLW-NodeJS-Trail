# NLW Node JS Trail
+ Criação de uma API de enquetes
+ É possivel criar uma enquete, votar em uma enquete (com filtros de voto (apenas um voto por usuario, utilizando cookies)) ver em tempo real as votações da enquete.
+ estou usando para a criação desta API: NodeJS, Prisma, Zod, Fastify, PostgresSQL, Regis (ioRedis), Fastify/Websockets, Fastify/Cookies.
+ O sistema não possui interface, então é necessario um API tester como o postman!
# Rotas: (Levando em conta que você está em localhost)
## Criação de enquetes - Post: [http://localhost:3333/polls]()
+ Exemplo de body raw/JSON do POST:
  ````
  {
    "tittle" : "Gosta de NodeJS?",
    "options" : ["SIM", "NÃO", "PRA CARAMBA!"]
  }
  ````
+ retorna a poll Id (id da enquete)
## Obter informações de uma enquete - Get: [http://localhost:3333/polls/:pollId]() 
+ 'pollId': é o id da enquete qual deseja obter as informações
+ retorna todas as informações da enquete (id, titulo, opções de votação)
## Votar em uma opção de uma enquete - POST: [http://localhost:3333/polls/:pollId/votes]()
+ 'pollId': é o id da enquete qual deseja realizar uma votação
+ Exemplo de body raw/JSON do POST:
  ````
    {
      "pollOptionId" : ":optionId",
    }
  ````
+ 'optionId' é o id da opção que deseja votar, pode ser obtido ao obter informações de uma enquete!
# real-time voting (Postman)
+ Crie uma requisição websocket e se conecte com o link - [ws://localhost:3333/poll/:pollId/results]()
+ 'pollId': é o id da enquete qual deseja obter os votos em real-time
+ a cada voto feito, o sistema retornará um aviso, lembrando, só se pode votar uma vez por maquina!
