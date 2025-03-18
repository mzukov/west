//index.js

import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

function isDuck(card) {
    return card && card.quacks && card.swims;
}

function isDog(card) {
    return card instanceof Dog;
}

function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Duck extends Card {
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

class Dog extends Card {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        // При атаке, до нанесения урона, карта мигает "белым"
        // и урон уменьшается на 1.
        this.view.signalAbility(() => {
            // После завершения мигания вызываем continuation с уменьшенным уроном.
            continuation(value - 1);
        });
    }

    getDescriptions() {
        // Получаем описание из базового класса (чтобы не потерять информацию об "Утке" или "Собаке")
        const baseDescriptions = super.getDescriptions();
        // Добавляем краткое описание способности "Громилы"
        baseDescriptions.push('Получает на 1 меньше урона');
        return baseDescriptions;
    }
}


const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

const banditStartDeck = [
    new Dog(),
];

const game = new Game(seriffStartDeck, banditStartDeck);

SpeedRate.set(1);

game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
