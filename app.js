var express = require('express');
var { graphqlHTTP } = require('express-graphql');
const { recipeData } = require('./recipes');
var { buildSchema } = require('graphql');
//const schema = require('./schema');

// GraphQL schema
var schema = buildSchema(`
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
console.log(recipeData[0]);
var getRecipe = function (args) {
    console.log("getRecipe");
    var name = args.name;
    return recipeData.filter(recipe => {
        return recipe.name == name;
    })[0];
}
var getRecipes = function (args) {
    console.log("getRecipes")
    if (args.author) {
        var author = args.author;
        return recipeData.filter(recipe => recipe.author === author);
    } else {
        return recipeData;
    }
}

var root = {
    recipe: getRecipe,
    recipes: getRecipes
};

// Create an express server and a GraphQL endpoint
var app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));
