
// 背景設定
document.addEventListener("DOMContentLoaded", function () {
  var imageUpload = document.getElementById("bg-upload");
  var backgroundImage = document.getElementById("background-image");

  imageUpload.addEventListener("change", function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
      backgroundImage.style.backgroundImage =
        "url(" + e.target.result + ")";
    };

    reader.readAsDataURL(file);
  });
});


// 敵のクリアボタン
let enemyClearButton = document.getElementById('enemy-clear-button');
enemyClearButton.addEventListener('click', function () {
  let enemySideFront = document.querySelector('.enemy-side .frontline');
  let enemySideBack = document.querySelector('.enemy-side .backline');
  while (enemySideFront.firstChild) {
    enemySideFront.removeChild(enemySideFront.firstChild);
  }
  while (enemySideBack.firstChild) {
    enemySideBack.removeChild(enemySideBack.firstChild);
  }
  characters = characters.filter(c => c.side === 'ally');
  actionQueue = createActionQueue(characters);
  updateOrderDisplay();
});

// HPを全回復するボタン
let hpRecoverButton = document.getElementById('hp-recover-button');
hpRecoverButton.addEventListener('click', function () {
  characters.forEach(c => {
    c.hp = c.maxHP;
    let characterDiv = document.querySelector(`.character[data-name="${c.name}"]`);
    characterDiv.classList.remove('defeated');

    // アクションキューを再作成する
    actionQueue = createActionQueue(characters);
    updateOrderDisplay();
    updateStatus(c);
  });
});





// ターン時間を設定
let turnTime = 400;

const uploadInput = document.getElementById('upload');
const battleLogDiv = document.getElementById('battle-log');

// キャラクターのステータスを表示する要素を取得
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
  // キャラクターの武器を名前からオブジェクトに変換
  let weapon = weaponData.find(w => w.id === character.weapon);

  // キャラクターのスキルを名前からオブジェクトに変換
  character.skills = character.skills.map(skillName => {
    let skill = skills.find(skill => skill.name === skillName);
    if (!skill) {
      console.warn(`Skill "${skillName}" not found!`);
      return null;
    }
    return skill;
  }).filter(skill => skill !== null);

  // initialize character stats
  character.hp = character.vitality * 10;
  character.maxHP = character.vitality * 10;
  character.attack = character.strength * 2;
  character.defense = character.vitality;
  character.accuracy = character.dexterity / 100;
  character.evasion = character.agility / 100;
  character.speed = character.agility / 2;
  character.shield = Math.floor(character.spirit / 20);

  // Assign skills to the character based on their skill names
  character.actions = [];
  character.skills.forEach(skillName => {
    let skill = skills.find(s => s.name === skillName);
    if (skill) {
      character.actions.push(skill);
    }
  });

  // パッシブスキルを持っている場合、効果を適用
  character.skills.filter(skill => skill.type === 'passive').forEach(skill => skill.effect(character));


  // 武器のステータスを反映
  if (weapon) {
    // Add the stats of the weapon to the character's stats
    character.attack += weapon.attack;
    character.defense += weapon.defense;
    character.accuracy += weapon.accuracy;
    character.evasion += weapon.evasion;
    character.speed += weapon.speed;
  }


  // キャラクターを追加
  const characterDiv = document.createElement('div');
  characterDiv.classList.add('character');
  // 登場時のアニメーション用のクラスを追加
  characterDiv.classList.add('join');
  characterDiv.dataset.name = character.name;
  characterDiv.dataset.position = character.position;

  // ドラッグアンドドロップできるよう
  characterDiv.setAttribute('draggable', 'true');
  characterDiv.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', character.name);

    // ゴースト画像のカスタマイズ
    let clone = e.target.cloneNode(true);
    clone.style.backgroundColor = "#fff";
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "-100%";
    document.body.appendChild(clone);
    // ゴースト画像の位置を調整
    let rect = clone.getBoundingClientRect();
    e.dataTransfer.setDragImage(clone, rect.width / 2, rect.height / 2);
    setTimeout(() => {
      document.body.removeChild(clone);
    }, 0);
  });

  // キャラクターのサイドを更新する
  for (let side of ['ally-side', 'enemy-side']) {
    let sideElement = document.querySelector(`.${side}`);
    sideElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    sideElement.addEventListener('drop', (e) => {
      e.preventDefault();

      // dataTransferオブジェクトから文字名を取得する。
      let characterName = e.dataTransfer.getData('text/plain');

      // 文字オブジェクトを取得する
      let character = characters.find(c => c.name === characterName);

      // キャラクターのサイドを更新する
      character.side = side === 'ally-side' ? 'ally' : 'enemy';

      // 現在の親からキャラクターdivを削除する
      let characterDiv = document.querySelector(`.character[data-name="${characterName}"]`);
      characterDiv.parentNode.removeChild(characterDiv);

      // 最も近いフロントラインまたはバックラインのdivを見つける
      let positionDiv = e.target.closest('.frontline') || e.target.closest('.backline');

      // 新しい位置に文字のdivを追加する
      positionDiv.appendChild(characterDiv);

      // キャラクターdivのクラスも更新する
      characterDiv.classList.remove('ally', 'enemy');
      characterDiv.classList.add(character.side);

      // アクションキューを再作成する
      actionQueue = createActionQueue(characters);

      // ステータス更新
      updateStatus(character);

      // オーダーディスプレイを更新する
      updateOrderDisplay();
    });

    // .2s後に全てのキャラクターの.joinクラスを削除する
    setTimeout(() => {
      document.querySelectorAll('.character').forEach(character => {
        character.classList.remove('join');
      });
    }, 200);
  }

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
  // create div for HP/maxHP
  const hpDiv = document.createElement('div');
  hpDiv.classList.add('hp');
  hpDiv.innerHTML = `<span class="hp">${character.hp}</span> / ${character.maxHP}`;
  boxDiv.appendChild(hpDiv);

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
  const statusInnerDiv = document.createElement('div');
  statusInnerDiv.classList.add('status-inner');
  characterStatusDiv.appendChild(statusInnerDiv);
  
  characterDiv.appendChild(characterStatusDiv);
  // console.log(character.position);
  if (character.side === 'ally') {
    characterDiv.classList.add('ally');
    // .ally-sideの中の同じcharacter.positionの要素に追加
    let positionDiv = document.querySelector(`.ally-side .${character.position}`);
    positionDiv.appendChild(characterDiv);
    
  } else {
    characterDiv.classList.add('enemy');
    let positionDiv = document.querySelector(`.enemy-side .${character.position}`);
    positionDiv.appendChild(characterDiv);
  }

  updateStatus(character);
}

function createActionQueue(characters) {
  // 速度の降順でキャラクターをソート
  characters.sort((a, b) => b.speed - a.speed);

  // キャラクターの配列をループして、アクションキューを作成
  let actionQueue = [];
  let maxSpeed = Math.max(...characters.map(character => character.speed));

  for (let i = 0; i < maxSpeed; i++) {
    for (let character of characters) {
      if (character.hp > 0 && i % Math.floor(maxSpeed / character.speed) === 0) {
        actionQueue.push(character);
      }
    }
  }

  return actionQueue;
}

// ゲーム開始時にキューを作成
let actionQueue = createActionQueue(characters);

function updateOrderDisplay() {
  // 最初にオーダーディスプレイをクリア
  while (orderOfActionDiv.firstChild) {
    orderOfActionDiv.removeChild(orderOfActionDiv.firstChild);
  }

  // 次に、アクションキューの最初の10人を表示
  for (let i = turn; i < Math.min(turn + 12, actionQueue.length); i++) {
    let character = actionQueue[i];
    // Implement this part according to your actual UI
    let orderElement = document.createElement('div');
    if (character.side === 'ally') {
      orderElement.classList.add('ally');
    }
    if (character.side === 'enemy') {
      orderElement.classList.add('enemy');
    }
    orderElement.classList.add('order');
    orderElement.textContent = character.name;
    orderOfActionDiv.appendChild(orderElement);
  }
}



// キャラクターのドラッグアンドドロップによるポジション変更
let frontline = document.querySelector('.frontline');
let backline = document.querySelector('.backline');

[frontline, backline].forEach(position => {
  position.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  position.addEventListener('drop', (e) => {
    e.preventDefault();
    let name = e.dataTransfer.getData('text/plain');
    let character = document.querySelector(`.character[data-name="${name}"]`);
    character.dataset.position = position.classList.contains('frontline') ? 'frontline' : 'backline';
    position.appendChild(character);

    // Find the character object and update its position
    let characterObj = characters.find(c => c.name === name);
    if (characterObj) {
      characterObj.position = character.dataset.position;
    }
  });
});



// JSON file upload handling
document.getElementById('upload').addEventListener('change', function (e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    // charactersにJSONファイルの内容をマージ
    characters = characters.concat(JSON.parse(e.target.result));

    // 差分キャラクターを作成
    let newCharacters = characters.filter(c => !document.querySelector(`.character[data-name="${c.name}"]`));
    newCharacters.forEach(createCharacter);


    console.log(characters);
    
    // Create the action queue and update the order display
    actionQueue = createActionQueue(characters);
    updateOrderDisplay();

    // Get the action order objects
    actionOrderObjects = Array.from(orderOfActionDiv.children).map(ao => characters.find(c => c.name === ao.textContent));
  };
  reader.readAsText(file);
});


let startBattleButton = document.getElementById('start-battle');

startBattleButton.addEventListener('click', function () {
  phase++;
  takeTurn();
});

// 共有SPを定義
let sharedSP = {
  ally: 0,
  enemy: 0
};

// SP表示用の要素を取得 
let spElements = {
  ally: document.getElementById('ally-sp'),
  enemy: document.getElementById('enemy-sp')
};

// SPの値が変わったときに呼び出す関数
function updateSP(side) {
  let spElement = spElements[side];
  spElement.innerHTML = '';
  for (let i = 0; i < sharedSP[side]; i++) {
    let spCircle = document.createElement('div');
    spCircle.classList.add('sp-circle');
    spElement.appendChild(spCircle);
  }
}

// SPが使われる処理
function useSP(amount, side) {
  sharedSP[side] -= amount;
  updateSP(side);  // 表示を更新
}

// SPが回復する処理
function recoverSP(amount, side) {
  sharedSP[side] += amount;
  updateSP(side);  // 表示を更新
}

// キャラクターがアクションを取るたびに呼び出す関数
function takeAction(character) {
  // アクションを実行する（例：スキルを使う）
  useSP(5, character.side);  // sideは 'ally' または 'enemy'
  updateOrderDisplay();
}


function takeTurn() {
  let activeCharacter = actionOrderObjects[turn];
  let activeOrderElement = orderOfActionDiv.getElementsByClassName('order')[turn];

  // Check if character is alive
  if (activeCharacter && activeCharacter.hp > 0) {
    // select strategy
    let strategy = document.querySelector(`.character[data-name="${activeCharacter.name}"] .strategy-select`).value;

    // find live enemies and allies
    let enemies = characters.filter(c => c.side !== activeCharacter.side && c.hp > 0);
    let allies = characters.filter(c => c.side === activeCharacter.side && c.hp > 0);

    // Select action and target
    let action;
    let target;

    // activeCharacterが利用可能なアクションを取得
    let availableSkills = activeCharacter.skills.filter(action => {
      if (action.type === 'healing') {
        // allyの中で少なくとも1人が回復可能ならこのアクションは利用可能
        return allies.some(ally => ally.hp < ally.maxHP);
      } else {
        // エネミーが1人でも倒れていなければこのアクションは利用可能
        return enemies.length > 0;
      }
    });
    // 共有SPが足りるアクションだけをフィルタリング
    let affordableActions = availableSkills.filter(a => a.spCost <= sharedSP[activeCharacter.side]);


    
    if (affordableActions.length > 0) {
      action = affordableActions[Math.floor(Math.random() * affordableActions.length)];
      useSP(action.spCost, activeCharacter.side);
      if (action.type === 'healing') {
        let healableAllies = allies.filter(ally => ally.hp < ally.maxHP);
        if (healableAllies.length > 0) {
          target = healableAllies[Math.floor(Math.random() * healableAllies.length)];
        } else {
          action = { name: '通常攻撃', type: 'damage' };
          target = selectTarget(activeCharacter, enemies, action);
          recoverSP(1, activeCharacter.side);
        }
      } else {
        target = selectTarget(activeCharacter, enemies, action);
      }
    } else {
      action = { name: '通常攻撃', type: 'damage' };
      target = selectTarget(activeCharacter, enemies, action);
      recoverSP(1, activeCharacter.side);
    }


    if (target) {
      if (action.name === '通常攻撃') {
        attack(activeCharacter, target);
      } else {
        useSkill(activeCharacter, target, action);
      }
      // Check if the target has been defeated after the attack or skill use
      if (target.hp <= 0) {
        checkDefeated(target);
      }
    }
  } else {
    // If the character is defeated, skip to the next character
    console.log(`${activeCharacter.name}は倒れているのでスキップ`);
    processTurnEnd(activeOrderElement);
    return;
  }

  // Update the order of action display at the end of the turn
  updateOrderDisplay();

  if (activeOrderElement) {
    setTimeout(() => {
      activeOrderElement.classList.remove('active');
    }, turnTime);
    activeOrderElement.classList.add('active');
  }

  setTimeout(() => processTurnEnd(activeOrderElement), turnTime);
}

function processTurnEnd(activeOrderElement) {
  turn++;
  if (turn >= actionOrderObjects.length) {
    turn = 0;
    phase++;
  }

  // check if all allies or enemies are defeated
  let allies = characters.filter(c => c.side === 'ally' && c.hp > 0);
  let enemies = characters.filter(c => c.side === 'enemy' && c.hp > 0);

  // 勝利チームの判定
  if (allies.length === 0) {
    // 敵の勝利をログに出力
    let logText = `敗北...`;
    let logDiv = document.createElement('div');
    logDiv.classList.add('enemy-win');
    logDiv.textContent = logText;
    battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    return;
  } else if (enemies.length === 0) {
    // 味方の勝利
    let logText = `勝利！`;
    let logDiv = document.createElement('div');
    logDiv.classList.add('ally-win');
    logDiv.textContent = logText;
    battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    return;
  }

  // Determine if the next character is defeated
  let nextCharacter = actionOrderObjects[turn];
  if (nextCharacter && nextCharacter.hp <= 0) {
    // 倒れているキャラクターのタイムセットをスキップ
    setTimeout(takeTurn, 0);
    return;
  }

  setTimeout(takeTurn, turnTime);
  console.log(`ターンの終了　${phase}フェーズ`);
}


  // if (turn === 0 && phase % 5 === 0 && phase > 0) {
  //   alert("5ターンが経過しました。作戦を再選択してください。");
  //   return;
  // }


// 攻撃対象を選択する関数
function selectTarget(activeCharacter, enemies, action) {
  let target;
  let enemyFrontline = enemies.filter(enemy => enemy.position === 'frontline');

  if (enemyFrontline.length > 0) {
    if (!hasSnipeSkill(activeCharacter)) {
      target = enemyFrontline[Math.floor(Math.random() * enemyFrontline.length)];
    } else {
      target = enemies[Math.floor(Math.random() * enemies.length)];
    }
  } else {
    target = enemies[Math.floor(Math.random() * enemies.length)];
  }

  return target;
}

// 命中率計算関数
function calculateHitRate(accuracy, evasion) {
  var diff = accuracy - evasion;
  var hitRate = 50;
  if (diff > 0) {
    hitRate += diff * 0.5;
  }
  return hitRate;
}

// 通常攻撃関数
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
}

// スキル使用関数

function useSkill(user, target, action) {
  let hit;
  let skill = skills.find(skill => skill.id === action.id);
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
        effectLogText = `${user.name}の${skill.name}！${target.name}に${effectResult}のダメージを与えた！`;
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
}




// スキル定義
let skills = [
  {
    name: 'ヒール',
    id: 'healing',
    type: 'healing',
    spCost: 3,
    // スキルの効果
    effect: function (user, target) {
      let healingAmount = user.spirit * 3;
      if (target.hp + healingAmount > target.maxHP) {
        healingAmount = target.maxHP - target.hp;
      }
      target.hp += healingAmount;
      return healingAmount;
    },
    // スキル使用条件
    condition: function (user, target) {
      // 回復対象がいるかどうか
      return sharedSP[user.side] >= this.spCost && target.hp < target.maxHP && target.side === user.side && target.hp > 0;
    }
  },
  {
    name: 'ファイヤーボール',
    id: 'fireball',
    type: 'damage',
    spCost: 5,
    // スキルの効果
    effect: function (user, target) {
      let damage = user.intelligence * 2;
      if (target.weakness === 'fire') {
        // 通知ログを出力
        let logText = `${target.name}は炎に弱い！`;
        let logDiv = document.createElement('div');
        logDiv.textContent = logText;
        battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
        damage *= 2;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      return damage;
    },
    // スキル使用条件
    condition: function (user, target) {
      // 通常攻撃と同じ条件
      return sharedSP[user.side] >= this.spCost && target.hp > 0 && target.side !== user.side;
    }
  },
  {
    name: '強攻撃',
    id: 'strong-attack',
    type: 'damage',
    spCost: 1,
    // スキルの効果
    effect: function (user, target) {
      let damage = user.attack * 1.5;
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      return damage;
    },
    condition: function (user, target) {
      // 通常攻撃と同じ条件
      return sharedSP[user.side] >= this.spCost && target.hp > 0 && target.side !== user.side;
    }
  },
  {
    name: '連撃',
    id: 'double-attack',
    type: 'damage',
    spCost: 2,
    // スキルの効果
    effect: function (user, target) {
      let damage = user.attack * 3;
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      return damage;
    },
    condition: function (user, target) {
      // 通常攻撃と同じ条件
      return sharedSP[user.side] >= this.spCost && target.hp > 0 && target.side !== user.side;
    }
  },
  {
    name: '狙撃',
    id: 'snipe',
    type: 'passive',
    effect: function (character) {
      // 命中率を20%増加させる
      character.accuracy *= 1.2;
    },
    condition: function (user, target) {
      // 狙撃スキルの使用条件を定義
      return true;
    }
  },
  {
    name: '鉄壁',
    id: 'iron-wall',
    type: 'passive',
    // パッシブスキルの効果
    effect: function (character) {
      // 防御力を20%増加させる
      character.defense *= 1.2;
    },
    // スキル使用条件（パッシブスキルの場合は特に条件を設定する必要がないかもしれません）
    condition: function (character) {
      return true;
    }
  }

];

// パッシブスキル名での判定処理
function hasSnipeSkill(character) {
  // スキル名が「狙撃」のスキルを探す
  let snipeSkill = character.skills.find(skill => skill.name === '狙撃');
  return snipeSkill !== undefined;
}



function checkDefeated(character) {
  if (character.hp <= 0) {
    character.hp = 0;

    // Find the character in the action queue and remove them
    let index = actionQueue.findIndex(c => c.name === character.name);
    if (index !== -1) {
      actionQueue.splice(index, 1);
    }

    // Similarly, remove from the orderOfActionDiv
    let orderElement = Array.from(orderOfActionDiv.children).find(element => element.textContent === character.name);
    if (orderElement) {
      orderOfActionDiv.removeChild(orderElement);
    }

    // Add 'defeated' class to the character div
    let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
    if (characterDiv) {
      characterDiv.classList.add('defeated');
    }

    // Notify about the character's defeat
    let logText = `${character.name}が倒れた！`;
    let logDiv = document.createElement('div');
    logDiv.textContent = logText;
    battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);

    // Recreate the action queue
    actionQueue = createActionQueue(characters);

    // Update order display
    updateOrderDisplay();
  }
}



// status更新関数
function updateStatus(character) {
  let characterElement = document.querySelector(`.character[data-name="${character.name}"]`);

  // Update HP
  let hpElement = characterElement.querySelector('.character .hp .hp');
  hpElement.textContent = character.hp;

  let hpIndicatorElement = characterElement.querySelector('.character-hp-indicator');
  hpIndicatorElement.value = character.hp;

  // Update other status
  let statusElement = characterElement.querySelector('.status-inner');

  let weapon = weaponData.find(w => w.id === character.weapon);

  statusElement.innerHTML = `
  <table>
    <tr><th>武器 :</th> <td>${weapon.name}</td></tr>
    <tr><th>攻撃力 :</th> <td>${character.attack}</td></tr>
    <tr><th>防御力 :</th> <td>${character.defense}</td></tr>
    <tr><th>命中率 :</th> <td>${character.accuracy}</td></tr>
    <tr><th>回避率 :</th> <td>${character.evasion}</td></tr>
    <tr><th>行動力 :</th> <td>${character.speed}</td></tr>
    <tr><th>属性壁 :</th> <td>${character.shield}</td></tr>
    <tr><th>スキル :</th> <td>${character.skills.map(skill => skill.name).join('<br>')}</td></tr>
  </table>
  `;
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


// バトルログ表示
document.querySelector('#battle-log').addEventListener('click', function () {
  this.classList.toggle('open');
});