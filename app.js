var express = require('express');
var { graphqlHTTP } = require('express-graphql');
const { recipeData } = require('./recipes');
var { buildSchema } = require('graphql');
//const schema = require('./schema');

// GraphQL schema
var schema = buildSchema(`
    """
    Queries to return object or array of object of recipe details by recipe id or user id
    """
    type Query {
        """
        Returns an object of recipe details by recipe id
        """
        recipe(id: Int!): Recipe
        """
        Returns list of recipe as array of objects by user id
        """
        recipes(userId: Int): [Recipe]
    },
    """
    Mutations to create recipe, update recipe and save or share recipe
    """
    type Mutation {
        """
        Mutation to update recipe object using recipe id , name ,description , ingredients and method as input
        """
        updateRecipe(id: Int!, name: String, description: String, ingredients: [String], method: [String], url: String): Recipe
        """
        Mutation to create recipe object using recipe name author name ,description and ingredients and method as input
        """        
        createRecipe(name: String!, author: String, description: String, ingredients: [String], method: [String], url: String, userId: Int!): Recipe
        """
        Mutation to save or share recipe object using recipe id , User id  as input
        """        
        saveOrShareRecipe(recipeId: Int!, userId: Int!): [Recipe]
    },

    """
    Recipe object with properties, id, name, url, description, author, ingredients, method, url
    """
    type Recipe {
        """
        Id of the recipe object, it is a unique field
        """
        id: Int
        """
        String value to hold name of the recipe 
        """
        name: String
        """
        String value to represent recipe url 
        """
        url: String
        """
        String value to provide description about the recipe 
        """
        description: String
        """
        String value to hold the name of the author 
        """
        author: String
        """
        Array of string to provide details about ingredients 
        """
        ingredients: [String]
        """
        Method to return string array of recipes 
        """
        method: [String],
        """
        Int value to hold user id 
        """
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
