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
    type Mutation {
        updateRecipeName(id: Int!, name: String!): Recipe
        createRecipe(name: String!, author: String!, description: String): Recipe
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

var getRecipe = function (args) {
    var name = args.name;
    return recipeData.filter(recipe => {
        return recipe.name == name;
    })[0];
}
var getRecipes = function (args) {
    if (args.author) {
        var author = args.author;
        return recipeData.filter(recipe => recipe.author === author);
    } else {
        return recipeData;
    }
}
var updateRecipeName = function ({ id, name }) {
    recipeData.map(recipe => {
        if (recipe.id === id) {
            recipe.name = name;
            return recipe;
        }
    });
    return recipeData.filter(recipe => recipe.id === id)[0];
}
var createRecipe = function ({ name, author, description }) {
    const getLastRecipeId = recipeData[recipeData.length - 1].id;
    if (name && author) {
        const recipe = {
            name, description, author,
            id: getLastRecipeId + 1
        }
        recipeData.push(recipe);
    }
    return recipeData.filter(recipe => recipe.id === (getLastRecipeId + 1))[0];
}


var root = {
    recipe: getRecipe,
    recipes: getRecipes,
    updateRecipeName: updateRecipeName,
    createRecipe: createRecipe
};

// Create an express server and a GraphQL endpoint
var app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));
