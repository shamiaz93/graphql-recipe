var express = require('express');
var { graphqlHTTP } = require('express-graphql');
const { recipeData } = require('./recipes');
var { buildSchema } = require('graphql');
//const schema = require('./schema');

// GraphQL schema
var schema = buildSchema(`
    type Query {
        recipe(id: Int!): Recipe
        recipes(userId: Int): [Recipe]
    },
    type Mutation {
        updateRecipe(id: Int!, name: String, description: String, ingredients: [String], method: [String], url: String): Recipe
        createRecipe(name: String!, author: String, description: String, ingredients: [String], method: [String], url: String, userId: Int!): Recipe
        saveOrShareRecipe(recipeId: Int!, userId: Int!): [Recipe]
    },
    type Recipe {
        id: Int
        name: String
        url: String
        description: String
        author: String
        ingredients: [String]
        method: [String],
        userId: [Int]
    }
`);

var getRecipe = function (args) {
    var id = args.id;
    return recipeData.filter(recipe => {
        return recipe.id == id;
    })[0];
}
var getRecipes = function (args) {
    if (args.userId) {
        var userId = args.userId;
        return recipeData.filter(recipe => recipe.userId && recipe.userId.includes(userId));//recipe.userId === userId);
    } else {
        return recipeData;
    }
}
var updateRecipe = function ({ id, name, description, ingredients, method, url }) {
    recipeData.map(recipe => {
        if (recipe.id === id) {
            if (name && name != "") recipe.name = name;
            if (description && description != "") recipe.description = description;
            if (url && url != "") recipe.url = url;
            if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) recipe.ingredients = ingredients;
            if (method && Array.isArray(method) && method.length > 0) recipe.method = method;
            return recipe;
        }
    });
    return recipeData.filter(recipe => recipe.id === id)[0];
}
var createRecipe = function ({ name, author, description, ingredients, method, url, userId }) {
    const getLastRecipeId = recipeData[recipeData.length - 1].id;
    if (name && userId) {
        const recipe = {
            name, description, author, ingredients, method, url, userId: [userId],
            id: getLastRecipeId + 1
        }
        recipeData.push(recipe);
    }
    return recipeData.filter(recipe => recipe.id === (getLastRecipeId + 1))[0];
}
var saveOrShareRecipe = function ({ recipeId, userId }) {
    if (recipeId && userId) {
        recipeData.map(recipe => {
            if (recipe.id === recipeId) {
                if (recipe.userId) {
                    if (!recipe.userId.includes(userId)) {
                        recipe.userId.push(userId);
                    }
                } else {
                    recipe.userId = [userId];
                }
                return recipe;
            }
        });
        return recipeData.filter(recipe => recipe.id === recipeId);
    }
}

var root = {
    recipe: getRecipe,
    recipes: getRecipes,
    updateRecipe: updateRecipe,
    createRecipe: createRecipe,
    saveOrShareRecipe: saveOrShareRecipe
};

// Create an express server and a GraphQL endpoint
var app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));
