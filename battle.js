// ターン時間を設定
const turnTime = 1000;
const uploadInput = document.getElementById('upload');
const battleLogDiv = document.getElementById('battle-log');

let battleField = document.getElementById('battle-field');
let orderOfActionDiv = document.getElementById('order-of-action');

let characters = [];
let turn = 0;
let phase = 0;
let actionOrderObjects = [];
let weaponData = [];


// Load weapon data from JSON file
fetch('./data/weapons.json')
  .then(response => response.json())
  .then(data => {
    weaponData = data;
  })
  .catch(error => console.error(error));


function createCharacter(character) {
  // Get the weapon that the character is equipped with
  let weapon = weaponData.find(w => w.id === character.weapon);

  // initialize character stats
  character.hp = character.vitality * 10;
  character.maxHP = character.vitality * 10;
  character.sp = character.intelligence * 5;
  character.maxSP = character.intelligence * 5;
  character.attack = character.strength * 2;
  character.defense = character.vitality;
  character.accuracy = character.dexterity / 100;
  character.evasion = character.agility / 100;
  character.speed = character.agility / 2;
  character.shield = Math.floor(character.spirit / 20);

  // 武器のステータスを反映
  if (weapon) {
    // Add the stats of the weapon to the character's stats
    character.attack += weapon.attack;
    character.defense += weapon.defense;
    character.accuracy += weapon.accuracy;
    character.evasion += weapon.evasion;
    character.speed += weapon.speed;
  }

  // create div for character
  const characterDiv = document.createElement('div');
  characterDiv.classList.add('character');
  characterDiv.dataset.name = character.name;

  // create a div for the box
  const boxDiv = document.createElement('div');
  boxDiv.classList.add('character-box');

  // create div for character name
  const characterNameDiv = document.createElement('div');
  characterNameDiv.classList.add('character-name');
  characterNameDiv.textContent = character.name;
  boxDiv.appendChild(characterNameDiv);

  // create div for character image
  const characterImageDiv = document.createElement('div');
  characterImageDiv.classList.add('character-img');
  characterImageDiv.style.backgroundImage = `url(img/character/${character.name}.png)`;
  boxDiv.appendChild(characterImageDiv);

  // create HP progress bar
  const hpProgressBar = document.createElement('progress');
  hpProgressBar.classList.add('character-hp-indicator');
  hpProgressBar.setAttribute('max', character.maxHP);
  hpProgressBar.setAttribute('value', character.hp);
  boxDiv.appendChild(hpProgressBar);

  // create SP progress bar
  const spProgressBar = document.createElement('progress');
  spProgressBar.classList.add('character-sp-indicator');
  spProgressBar.setAttribute('max', character.maxSP);
  spProgressBar.setAttribute('value', character.sp);
  boxDiv.appendChild(spProgressBar);

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
  boxDiv.appendChild(selectStrategy);

  // append the box div to the character div
  characterDiv.appendChild(boxDiv);

  // create div for character status
  const characterStatusDiv = document.createElement('div');
  characterStatusDiv.classList.add('status');
  characterStatusDiv.innerHTML = `
  <div>武器: ${weapon.name}</div>
  <div>HP: <span class="hp">${character.hp}</span> / ${character.maxHP}</div>
  <div>SP: <span class="sp">${character.sp}</span> / ${character.maxSP}</div>
  <div>攻撃力: ${character.attack}</div>
  <div>防御力: ${character.defense}</div>
  <div>命中率: ${character.accuracy}</div>
  <div>回避率: ${character.evasion}</div>
  <div>行動力: ${character.speed}</div>
  <div>属性壁: ${character.shield}</div>
`;
  characterDiv.appendChild(characterStatusDiv);

  if (character.side === 'ally') {
    characterDiv.classList.add('ally');
    const allySideDiv = document.querySelector('.ally-side');
    allySideDiv.appendChild(characterDiv);
  } else {
    characterDiv.classList.add('enemy');
    const enemySideDiv = document.querySelector('.enemy-side');
    enemySideDiv.appendChild(characterDiv);
  }

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

    // convert character skills from names to objects
    for (let character of characters) {
      character.skills = character.skills.map(skillName => {
        let skill = skills.find(skill => skill.name === skillName);
        if (!skill) {
          console.warn(`Skill "${skillName}" not found!`);
        }
        return skill;
      });
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
  let activeOrderElement = orderOfActionDiv.getElementsByClassName('order')[turn];

  // check if character is alive
  if (activeCharacter && activeCharacter.hp > 0) {
    // select strategy
    let strategy = document.querySelector(`.character[data-name="${activeCharacter.name}"] .strategy-select`).value;

    // find live enemies and allies
    let enemies = characters.filter(c => c.side !== activeCharacter.side && c.hp > 0);
    let allies = characters.filter(c => c.side === activeCharacter.side && c.hp > 0);

    let preferredAction = '';

    switch (strategy) {
      case 'ガンガン':
        preferredAction = 'damage';
        break;
      case '命大事に':
        preferredAction = 'healing';
        break;
      // add other strategies here
    }

    let availableActions = activeCharacter.skills.filter(s => s.type === preferredAction);
    if (Math.random() < 0.2) { // 20% chance to perform a normal attack
      availableActions.push({ name: '通常攻撃', type: 'damage' }); // added 'name' and 'type' property for normal attack
    }

    // Select action and target
    let action;
    let target;

    if (availableActions.length > 0) {
      // Filter actions that can be performed with the current SP
      let affordableActions = availableActions.filter(a => a.spCost <= activeCharacter.sp);

      // If there are no affordable actions, default to normal attack
      if (affordableActions.length === 0) {
        action = { name: '通常攻撃', type: 'damage' };
        target = enemies[Math.floor(Math.random() * enemies.length)];
      } else {
        action = affordableActions[Math.floor(Math.random() * affordableActions.length)];

        if (action.type === 'healing') {
          let healableAllies = allies.filter(ally => ally.hp < ally.maxHP);
          if (healableAllies.length > 0) {
            target = healableAllies[Math.floor(Math.random() * healableAllies.length)];
          } else {
            action = { name: '通常攻撃', type: 'damage' }; // Default to a normal attack if no allies need healing
            target = enemies[Math.floor(Math.random() * enemies.length)];
          }
        } else {
          target = enemies[Math.floor(Math.random() * enemies.length)];
        }
      }
    } else {
      action = { name: '通常攻撃', type: 'damage' }; // default to a normal attack
      target = enemies[Math.floor(Math.random() * enemies.length)];
    }

    if (target) {
      if (action.name === '通常攻撃') {
        attack(activeCharacter, target);
      } else {
        useSkill(activeCharacter, target, action); // replaced 'action.effect(activeCharacter, target)' with useSkill function
        // Subtract the SP cost of the skill from the character's SP
        activeCharacter.sp -= action.spCost;
      }
    }
  }

  if (activeOrderElement) {
    setTimeout(() => {
      activeOrderElement.classList.remove('active');
    }, turnTime);
    activeOrderElement.classList.add('active');
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

  if (turn === 0 && phase % 5 === 0 && phase > 0) {
    alert("5ターンが経過しました。作戦を再選択してください。");
    return;
  }
  setTimeout(takeTurn, turnTime);
}






// Hit rate calculation function
function calculateHitRate(accuracy, evasion) {
  var diff = accuracy - evasion;
  var hitRate = 50;
  if (diff > 0) {
    hitRate += diff * 0.5;
  }
  return hitRate;
}

// basic attack function
function attack(attacker, target) {
  let hitRate = calculateHitRate(attacker.accuracy, target.evasion);
  let hit = Math.random() * 100 < hitRate;

  if (hit) {
    let damage = attacker.attack - target.defense;
    if (damage < 1) {
      damage = 1;
    }

    target.hp -= damage;
    updateStatus(target);

    // log attack
    let logText = `${attacker.name}が${target.name}に${damage}のダメージを与えた！`;
    let logDiv = document.createElement('div');
    logDiv.textContent = logText;
    battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    applyAttackEffect(attacker);
    applyDamageEffect(target);
    updateStatus(target);
  } else {
    // log miss
    let logText = `${attacker.name}は${target.name}への攻撃を外した！`;
    let logDiv = document.createElement('div');
    logDiv.textContent = logText;
    battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    applyAttackEffect(attacker);
    applyMissEffect(target);
  }
  checkDefeated(target);
}



// スキル使用関数

function useSkill(user, target, skill) {
  let hit;
  if (skill.type === 'healing') {
    hit = true; // 回復は必ずヒット
  } else {
    let hitRate = calculateHitRate(user.accuracy, target.evasion);
    hit = Math.random() * 100 < hitRate;
  }

  if (hit) {
    let effectResult = skill.effect(user, target); // 使用するスキルの効果を発揮

    // スキルの効果のログを出力
    if (effectResult > 0) {
      let effectLogText;
      if (skill.type === 'damage') {
        effectLogText = `${user.name}の${skill.name}が${target.name}に${effectResult}のダメージを与えた！`;
        applyDamageEffect(target);
      } else if (skill.type === 'healing') {
        effectLogText = `${user.name}の${skill.name}が${target.name}のHPを${effectResult}回復させた！`;
        applyRecoveryEffect(target, effectResult);
      }

      // スキル使用ログをここに移動
      let logText = `${user.name}が${target.name}に対して${skill.name}を使用！`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);

      let effectLogDiv = document.createElement('div');
      effectLogDiv.textContent = effectLogText;
      battleLogDiv.insertBefore(effectLogDiv, battleLogDiv.firstChild);
    }

    applyAttackEffect(user);
    updateStatus(user);
    updateStatus(target);
  } else {
    // ログミス
    let logText = `${user.name}は${target.name}への${skill.name}を外した！`;
    let logDiv = document.createElement('div');
    logDiv.textContent = logText;
    battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    applyAttackEffect(user);
    applyMissEffect(target);
  }
  checkDefeated(target);
}






// スキル定義
let skills = [
  {
    name: 'healing',
    type: 'healing',
    spCost: 50,
    effect: function (user, target) {
      let healingAmount = user.spirit;
      if (target.hp + healingAmount > target.maxHP) {
        healingAmount = target.maxHP - target.hp;
      }
      target.hp += healingAmount;
      user.sp -= this.spCost;
      return healingAmount;
    },
    condition: function (user, target) {
      return user.sp >= this.spCost && target.hp < target.maxHP && target.side === user.side && target.hp > 0;
    }
  },
  {
    name: 'fireball',
    type: 'damage',
    spCost: 40,
    effect: function (user, target) {
      let damage = user.intelligence * 2;
      if (target.weakness === 'fire') {
        damage *= 2;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      user.sp -= this.spCost;
      return damage;
    },
    condition: function (user, target) {
      return user.sp >= this.spCost && target.hp > 0 && target.side !== user.side;
    }
  }
];



// convert character skills from names to objects
for (let character of characters) {
  character.skills = character.skills.map(skillName => skills.find(skill => skill.name === skillName));
}



function checkDefeated(character) {
  if (character.hp <= 0) {
    let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
    if (characterDiv) {
      characterDiv.classList.add('defeated');
    }
  }
}


// status更新関数
function updateStatus(character) {
  let statusDiv = document.querySelector(`.character[data-name="${character.name}"] .status`);
  let hpElement = statusDiv.querySelector('.hp');
  let spElement = statusDiv.querySelector('.sp');

  hpElement.textContent = character.hp;
  spElement.textContent = character.sp;

  // add update to the indicators
  let characterHPIndicator = document.querySelector(`.character[data-name="${character.name}"] .character-hp-indicator`);
  characterHPIndicator.value = character.hp;

  let characterSPIndicator = document.querySelector(`.character[data-name="${character.name}"] .character-sp-indicator`);
  characterSPIndicator.value = character.sp;
}




// エフェクト関数

// 通常攻撃エフェクト適用関数
function applyAttackEffect(character) {
  // Display attack effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('attack');

  setTimeout(function () {
    characterDiv.classList.remove('attack');
  }, 500); // Remove the attack effect after 500ms
}

// 回避エフェクト適用関数
function applyMissEffect(character) {
  // Display miss effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('miss');

  setTimeout(function () {
    characterDiv.classList.remove('miss');
  }, 500); // Remove the miss effect after 500ms
}

// ダメージエフェクト適用関数
function applyDamageEffect(character) {
  // Display damage effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('damage');
  // ダメージ数値表記を追加
  let damageDiv = document.createElement('div');
  damageDiv.classList.add('damage-text');
  damageDiv.textContent = character.attack;
  characterDiv.appendChild(damageDiv);

  setTimeout(function () {
    characterDiv.classList.remove('damage');
    characterDiv.removeChild(damageDiv);
  }, 500); // Remove the damage effect after 500ms
}

// 回復エフェクト適用関数
function applyRecoveryEffect(character, recoveryAmount) {
  // Display recovery effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('recovery');
  // ダメージ数値表記を追加
  let recoveryDiv = document.createElement('div');
  recoveryDiv.classList.add('recovery-text');
  recoveryDiv.textContent = recoveryAmount;
  characterDiv.appendChild(recoveryDiv);

  setTimeout(function () {
    characterDiv.classList.remove('recovery');
    characterDiv.removeChild(recoveryDiv);
  }, 500); // Remove the recovery effect after 500ms
}
