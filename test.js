var fs = require('fs');
const recipes = require('./recipes');


const recipesNew = recipes.map((recipe, index) => {
    recipe.id = index + 1;
    index = index + 1;
    return recipe;
});

const jsonContent = JSON.stringify(recipesNew);

fs.writeFile("./alphabet.json", jsonContent, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

//console.log(recipesNew);