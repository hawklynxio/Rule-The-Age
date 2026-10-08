// Plenty of free supplies - high base production rate
const BASE_WOOD_PH = 3600; // 1 per second
const BASE_STONE_PH = 1800; // 0.5 per second
const BASE_FOOD_PH = 7200; // 2 per second

function calculateResources(village) {
    const now = Date.now();
    const elapsedMs = now - village.last_update;
    
    if (elapsedMs <= 0) return village;

    const hoursPassed = elapsedMs / (1000 * 60 * 60);

    const newWood = village.wood + (BASE_WOOD_PH * hoursPassed);
    const newStone = village.stone + (BASE_STONE_PH * hoursPassed);
    const newFood = village.food + (BASE_FOOD_PH * hoursPassed);

    return {
        ...village,
        wood: newWood,
        stone: newStone,
        food: newFood,
        last_update: now
    };
}

module.exports = { calculateResources };
