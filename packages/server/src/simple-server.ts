import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

type Message = {
  id: string;
}

type User = {
  id: string;
  email: string;
};

type UserContext = {
  user: User | undefined;
}

const typeDefs = `#graphql
  type Message {
    id: String
    text: String
  }

  type Query {
    messages: [Message]
  }
`;

const messages = [
  {
    id: '1',
    text: 'Hello, world!',
  },
  {
    id: '2',
    text: 'Second message',
  },
];

const resolvers = {
  Query: {
    messages: (parent: any, args: any, contextValue: any) => {
      if (!contextValue.user) return null;
      return messages;
    }
  },
};

const server = new ApolloServer<UserContext>({
  typeDefs,
  resolvers,
});

const getUser = async (token: string) => {
  const users: { [userId: string]: User } = {
    'user-1': {
      id: 'user-1',
      email: 'user1@example.com',
    },
  }
  return users[token];
};

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const token = req.headers.authorization || '';
    const user = await getUser(token);
    return { user };
  },
});

console.log(`🚀  Server ready at: ${url}`);
