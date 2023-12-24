import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import express from 'express';
import { readFileSync } from 'fs';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { AppContext } from './context';
import { initializeServerContext } from './adapters/index.js';
import { makeResolvers } from './resolvers.js';
import { User } from './user/schema.js';

const serverContext = initializeServerContext();

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });
const resolvers = makeResolvers(serverContext);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

const getUser = async (token: string) => {
  const users: { [userId: string]: User } = {
    'c4679872-24fd-481a-be52-50f2a6ab257f': {
      id: 'c4679872-24fd-481a-be52-50f2a6ab257f',
      email: 'user1@example.com',
    },
  }
  return users[token];
};

const server = new ApolloServer<AppContext>({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token = req.headers.authorization || '';
      const user = await getUser(token);
      return { 
        ...serverContext,
        user,
      };
    },
  })
);

const PORT = 4000;

httpServer.listen(PORT, () => {
  console.log(`Server is now running s on http://localhost:${PORT}/graphql`);
  
});
