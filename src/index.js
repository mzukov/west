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

class Creature extends Card {
    constructor(name, power) {
        super(name, power);
    }
    getDescriptions() {
        return [ getCreatureDescription(this), ...super.getDescriptions() ];
    }
}

class Duck extends Creature {
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

class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }
    static setInGameCount(value) {
        this.inGameCount = value;
    }
    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        if (super.doAfterComingIntoPlay) {
            super.doAfterComingIntoPlay(gameContext, continuation);
        } else {
            continuation();
        }
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        if (super.doBeforeRemoving) {
            super.doBeforeRemoving(continuation);
        } else {
            continuation();
        }
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        continuation(value + bonus);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        continuation(value - bonus);
    }

    getDescriptions() {
        const baseDescriptions = super.getDescriptions();
        if (
            Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')
        ) {
            baseDescriptions.push('Чем их больше, тем они сильнее');
        }
        return baseDescriptions;
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    }

    getDescriptions() {
        const baseDescriptions = super.getDescriptions();
        baseDescriptions.push('Получает на 1 меньше урона');
        return baseDescriptions;
    }
}

class Gatling extends Card {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        taskQueue.push(onDone => this.view.showAttack(onDone));
        const opponentTable = gameContext.oppositePlayer.table;
        opponentTable.forEach(card => {
            taskQueue.push(onDone => {
                if (card) {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        });
        taskQueue.continueWith(continuation);
    }
}

class Rogue extends Creature {
    constructor() {
        super('Изгой', 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const target = gameContext.oppositePlayer.table[gameContext.position];
        if (!target) {
            continuation();
            return;
        }

        const targetType = target.constructor;

        const allCards = [
            ...gameContext.currentPlayer.table,
            ...gameContext.oppositePlayer.table
        ];

        const abilitiesToSteal = [
            'modifyDealedDamageToCreature',
            'modifyDealedDamageToPlayer',
            'modifyTakenDamage'
        ];

        const stolenAbilities = {};


        for (let card of allCards) {
            if (card && card.constructor === targetType && !(card instanceof Rogue)) {
                let proto = Object.getPrototypeOf(card);
                for (let ability of abilitiesToSteal) {
                    if (proto.hasOwnProperty(ability)) {
                        if (!stolenAbilities[ability]) {
                            stolenAbilities[ability] = proto[ability];
                        }
                        delete proto[ability];
                    }
                }
            }
        }

        for (let ability in stolenAbilities) {
            if (!this.hasOwnProperty(ability)) {
                this[ability] = stolenAbilities[ability].bind(this);
            }
        }

        gameContext.updateView();
        continuation();
    }
}

export default Gatling;

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Rogue(),
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
    new Lad(),
];

const game = new Game(seriffStartDeck, banditStartDeck);

SpeedRate.set(1);

game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
