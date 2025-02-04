export var POPULATION = 0;
export var ANIMAL_AMOUNT = 0;
export var TREE_AMOUNT = 0;
export var FOOD_AMOUNT = 0;

export function setPopulation(score: number) {
    POPULATION = score;
}

export function setAnimalCount(score: number) {
    ANIMAL_AMOUNT = score;
}

export function updateTreeAmount(score: number) {
    TREE_AMOUNT += score;
}

export function updateFoodAmount(score: number) {
    FOOD_AMOUNT += score;
}

export function getScoreText() {
    return "HUMAN:" + POPULATION + "/Animal:" + ANIMAL_AMOUNT + "/Tree:" + TREE_AMOUNT + "/Food:" + FOOD_AMOUNT;
}
