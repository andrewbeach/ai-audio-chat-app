import { ApolloServer } from '@apollo/server';
import { readFileSync } from 'fs';

import { initializeServerContext } from '../adapters';
import { makeResolvers } from '../resolvers';
import assert from 'assert';
import { initMockAdapters } from '../adapters/mock';
import { AppContext } from '../context';

const serverContext = initializeServerContext();
const resolvers = makeResolvers(serverContext);
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

describe('Messaging', () => {
  const adapters = initMockAdapters();
  const context: AppContext = {
    ...adapters,
    user: {
      id: 'test-1',
      email: 'test-1@example.com',
    },
  };

  const testServer = new ApolloServer({
    typeDefs,
    resolvers,
  }); 

  describe('Get messages', () => {
    it('retrieves no messages for new user', async () => {
      const response = await testServer.executeOperation({
        query: 'query SayHelloWorld($name: String) { hello(name: $name) }',
        variables: { name: 'world' },
      });

      assert(response.body.kind === 'single');
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data?.hello).toBe('Hello world!');
    });
  });
});
