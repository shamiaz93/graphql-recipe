var { buildSchema } = require('graphql');

// GraphQL schema
const schema = buildSchema(`
    type Query {
        recipe(name: String!): Recipe
        recipes(author: String): [Recipe]
    },
    type Recipe {
        id: Int
        name: String
        url: String
        description: String
        author: String
        ingredients: [String]
        method: [String]
    }
`);

