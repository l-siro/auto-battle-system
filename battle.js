const uploadInput = document.getElementById('upload');
const battleLogDiv = document.getElementById('battle-log');

let battleField = document.getElementById('battle-field');
let orderOfActionDiv = document.getElementById('order-of-action');

let characters = [];
let turn = 0;
let phase = 0;
let actionOrderObjects = [];

function createCharacter(character) {
  // initialize character stats
  character.hp = character.vitality * 10;
  character.maxHP = character.vitality * 10;
  character.sp = character.intelligence * 5;
  character.maxSP = character.intelligence * 5;
  character.attack = character.strength * 2;
  character.defense = character.vitality * 2;
  character.accuracy = character.dexterity / 100;
  character.evasion = character.agility / 100;
  character.speed = character.agility / 2;
  character.shield = Math.floor(character.spirit / 20);

  // create div for character
  const characterDiv = document.createElement('div');
  characterDiv.classList.add('character');
  characterDiv.dataset.name = character.name;


  // craate div for character name
  const characterNameDiv = document.createElement('div');
  characterNameDiv.classList.add('character-name');
  characterNameDiv.textContent = character.name;
  characterDiv.appendChild(characterNameDiv);

  // create div for character image
  const characterImageDiv = document.createElement('div');
  characterImageDiv.classList.add('character-img');
  characterImageDiv.style.backgroundImage = `url(img/character/${character.name}.png)`;
  characterDiv.appendChild(characterImageDiv);

  characterDiv.className = 'character';

  if (character.side === 'ally') {
    characterDiv.classList.add('ally');
    const allySideDiv = document.querySelector('.ally-side');
    allySideDiv.appendChild(characterDiv);
  } else {
    characterDiv.classList.add('enemy');
    const enemySideDiv = document.querySelector('.enemy-side');
    enemySideDiv.appendChild(characterDiv);
  }

  // create HP progress bar
  const hpProgressBar = document.createElement('progress');
  hpProgressBar.classList.add('character-hp-indicator');
  hpProgressBar.setAttribute('max', character.maxHP);
  hpProgressBar.setAttribute('value', character.hp);
  characterDiv.appendChild(hpProgressBar);

  // create SP progress bar
  const spProgressBar = document.createElement('progress');
  spProgressBar.classList.add('character-sp-indicator');
  spProgressBar.setAttribute('max', character.maxSP);
  spProgressBar.setAttribute('value', character.sp);
  characterDiv.appendChild(spProgressBar);

  // create select box for strategy
  const selectStrategy = document.createElement('select');
  selectStrategy.classList.add('strategy-select');
  const strategies = ["ガンガン", "命大事に", "慎重", "反撃", "アイテム優先", "スキル優先", "大物狙い", "小物狙い", "トドメ"];
  for (let strategy of strategies) {
    let option = document.createElement('option');
    option.textContent = strategy;
    option.value = strategy;
    selectStrategy.appendChild(option);
  }
  characterDiv.appendChild(selectStrategy);

  // update the order of action div
  const orderElement = document.createElement('div');
  orderElement.textContent = character.name;
  orderElement.classList.add('order');
  orderElement.dataset.speed = character.speed;
  orderOfActionDiv.appendChild(orderElement);
}

function sortCharactersBySpeed() {
  let orderElements = Array.from(orderOfActionDiv.getElementsByClassName('order'));
  orderElements.sort((a, b) => b.dataset.speed - a.dataset.speed);

  while (orderOfActionDiv.firstChild) {
    orderOfActionDiv.removeChild(orderOfActionDiv.firstChild);
  }

  for (let orderElement of orderElements) {
    orderOfActionDiv.appendChild(orderElement);
  }
}

// JSON file upload handling
document.getElementById('upload').addEventListener('change', function (e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    characters = JSON.parse(e.target.result);
    for (let character of characters) {
      createCharacter(character);
    }
    sortCharactersBySpeed();
    actionOrderObjects = Array.from(orderOfActionDiv.children).map(ao => characters.find(c => c.name === ao.textContent));
  };
  reader.readAsText(file);
});

let startBattleButton = document.getElementById('start-battle');

startBattleButton.addEventListener('click', function () {
  phase++;
  takeTurn();
});

function takeTurn() {
  let activeCharacter = actionOrderObjects[turn];

  // check if character is alive
  if (activeCharacter.hp > 0) {
    // select strategy
    let strategy = document.querySelector(`.character[data-name="${activeCharacter.name}"] .strategy-select`).value;

    switch (strategy) {
      case 'ガンガン':
        // find live enemies
        let targets = characters.filter(c => c.side !== activeCharacter.side && c.hp > 0);
        // random selection
        let target = targets[Math.floor(Math.random() * targets.length)];

        if (target) {
          attack(activeCharacter, target);
        }
        break;
      // other strategies go here
    }

    turn++;
    if (turn >= actionOrderObjects.length) {
      turn = 0;
    }

    // check if all allies or enemies are defeated
    let allies = characters.filter(c => c.side === 'ally' && c.hp > 0);
    let enemies = characters.filter(c => c.side === 'enemy' && c.hp > 0);

    if (allies.length === 0 || enemies.length === 0) {
      // battle over
      return;
    }

    setTimeout(takeTurn, 1000);
  }
}


// basic attack function
function attack(attacker, target) {
  let hit = Math.random() < attacker.accuracy;

  if (hit) {
    let damage = attacker.attack - target.defense;
    if (damage < 0) {
      damage = 0;
    }

    target.hp -= damage;
    
    let targetHPIndicator = document.querySelector(`.character[data-name="${target.name}"] .character-hp-indicator`);
    targetHPIndicator.value = target.hp;

    // log attack
    let battleLogDiv = document.getElementById('battle-log');
    let logText = `${attacker.name}が${target.name}に${damage}のダメージを与えた！`;
    let logDiv = document.createElement('div');
    logDiv.textContent = logText;
    battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
  }
}
