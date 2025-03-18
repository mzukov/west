// creature.js
import Card from './Card.js';
import { getCreatureDescription } from './index.js';

class Creature extends Card {
    getDescriptions() {
        // Получаем базовые описания из Card
        const baseDescriptions = super.getDescriptions();
        // Получаем описание существа с помощью функции из index.js
        const creatureDescription = getCreatureDescription(this);
        // Возвращаем новый массив, где первым элементом будет описание существа, а далее базовые описания
        return [creatureDescription, ...baseDescriptions];
    }
}

class Duck extends Creature {
    // Если требуется, можно добавить дополнительные свойства или методы
    // Конструктор наследуется от Creature, поэтому явное определение не обязательно
}

class Dog extends Creature {
    // Если требуется, можно добавить дополнительные свойства или методы
    // Конструктор наследуется от Creature, поэтому явное определение не обязательно
}

export { Creature, Duck, Dog };
