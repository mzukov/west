// creature.js
import Card from './Card.js';
import { getCreatureDescription } from './index.js';

export class Creature extends Card {
    getDescriptions() {
        const baseDescriptions = super.getDescriptions();
        const creatureDescription = getCreatureDescription(this);
        return [creatureDescription, ...baseDescriptions];
    }
}

export class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    }
    quacks() {
        console.log('quack');
    }
    swims() {
        console.log('float: both;');
    }
}

export class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}
