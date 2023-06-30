import { controlGUI, setEnemyClearListener, setRecoverHPListener } from './gui.js'; controlGUI(); // GUIを制御する関数を読み込む
import { itemEffects } from './items.js'; // アイテム効果定義を読み込む
import { skills } from './skill.js'; // スキル定義を読み込む
import { applyAttackEffect, applyMissEffect, applyDamageEffect, applyRecoveryEffect } from './displayEffect.js'; // エフェクト定義を読み込む
import { characterImgUplod } from './characterImgUplod.js'; // キャラクター画像アップロード定義を読み込む


// HP回復ボタンを押したときの処理
let hpRecoverButton = document.getElementById('hp-recover-button');
hpRecoverButton.addEventListener('click', function () {
  setRecoverHPListener(characters);
});

// 敵削除ボタン
let enemyClearButton = document.getElementById('enemy-clear-button');
enemyClearButton.addEventListener('click', function () {
  setEnemyClearListener(characters, sharedSP, actionQueue);
  
  // console.log('btn...actionQueue:', actionQueue);
  // console.log('characters:', characters);
});

// セーブボタン
let saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', function () {
  // jsonデータとしてダウンロード。
  const blob = new Blob([JSON.stringify(characters)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  // ファイル名を「味方チーム_日時.json」設定
  let date = new Date();
  let dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  link.download = `味方チーム_${dateString}.json`;
  link.click();
});


let characters = [];
let turn = 0;
let phase = 0;
let actionOrderObjects = [];
let weaponData = [];

// ボタン
let startBattleButton = document.getElementById('start-battle');

// 共有SPを定義
let sharedSP = {
  ally: 0,
  enemy: 0
};


// 戦闘力の変数設定
let enemyPower
let allyPower

let allyWinRate
let powerDifference



// 勝率表示ボタン
let winRateButton = document.getElementById('win-rate-button');
winRateButton.addEventListener('click', function () {
  let message;
  if (allyWinRate > 80) {
    message = "敵は弱そうだ！";
  }
  else if (allyWinRate > 60) {
    message = "敵は強そうだ！";
  }
  else if (allyWinRate > 40) {
    message = "敵はかなり強そうだ！";
  }
  else if (allyWinRate > 20) {
    message = "敵は圧倒的に強そうだ！";
  }
  else {
    message = "敵は最強のようだ！";
  }
  
  let newParagraph = document.createElement('div');
  newParagraph.innerHTML = `
    <p>${message}</p>
    <table>
      <tr>
        <th>味方の戦力</th>
        <th>敵の戦力</th>
        <th>戦力差</th>
      </tr>
      <tr>
        <td>${allyPower}</td>
        <td>${enemyPower}</td>
        <td>${powerDifference}</td>
      </tr>
    </table>`;
  battleLogDiv.insertBefore(newParagraph, battleLogDiv.firstChild);
});

// ポーズボタン
let isPaused = false;
let strategyPause = document.getElementById('strategy-pause');
strategyPause.addEventListener('click', function () {
  // ポーズ中の場合は再開
  if (strategyPause.classList.contains('paused')) {
    strategyPause.classList.remove('paused');
    strategyPause.textContent = '作戦タイム';
    isPaused = false;
    
    // カットインを表示
    let cutin = document.getElementById('cutin');
    let cutinText = document.createElement('div');
    cutinText.textContent = '/  戦闘再開！  /';
    cutin.classList.add('cutin');
    cutinText.classList.add('cutin__text');
    cutin.appendChild(cutinText);
    // アニメーション終了後にcutinTextを削除
    cutinText.addEventListener('animationend', function () {
      cutin.removeChild(cutinText);
      cutin.classList.remove('cutin');
    }, {once: true});
    takeTurn();
  } else {
  // ポーズ中でない場合はポーズ
    strategyPause.classList.add('paused');
    strategyPause.textContent = '戦闘再開';
    isPaused = true;
  }
});


// ターン時間を設定
let turnTime = 600;


// 戦闘速度変更ボタン
let speedControl1x = document.getElementById('speed-control-1x');
let speedControl2x = document.getElementById('speed-control-2x');

speedControl1x.addEventListener('click', function () {
  speedControl1x.classList.add('selected');
  speedControl2x.classList.remove('selected');
  turnTime = 600;
});

speedControl2x.addEventListener('click', function () {
  speedControl1x.classList.remove('selected');
  speedControl2x.classList.add('selected');
  turnTime = 200;
});


// ログを出力する要素
const battleLogDiv = document.getElementById('battle-log');

// 行動順を表示する要素
const orderOfActionDiv = document.getElementById('order-of-action');


// 武器データを読み込む
fetch('./data/weapons.json').then(response => response.json()).then(data => {weaponData = data;}).catch(error => console.error(error));


// キャラクター作成
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


  // もし最大HPが未定義ならば、初期最大HPを計算する
  if (character.maxHP === undefined) {
    character.maxHP = character.vitality * 10;
  } else {
    character.maxHP = character.maxHP;
  }
  
  //もし現在HPが未定義ならば、現在HPを初期HPにする
  if (character.hp === undefined) {
    character.hp = character.vitality * 10;
  } else {
    character.hp = character.hp;
  }

  character.attack = character.strength * 2; // 攻撃力
  character.defense = (character.vitality + character.strength) / 2; // 防御力
  character.accuracy = character.dexterity; // 命中
  character.evasion = character.agility; // 回避
  character.speed = (character.agility + character.dexterity) / 2; // 行動速度

  // Assign skills to the character based on their skill names
  character.actions = [];
  character.skills.forEach(skillName => {
    let skill = skills.find(s => s.name === skillName);
    if (skill) {
      character.actions.push(skill);
    }
  });

  // パッシブスキルを持っている場合、効果を適用


  // 武器のステータスを反映
  if (weapon) {
    // Add the stats of the weapon to the character's stats
    character.attack += weapon.attack;
    character.defense += weapon.defense;
    character.accuracy += weapon.accuracy;
    character.evasion += weapon.evasion;
    character.speed += weapon.speed;
  }

  character.skills.filter(skill => skill.type === 'passive').forEach(skill => skill.effect(character));


  // 味方character全員の戦闘力を計算
  allyPower = characters.filter(c => c.side === 'ally').reduce((sum, c) => sum + c.attack + c.defense + c.speed, 0);
  // 敵character全員の戦闘力を計算
  enemyPower = characters.filter(c => c.side === 'enemy').reduce((sum, c) => sum + c.attack + c.defense + c.speed, 0);
  
  if (allyPower && enemyPower) {
    // console.log(`味方の戦闘力: ${allyPower}`);
    // console.log(`敵の戦闘力: ${enemyPower}`);

    // パワーから戦力差を計算
    allyWinRate = allyPower / (allyPower + enemyPower);
    allyWinRate = Math.floor(allyWinRate * 100);

    powerDifference = Math.abs(allyPower - enemyPower);
    // console.log(`戦力差: ${powerDifference}`);
    
  }

  // 味方の戦闘力が敵よりも高い場合、敵のステータスを強化
  // if (allyPower > enemyPower) {
  //   character.attack += Math.floor(character.attack * 0.1);
  //   character.defense += Math.floor(character.defense * 0.1);
  //   character.speed += Math.floor(character.speed * 0.1);
  // }
  

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
      // console.log(e.target);
      e.preventDefault();
    
      // dataTransferオブジェクトから文字名を取得する。
      let characterName = e.dataTransfer.getData('text/plain');
    
      // 文字オブジェクトを取得する
      let character = characters.find(c => c.name === characterName);
    
      // キャラクターのサイドを更新する
      character.side = side === 'ally-side' ? 'ally' : 'enemy';
    
      // 最も近いフロントラインまたはバックラインのdivを見つける
      let positionDiv = e.target.closest('.frontline') || e.target.closest('.backline');
    
      // 現在の親からキャラクターdivを削除する
      let characterDiv = document.querySelector(`.character[data-name="${characterName}"]`);
      characterDiv.parentNode.removeChild(characterDiv);
    
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
      updateOrderDisplay(actionQueue);
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
  
  // キャラクター画像をアップロード
  characterImgUplod(characterImageDiv);
  console.log(characterImageDiv);

  // create HP progress bar
  const hpProgressBar = document.createElement('progress');
  hpProgressBar.classList.add('character-hp-indicator');
  hpProgressBar.setAttribute('max', character.maxHP);
  hpProgressBar.setAttribute('value', character.hp);
  boxDiv.appendChild(hpProgressBar);
  // create div for HP/maxHP
  const hpDiv = document.createElement('div');
  hpDiv.classList.add('hp');
  hpDiv.innerHTML = `<span class="hp">${character.hp}</span> / <span class="max-hp">${character.maxHP}</span>`;
  boxDiv.appendChild(hpDiv);

  // create select box for strategy
  // const selectStrategy = document.createElement('select');
  // selectStrategy.classList.add('strategy-select');
  // const strategies = ["ガンガン", "命大事に", "慎重", "反撃", "アイテム優先", "スキル優先", "大物狙い", "小物狙い", "トドメ"];
  // for (let strategy of strategies) {
  //   let option = document.createElement('option');
  //   option.textContent = strategy;
  //   option.value = strategy;
  //   selectStrategy.appendChild(option);
  // }
  // boxDiv.appendChild(selectStrategy);

  // append the box div to the character div
  characterDiv.appendChild(boxDiv);

  // create div for character status
  const characterStatusDiv = document.createElement('div');
  characterStatusDiv.classList.add('status');
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

// 行動順定義
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
export { createActionQueue };

// ゲーム開始時にキューを作成
let actionQueue = createActionQueue(characters);

// 行動順表示
function updateOrderDisplay(actionQueue) {
  // 最初にオーダーディスプレイをクリア
  while (orderOfActionDiv.firstChild) {
    orderOfActionDiv.removeChild(orderOfActionDiv.firstChild);
  }
  // 次に、アクションキューの最初の12人を表示
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
export { updateOrderDisplay };



// JSONファイルの読み込み

document.getElementById('upload').addEventListener('change', function (e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    // charactersにJSONファイルの内容をマージ
    characters = characters.concat(JSON.parse(e.target.result));

    // 差分キャラクターを作成
    let newCharacters = characters.filter(c => !document.querySelector(`.character[data-name="${c.name}"]`));
    newCharacters.forEach(createCharacter);


    // console.log(characters);
    
    // Create the action queue and update the order display
    actionQueue = createActionQueue(characters);
    updateOrderDisplay(actionQueue);

    // Get the action order objects
    actionOrderObjects = Array.from(orderOfActionDiv.children).map(ao => characters.find(c => c.name === ao.textContent));
  };
  reader.readAsText(file);

  //inertを削除
  startBattleButton.removeAttribute('inert');
  startBattleButton.textContent = '戦闘開始';
});




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
export { updateSP };

// SPが使われる処理
function useSP(amount, side) {
  sharedSP[side] -= amount;
  updateSP(side);  // 表示を更新
}
export { useSP };

// SPが回復する処理
function recoverSP(amount, side) {
  sharedSP[side] += amount;
  updateSP(side);  // 表示を更新
}
export { recoverSP };

// キャラクターがアクションを取るたびに呼び出す関数
function takeAction(character) {
  // アクションを実行する（例：スキルを使う）
  useSP(5, character.side);  // sideは 'ally' または 'enemy'
  updateOrderDisplay(actionQueue);
}
export { takeAction };

// 戦闘開始ボタン
startBattleButton.addEventListener('click', function () {
  startBattleButton.inert = true;
  strategyPause.inert = false;
  startBattleButton.textContent = '戦闘中';
  
  // #cutinに戦闘開始カットインを表示、アニメーションさせて消す
  let cutin = document.getElementById('cutin');
  let cutinText = document.createElement('div');
  cutinText.textContent = '/  戦闘開始  /';
  cutin.classList.add('cutin');
  cutinText.classList.add('cutin__text');
  cutin.appendChild(cutinText);
  // アニメーション終了後にcutinTextを削除
  cutinText.addEventListener('animationend', function () {
    cutin.removeChild(cutinText);
    cutin.classList.remove('cutin');
    phase++;
    takeTurn();
  }, {once: true});
  
});

// ターンを進める
function takeTurn() {
  let activeCharacter = actionOrderObjects[turn];
  let activeOrderElement = orderOfActionDiv.getElementsByClassName('order')[turn];

  // Check if character is alive
  if (activeCharacter && activeCharacter.hp > 0) {
    // select strategy
    // let strategy = document.querySelector(`.character[data-name="${activeCharacter.name}"] .strategy-select`).value;

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


    
    // 使えるアクションがあればランダムに選択
    if (affordableActions.length > 0) {
      action = affordableActions[Math.floor(Math.random() * affordableActions.length)];
      useSP(action.spCost, activeCharacter.side);
      if (action.type === 'healing') {
        let healableAllies = allies.filter(ally => ally.hp < ally.maxHP);
        if (healableAllies.length > 0) {
          // 最もHPが低い味方を回復対象にする
          target = healableAllies.reduce((a, b) => a.hp < b.hp ? a : b);
        } else {
          action = { name: '通常攻撃', type: 'damage' };
          target = selectTarget(activeCharacter, enemies, action);
          recoverSP(1, activeCharacter.side);
        }
      } else {
        target = selectTarget(activeCharacter, enemies, action);
      }
    } else {
      // ない場合は通常攻撃
      action = { name: '通常攻撃', type: 'damage' };
      target = selectTarget(activeCharacter, enemies, action);
      recoverSP(1, activeCharacter.side);
    }

    // 使用したアクションを表示
    if (target) {
      if (action.name === '通常攻撃') {
        attack(activeCharacter, target);
        console.log(`${activeCharacter.name}の通常攻撃！`);
      } else {
        useSkill(activeCharacter, target, action);
        console.log(`${activeCharacter.name}の${action.name}！`);
      }
    }
  } else {
    // If the character is defeated, skip to the next character
    // console.log(`${activeCharacter.name}は倒れているのでスキップ`);
    processTurnEnd(activeOrderElement);
    return;
  }

  // Update the order of action display at the end of the turn
  updateOrderDisplay(actionQueue);

  if (activeOrderElement) {
    setTimeout(() => {
      activeOrderElement.classList.remove('active');
    }, turnTime);
    activeOrderElement.classList.add('active');
  }

  setTimeout(() => processTurnEnd(activeOrderElement), turnTime);
}


// ターン終了時の処理
function processTurnEnd(activeOrderElement) {

  // ポーズ中だった場合、処理を停止
  if (isPaused) {
    // カットインを表示
    let cutin = document.getElementById('cutin');
    let cutinText = document.createElement('div');
    cutinText.textContent = '/  作戦タイム  /';
    cutin.classList.add('cutin');
    cutinText.classList.add('cutin__text');
    cutin.appendChild(cutinText);
    // アニメーション終了後にcutinTextを削除
    cutinText.addEventListener('animationend', function () {
      cutin.removeChild(cutinText);
      cutin.classList.remove('cutin');
    }, {once: true});
    
    return;
  }


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
    
    // カットインを表示
    let cutin = document.getElementById('cutin');
    let cutinText = document.createElement('div');
    cutinText.textContent = '/  敗北...  /';
    cutin.classList.add('cutin');
    cutin.classList.add('-enemy-win');
    cutinText.classList.add('cutin__text');
    cutin.appendChild(cutinText);
    // アニメーション終了後にcutinTextを削除
    cutinText.addEventListener('animationend', function () {
      cutin.removeChild(cutinText);
      cutin.classList.remove('cutin');
      cutin.classList.remove('-enemy-win');
    }, {once: true});

    // 戦闘開始ボタンを有効化
    startBattleButton.disabled = false;
    startBattleButton.textContent = '戦闘開始';
    return;
  } else if (enemies.length === 0) {
    // 味方の勝利
    let logText = `勝利！`;
    let logDiv = document.createElement('div');
    logDiv.classList.add('ally-win');
    logDiv.textContent = logText;
    battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);

    // カットインを表示
    let cutin = document.getElementById('cutin');
    let cutinText = document.createElement('div');
    cutinText.textContent = '/  勝利！  /';
    cutin.classList.add('cutin');
    cutin.classList.add('-ally-win');
    cutinText.classList.add('cutin__text');
    cutin.appendChild(cutinText);
    // アニメーション終了後にcutinTextを削除
    cutinText.addEventListener('animationend', function () {
      cutin.removeChild(cutinText);
      cutin.classList.remove('cutin');
      cutin.classList.remove('-ally-win');
      // console.log(characters.map(c => `${c.name}: ${c.hp}:${c.maxHP}`));

      // 敵キャラの削除
      setEnemyClearListener(characters, sharedSP, actionQueue);

      // アイテムドロップの処理
      // もし、item-drop-switchにチェックが入っていたら
      if (document.getElementById('item-drop-switch').checked) {
        // アイテムドロップの処理
        itemSelectionPhase();
      };
    }, {once: true});
    

    // 戦闘開始ボタンを有効化
    startBattleButton.disabled = false;
    startBattleButton.textContent = '戦闘開始';
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
  // console.log(`ターンの終了　${phase}フェーズ`);
  // if (turn === 0 && phase % 5 === 0 && phase > 0) {
    
  // }
}

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
  // = (c + (1 / (1 + exp(-a * (命中 - 回避)))) * (b - c)) * 100
  // aはスケーリングファクター。値が大きいほど命中率が急速に変化します。(0.1から1程度)
  // maxHitRateは上限の命中率を割合で示します（例：0.9は90%）
  // minHitRateは下限の命中率を割合で示します（例：0.4は40%）
  const a = 0.1;
  const maxHitRate = 0.99;
  const minHitRate = 0.35;
  // 回避と命中の差分は142で最大値になる

  const baseHitRate = 1 / (1 + Math.exp(-a * (accuracy - evasion)));
  const hitRate = (minHitRate + baseHitRate * (maxHitRate - minHitRate)) * 100;
  return hitRate;
}



// 通常攻撃関数
function attack(attacker, target) {
  let hitRate = calculateHitRate(attacker.accuracy, target.evasion);
  let hit = Math.random() * 100 < hitRate;
  // console.log(`${attacker.name}:${attacker.accuracy}→${target.name}:${target.evasion}　命中率：${hitRate}％`);
  applyAttackEffect(attacker, turnTime);
  setTimeout(() => {
    if (hit) {
      let damage = (attacker.attack / 2) - (target.defense / 4);
      damage = Math.floor(damage);
      if (damage < 1) {
        damage = 1;
      }
      target.hp -= damage;
      // log attack
      let logText = `${attacker.name}が${target.name}に${damage}のダメージを与えた！`;
      let logDiv = document.createElement('div');
      logDiv.classList.add(attacker.side);
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      applyDamageEffect(target, damage, turnTime);
      updateStatus(target);
    } else {
      // log miss
      let logText = `${attacker.name}は${target.name}への攻撃を外した！`;
      let logDiv = document.createElement('div');
      logDiv.classList.add(attacker.side);
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      applyMissEffect(target, turnTime)
    }
    checkDefeated(target);
  }, turnTime / 2);
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
    let effectResult = skill.effect(user, target, battleLogDiv); // 使用するスキルの効果を発揮

    // スキルの効果のログを出力
    if (effectResult > 0) {
      let effectLogText;
      let logText = `${user.name}が${target.name}に対して${skill.name}を使用！`;
      let logDiv = document.createElement('div');
      logDiv.classList.add(user.side);
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);

      setTimeout(() => {
        if (skill.type === 'damage') {
          effectLogText = `${user.name}の${skill.name}！${target.name}に${effectResult}のダメージを与えた！`;
          applyDamageEffect(target ,effectResult, turnTime);
        } else if (skill.type === 'healing') {
          effectLogText = `${user.name}の${skill.name}が${target.name}のHPを${effectResult}回復させた！`;
          applyRecoveryEffect(target, effectResult, turnTime);
        }
        let effectLogDiv = document.createElement('div');
        effectLogDiv.classList.add('effect');
        effectLogDiv.classList.add(user.side);
        effectLogDiv.textContent = effectLogText;
        battleLogDiv.insertBefore(effectLogDiv, battleLogDiv.firstChild);

        updateStatus(user);
        updateStatus(target);
        checkDefeated(target);
      }, turnTime / 2);
    }
    applyAttackEffect(user, turnTime);
  } else {
    // ログミス
    applyAttackEffect(user, turnTime);
    setTimeout(() => {
      let logText = `${user.name}は${target.name}への${skill.name}を外した！`;
      let logDiv = document.createElement('div');
      logDiv.classList.add(user.side);
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      applyMissEffect(target, turnTime);
    }, turnTime / 2);
  }
}

// パッシブスキル名での判定処理
function hasSnipeSkill(character) {
  // スキル名が「狙撃」のスキルを探す
  let snipeSkill = character.skills.find(skill => skill.name === '狙撃');
  return snipeSkill !== undefined;
}

// キャラクターの生死判定
function checkDefeated(character) {
  console.log(`${character.name}のHP：${character.hp}`);
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
    updateOrderDisplay(actionQueue);
  }
}

// status更新関数
function updateStatus(character) {
  let characterElement = document.querySelector(`.character[data-name="${character.name}"]`);

  // HPの更新
  let hpElement = characterElement.querySelector('.character .hp .hp');
  hpElement.textContent = character.hp;

  let hpIndicatorElement = characterElement.querySelector('.character-hp-indicator');
  hpIndicatorElement.value = character.hp;

  // 最大HPの更新
  let maxHpElement = characterElement.querySelector('.character .hp .max-hp');
  maxHpElement.textContent = character.maxHP;

  let maxHpIndicatorElement = characterElement.querySelector('.character-hp-indicator');
  maxHpIndicatorElement.max = character.maxHP;

  // 他のステータスの更新
  let statusElement = characterElement.querySelector('.status');

  let weapon = weaponData.find(w => w.id === character.weapon);

  statusElement.innerHTML = `
  <table>
    <tr><th>武器 :</th> <td>${weapon.name}</td></tr>
    <tr><th>攻撃力 :</th> <td>${character.attack}</td></tr>
    <tr><th>防御力 :</th> <td>${character.defense}</td></tr>
    <tr><th>命中率 :</th> <td>${character.accuracy}</td></tr>
    <tr><th>回避率 :</th> <td>${character.evasion}</td></tr>
    <tr><th>行動力 :</th> <td>${character.speed}</td></tr>
    <tr><th>スキル :</th> <td>${character.skills.map(skill => skill.name).join('<br>')}</td></tr>
  </table>
  `;
}
export { updateStatus };



// アイテム選択関数

function itemSelectionPhase() {
  let itemSelectionDiv = document.getElementById('itemSelection');
  itemSelectionDiv.classList.remove('-hide');
  // 子要素としてitemSelection__innerを追加
  let itemSelectionInner = document.createElement('div');
  itemSelectionInner.classList.add('item-selection__inner');
  itemSelectionDiv.appendChild(itemSelectionInner);
  // 子要素としてitemSelection__textを追加
  let itemSelectionText = document.createElement('h2');
  itemSelectionText.classList.add('item-selection__text');
  itemSelectionInner.appendChild(itemSelectionText);
  // itemSelection__textにテキストを追加
  itemSelectionText.textContent = '戦闘終了！獲得アイテムを選択してください';
  itemSelectionText.classList.add('item-selection__text');
  let itemSelectionBox = document.createElement('div');
  itemSelectionBox.classList.add('item-selection__box');
  itemSelectionInner.appendChild(itemSelectionBox);  

  characters.forEach((character, index) => {
    if (character.side === 'ally') { // 味方だけがアイテムを選択できるようにする
      let characterDiv = document.createElement('div');
      characterDiv.classList.add('item-selection__character');
      let characterMessage = document.createElement('h3');
      characterMessage.textContent = `${character.name}`;
      characterDiv.appendChild(characterMessage);

      let randomItems = pickRandomItems(3);
      randomItems.forEach((item) => {
        let itemButton = document.createElement('button');
        itemButton.textContent = item;
        
        let itemDescription = document.createElement('p');
        itemDescription.textContent = itemEffects[item].description;
        
        itemButton.onclick = () => {
          itemEffects[item].apply(character,battleLogDiv);
          characterDiv.remove();
          if (itemSelectionBox.children.length === 0) {
            // console.log('statusの更新...',characters);
            itemSelectionDiv.classList.add('-hide');
            itemSelectionDiv.innerHTML = '';
          }
        }
        characterDiv.appendChild(itemButton);
        characterDiv.appendChild(itemDescription);
      });
      itemSelectionBox.appendChild(characterDiv);
    }
  });
}



// ランダムにn個のアイテムを選択します
function pickRandomItems(n) {
  let itemKeys = Object.keys(itemEffects);
  let selectedItems = [];

  for (let i = 0; i < n; i++) {
    let itemIndex = Math.floor(Math.random() * itemKeys.length);
    selectedItems.push(itemKeys[itemIndex]);
    itemKeys.splice(itemIndex, 1);  // 選択したアイテムを候補から除く
  }

  return selectedItems;
}



// アイテム効果適用関数
function applyItemEffects(item, characterIndex) {
  let character = characters[characterIndex];
  let itemEffect = itemEffects[item];
  if (itemEffect && typeof itemEffect.apply === 'function') {
    itemEffect.apply(character);
    // console.log(`${character.name}: ${character.hp}`);  // HPのログ出力
  }
}
