import { controlGUI, setEnemyClearListener, setRecoverHPListener, createContextMenu } from './gui.js'; controlGUI(); // GUIを制御する関数を読み込む
import { itemEffects } from '../data/items.js'; // アイテム効果定義を読み込む
import { skills } from '../data/skill.js'; // スキル定義を読み込む
import { applyAttackEffect, applyMissEffect, applyDamageEffect, applyRecoveryEffect } from './displayEffect.js'; // エフェクト定義を読み込む
// import { characterImgUplod } from './characterImgUplod.js'; // キャラクター画像アップロード定義を読み込む

window.globalFunction = function() {
  return createContextMenu();
}; // グローバル関数を定義する
const battleField = document.getElementById('battle-field'); 

// 回復ボタン
const recoverButtonConfigurations = [
  { id: 'hp-recover-button', efficacy: 'full', isIndividual: false },
  { id: 'hp-half-recover-button', efficacy: 'half', isIndividual: false },
  { id: 'hp-quarter-recover-button', efficacy: 'quarter', isIndividual: false },
  { id: 'select-hp-recover-button', efficacy: 'full', isIndividual: true },
  { id: 'select-hp-half-recover-button', efficacy: 'half', isIndividual: true },
  { id: 'select-hp-quarter-recover-button', efficacy: 'quarter', isIndividual: true }
];

recoverButtonConfigurations.forEach(config => {
  const button = document.getElementById(config.id);
  button.addEventListener('click', () => {
      const efficacy = config.efficacy;
      const targetCharacter = config.isIndividual ? window.getClickedCharacter() : 'all';
      setRecoverHPListener(characters, efficacy, targetCharacter);
  });
});

// 敵削除ボタン
const enemyClearButton = document.getElementById('enemy-clear-button');
enemyClearButton.addEventListener('click', function () {
  setEnemyClearListener(characters, sharedSP, actionQueue);
});

// セーブボタン
const saveButton = document.getElementById('save-button');
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
let weaponData = [];
let attributes = [];

// ボタン
let startBattleButton = document.getElementById('start-battle');

// 共有SPを定義
let sharedSP = { ally: 0, enemy: 0 };


// 戦闘力の変数設定
let enemyPower
let allyPower

let allyWinRate
let powerDifference



// 勝率表示ボタン
const winRateButton = document.getElementById('win-rate-button');
winRateButton.addEventListener('click', function () {
  const messages = [
    { threshold: 80, text: "敵は弱そうだ！" },
    { threshold: 60, text: "敵は強そうだ！" },
    { threshold: 40, text: "敵はかなり強そうだ！" },
    { threshold: 20, text: "敵は圧倒的に強そうだ！" },
    { threshold: 0,  text: "敵は最強のようだ！" }
  ];
  let message = messages.find(m => allyWinRate > m.threshold).text;  
  let newParagraph = `
    <p>${message}</p>
    <table>
      <tr><th>味方の戦力</th><th>敵の戦力</th><th>戦力差</th></tr>
      <tr><td>${allyPower}</td><td>${enemyPower}</td><td>${powerDifference}</td></tr>
    </table>`;
  logBattleResult(newParagraph, 'table');
});


// ポーズボタン
let isPaused = false;
const strategyPause = document.getElementById('strategy-pause');

strategyPause.addEventListener('click', function () {
  if (strategyPause.classList.contains('paused')) {
    // ポーズ中の場合は再開
    battleField.classList.remove('-paused');
    strategyPause.classList.remove('paused');
    strategyPause.textContent = '作戦タイム';
    isPaused = false;
    // カットインを表示
    displayCutin('戦闘再開！');
    takeTurn();
  } else {
    // ポーズ中でない場合はポーズ
    battleField.classList.add('-paused');
    strategyPause.classList.add('paused');
    strategyPause.textContent = '戦闘再開';
    isPaused = true;
  }
});



// ターン時間を設定
let turnTime = 1000;


// 戦闘速度変更ボタン
let speedControl1x = document.getElementById('speed-control-1x');
let speedControl2x = document.getElementById('speed-control-2x');

speedControl1x.addEventListener('click', function () {
  speedControl1x.classList.add('selected');
  speedControl2x.classList.remove('selected');
  turnTime = 1000;
});

speedControl2x.addEventListener('click', function () {
  speedControl1x.classList.remove('selected');
  speedControl2x.classList.add('selected');
  turnTime = 400;
});


// ログを出力する関数
function logBattleResult(message, cssClass) {
  const battleLogDiv = document.getElementById('battle-log');
  const logDiv = document.createElement('div');
  // cssClassが配列の場合
  if (Array.isArray(cssClass)) {
    logDiv.classList.add(...cssClass);
  } else {
    logDiv.classList.add(cssClass);
  }
  logDiv.innerHTML = message;
  battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
}
export { logBattleResult };

// カットインを表示する関数
function displayCutin(message, additionalClasses = []) {
  const cutin = document.getElementById('cutin');
  const cutinText = document.createElement('div');
  cutinText.textContent = message;
  cutin.classList.add('cutin', ...additionalClasses);
  cutinText.classList.add('cutin__text');
  cutin.appendChild(cutinText);

  cutinText.addEventListener('animationend', () => {
    cutin.removeChild(cutinText);
    cutin.classList.remove('cutin', ...additionalClasses);
  }, { once: true });
}
export { displayCutin };

// 行動順を表示する要素
const orderOfActionDiv = document.getElementById('order-of-action');


// 武器データを読み込む
fetch('./data/weapons.json').then(response => response.json()).then(data => {weaponData = data;}).catch(error => console.error(error));

// 特性データ(attributes.json)を読み込む
fetch('./data/attributes.json').then(response => response.json()).then(data => {attributes = data;}).catch(error => console.error(error));
export { attributes };



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
  character.defense = 10; // 防御力
  character.accuracy = character.dexterity; // 命中
  character.evasion = character.agility; // 回避
  character.speed = (character.agility + character.dexterity) / 2; // 行動速度

  character.attackAttribute = weapon.attribute

  // character.isCore = character.isCore; // コアキャラかどうか
  
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

  // キャラクターのステータスをすべて整数にする
  character.maxHP = Math.floor(character.maxHP);
  character.hp = Math.floor(character.hp);
  character.attack = Math.floor(character.attack);
  character.defense = Math.floor(character.defense);
  character.accuracy = Math.floor(character.accuracy);
  character.evasion = Math.floor(character.evasion);
  character.speed = Math.floor(character.speed);
  
  
  
  character.skills.filter(skill => skill.type === 'passive').forEach(skill => skill.effect(character));


  // 味方character全員の戦闘力を計算
  allyPower = characters.filter(c => c.side === 'ally').reduce((sum, c) => sum + c.attack + c.defense + c.speed, 0);
  // 敵character全員の戦闘力を計算
  enemyPower = characters.filter(c => c.side === 'enemy').reduce((sum, c) => sum + c.attack + c.defense + c.speed, 0);
  
  if (allyPower && enemyPower) {

    // パワーから戦力差を計算
    allyWinRate = allyPower / (allyPower + enemyPower);
    allyWinRate = Math.floor(allyWinRate * 100);

    powerDifference = Math.abs(allyPower - enemyPower);
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
    
    sideElement.addEventListener('drop', e => {
      if (!e.dataTransfer.files.length) {
        console.log('ドロップされたのは画像ではありません');
        e.preventDefault();

        const charName = e.dataTransfer.getData('text/plain');
        const character = characters.find(c => c.name === charName);
        character.side = side === 'ally-side' ? 'ally' : 'enemy';

        const positionDiv = e.target.closest('.frontline, .backline');
        const charDiv = document.querySelector(`.character[data-name="${charName}"]`);
        positionDiv.appendChild(charDiv.parentElement.removeChild(charDiv));

        charDiv.className = `character ${character.side}`;
        character.position = positionDiv.classList.contains('backline') ? 'backline' : 'frontline';

        actionQueue = createActionQueue(characters);

        updateStatus(character);
        updateOrderDisplay(actionQueue);
      }
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
  characterImageDiv.style.backgroundImage = `url(${character.img})`;
  boxDiv.appendChild(characterImageDiv);
  
  // キャラクター画像をアップロード
  // characterImgUplod(characterImageDiv, characters);

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

  // append the box div to the character div
  characterDiv.appendChild(boxDiv);

  // create div for character status
  const characterStatusDiv = document.createElement('div');
  characterStatusDiv.classList.add('status');
  characterDiv.appendChild(characterStatusDiv);
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
  let actionQueue = [];
  let actionPoints = characters.map(character => 0);
  const actionThreshold = 1000; // しきい値として任意の高い値

  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < characters.length; j++) {
      actionPoints[j] += characters[j].speed;

      if (actionPoints[j] >= actionThreshold) {
        if (characters[j].hp > 0) {
          actionQueue.push(characters[j]);
        }

        // アクションポイントからしきい値を引く
        actionPoints[j] -= actionThreshold;
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
  
  // DocumentFragmentを使用してパフォーマンスを向上させる
  let fragment = document.createDocumentFragment();
  let limit = characters.length + 6;
  for (let j = 0; j < limit; j++) {
    let i = (turn + j) % actionQueue.length;
    let character = actionQueue[i];


    // HPが0以下のキャラクターは表示しない    
    if (character.hp <= 0) {
      continue;
    }
    let orderElement = document.createElement('div');

    if (character.side === 'ally') {
      orderElement.classList.add('ally');
    }
    if (character.side === 'enemy') {
      orderElement.classList.add('enemy');
    }

    orderElement.classList.add('order');
    orderElement.dataset.name = character.name;
    orderElement.style.backgroundImage = `url(${character.img})`;
    orderElement.innerHTML = `<span class="speed">${character.speed}</span>`;
    fragment.appendChild(orderElement);
  }
  // 一度にすべての要素を追加
  orderOfActionDiv.appendChild(fragment);
}
export { updateOrderDisplay };




// JSONファイルの読み込み

document.getElementById('upload').addEventListener('change', function (e) {
  let file = e.target.files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    const worker = new Worker('js/worker.js');
    worker.onmessage = function(event) {
      // charactersにJSONファイルの内容をマージ
      characters = characters.concat(event.data);

      // 差分キャラクターを作成
      let newCharacters = event.data; // 既に解析されたデータを使う
      
      // ここで DocumentFragment を使って一度にDOMに追加するなどの最適化を行う
      newCharacters.forEach(createCharacter);

      // turnを0にリセット
      turn = 0;
      
      // アクション・キューの作成とオーダー表示の更新
      actionQueue = createActionQueue(characters);
      updateOrderDisplay(actionQueue);

      // 追加されたキャラクターのDOMをコンソールログに表示
      createContextMenu(characters);
    };
    worker.postMessage(e.target.result);
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
  // もし10を超えていなかったら
  if (sharedSP[side] + amount <= 10) {
    sharedSP[side] += amount;
  }
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
  
  // turnを0にリセット
  turn = 0;
  
  // #cutinに戦闘開始カットインを表示、アニメーションさせて消す
  let cutin = document.getElementById('cutin');
  let cutinText = document.createElement('div');
  cutinText.textContent = '戦闘開始';
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
  const activeCharacter = actionQueue[turn];
  
  // ターンを確認
  // console.log(turn);
  // console.log(actionQueue);
  // console.log(actionQueue.length - turn);
  // console.log(activeCharacter.name);
  // console.log('---------------------------------');
  
  // もしactiveCharacterが死んでいたら、次のキャラクターにターンを渡す
  if (!activeCharacter || activeCharacter.hp <= 0) {
    return processTurnEnd(orderOfActionDiv.getElementsByClassName('order')[turn]);
  }
  
  const activeOrderElement = orderOfActionDiv.getElementsByClassName('order')[turn];
  const enemies = characters.filter(c => c.side !== activeCharacter.side && c.hp > 0);
  const allies = characters.filter(c => c.side === activeCharacter.side && c.hp > 0);
  
  let action, target;

  const affordableActions = activeCharacter.skills.filter(a => {
    return a.spCost <= sharedSP[activeCharacter.side] && ((a.type === 'healing' && allies.some(ally => ally.hp < ally.maxHP)) || enemies.length > 0);
  });

  if (affordableActions.length > 0) {
    // SPが足りるアクションの中からランダムに選択
    action = affordableActions[Math.floor(Math.random() * affordableActions.length)];

    if (action.type === 'healing') {
      // HPが最大ではない味方を探す
      const healableAllies = allies.filter(ally => ally.hp < ally.maxHP);

      if (healableAllies.length > 0) {
        target = healableAllies.reduce((a, b) => a.hp < b.hp ? a : b);
        useSP(action.spCost, activeCharacter.side);
      } else {
        action = { name: '通常攻撃', type: 'damage' };
        target = selectTarget(activeCharacter, enemies, action);
      }

    } else if (action.type === 'areaAttack') {
      // 範囲攻撃の場合、全ての敵を対象にする
      target = characters.filter(c => c.side !== activeCharacter.side && c.hp > 0);
      useSP(action.spCost, activeCharacter.side);

    } else {
      // それ以外の場合、ランダムに敵を選択
      target = selectTarget(activeCharacter, enemies);
      useSP(action.spCost, activeCharacter.side);
    }
  } else {
    action = { name: '通常攻撃', type: 'damage' };
    target = selectTarget(activeCharacter, enemies);
  }

  if (target) {
    if (action.name === '通常攻撃') {
      attack(activeCharacter, target);
    } else {
      if (action.type === 'areaAttack') {
        target.forEach(t => useSkill(activeCharacter, t, action));
      } else {
        useSkill(activeCharacter, target, action);
      };
    }
  }
  
  updateOrderDisplay(actionQueue);

  if (activeOrderElement) {
    setTimeout(() => activeOrderElement.classList.remove('active'), turnTime);
    activeOrderElement.classList.add('active');
  }

  setTimeout(() => processTurnEnd(activeOrderElement), turnTime);
}



// ターン終了時の処理
function processTurnEnd(activeOrderElement) {

  //#hpQuarterPauseにチェックが入っていたら、HPが4分の1以下のキャラクターが居たらポーズ
  if (hpQuarterPause.checked) {
    if (characters.some(c => c.side === 'ally' && c.hp > 0 && c.hp <= c.maxHP / 4)) {
      strategyPause.classList.add('paused');
      strategyPause.textContent = '戦闘再開';
      battleField.classList.add('-paused');
      isPaused = true;
    }
  }
  //#hpQuarterPauseにチェックが入っていたら、HPが4分の1以下のキャラクターが居たらポーズ
  if (hpHalfPause.checked) {
    if (characters.some(c => c.side === 'ally' && c.hp > 0 && c.hp <= c.maxHP / 2)) {
      strategyPause.classList.add('paused');
      strategyPause.textContent = '戦闘再開';
      battleField.classList.add('-paused');
      isPaused = true;
    }
  }
  
  // もしally側で死んでいないキャラクターでHPが4分の1以下のキャラクターが居たら、ポーズ
  // if (characters.some(c => c.side === 'ally' && c.hp > 0 && c.hp <= c.maxHP / 4)) {
  //   strategyPause.classList.add('paused');
  //   strategyPause.textContent = '戦闘再開';
  //   isPaused = true;
  // }

  // ポーズ中だった場合、処理を停止
  if (isPaused) {
    displayCutin('作戦タイム');
    return;
  }


  turn++;
  if (turn >= actionQueue.length) {
    turn = 0;
    phase++;
  }

  const allies = characters.filter(c => c.side === 'ally' && c.hp > 0);
  const enemies = characters.filter(c => c.side === 'enemy' && c.hp > 0);

  // 勝利チームの判定
  if (allies.every(c => !c.isCore)) {
    logBattleResult('敗北...', 'enemy-win');
    displayCutin('敗北...', ['-enemy-win']);
    startBattleButton.removeAttribute('inert');
    startBattleButton.textContent = '戦闘開始';
    return;
  } else if (enemies.every(c => !c.isCore)) {
    logBattleResult('勝利！', 'ally-win');
    displayCutin('勝利！', ['-ally-win']);

    // アニメーション終了後の処理
    const cutinText = document.querySelector('.cutin__text');
    cutinText.addEventListener('animationend', () => {
      // 敵キャラの削除
      setEnemyClearListener(characters, sharedSP, actionQueue);

      // アイテムドロップの処理
      if (document.getElementById('item-drop-switch').checked) {
        itemSelectionPhase();
      }
    }, { once: true });

    startBattleButton.disabled = false;
    startBattleButton.textContent = '戦闘開始';
    return;
  }

  // 次のキャラクターが倒されたかどうかを判断する
  const nextCharacter = actionQueue[turn];
  if (nextCharacter && nextCharacter.hp <= 0) {
    setTimeout(takeTurn, 0);
    return;
  }

  setTimeout(takeTurn, turnTime);
}


// 攻撃対象を選択する関数
function selectTarget(activeCharacter, enemies) {
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
  const hit = Math.random() * 100 < calculateHitRate(attacker.accuracy, target.evasion);
  const critical = Math.random() * 100 < calculateHitRate(attacker.accuracy, target.evasion) / 10;
  applyAttackEffect(attacker, turnTime);
  recoverSP(1, attacker.side);
  setTimeout(() => {
    if (hit) {
      let damage = calculateDamage(attacker, target, critical);
      target.hp = Math.max(0, target.hp - damage);
      let cls = [attacker.side,'damage'] 
      logBattleResult(`${attacker.name}が${target.name}に<span class="num">${damage}</span>のダメージを与えた！`, cls);

      applyDamageEffect(target, damage, turnTime, critical, attacker.attackAttribute);
      updateStatus(target);
    } else {
      logBattleResult(`${attacker.name}は${target.name}への攻撃を外した！`, attacker.side);
      applyMissEffect(target, turnTime);
    }

    checkDefeated(target);
  }, turnTime / 2);
}

function calculateDamage(attacker, target, critical) {
  let damage = attacker.attack - (target.defense / 2);

  // characterのattributeによるダメージ補正
  let attribute = attributes.find(a => a.name === target.attribute);
  let attributeValue = attribute ? attribute[attacker.attackAttribute] : 1;
  
  damage = (attacker.attack * attributeValue) - (target.defense / 2);

  if (critical) {
    damage *= 4;
    logBattleResult(`${attacker.name}の攻撃がクリティカルヒット！`, attacker.side);
  }

  return Math.max(1, Math.min(Math.floor(damage), target.hp));
}


// スキル使用関数
function useSkill(user, target, action) {
  const skill = skills.find(skill => skill.id === action.id);
  const hitRate = skill.type === 'healing' ? 100 : calculateHitRate(user.accuracy, target.evasion);
  const hit = Math.random() * 100 < hitRate;
  const critical = hit && skill.type !== 'healing' && Math.random() * 100 < hitRate / 10;
  console.log(hitRate, hit, critical);

  applyAttackEffect(user, turnTime);

  setTimeout(() => {
    if (hit) {
      const effectResult = skill.effect(user, target, critical);
      if (skill.type !== 'areaAttack') {
        logBattleResult(`${user.name}が${target.name}に対して${skill.name}を使用！`, user.side);
      }

      if (effectResult > 0) {
        const effectLogText = generateEffectLogText(skill, user, target, effectResult, critical);

        let cls = [user.side, skill.type] 
        logBattleResult(effectLogText, cls);

        if (skill.type === 'damage' || skill.type === 'areaAttack') {
          let damageType;
          if(skill.attribute) {
            damageType = skill.attribute;
          } else {
            damageType = user.attackAttribute;
          }
          applyDamageEffect(target, effectResult, turnTime, critical, damageType);
        } else if (skill.type === 'healing') {
          applyRecoveryEffect(target, effectResult, turnTime, critical);
        }

        updateStatus(user);
        updateStatus(target);
        checkDefeated(target);
      }
    } else {
      logBattleResult(`${user.name}は${target.name}への${skill.name}を外した！`, user.side);
      applyMissEffect(target, turnTime);
    }
  }, turnTime / 2);
}

function generateEffectLogText(skill, user, target, effectResult, critical) {
  if (skill.type === 'damage') {
    const critText = critical ? `クリティカルヒット！` : '';
    return `${user.name}の${skill.name}！${target.name}に${critText}<span class="num">${effectResult}</span>のダメージを与えた！`;
  } else if (skill.type === 'areaAttack') {
    const critText = critical ? `クリティカルヒット！` : '';
    return `${user.name}の${skill.name}！${target.name}に${critText}<span class="num">${effectResult}</span>のダメージを与えた！`;
  } else if (skill.type === 'healing') {
    return `${user.name}の${skill.name}が${target.name}のHPを<span class="num">${effectResult}</span>回復させた！`;
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
  if (character.hp <= 0) {
    character.hp = 0;

    // アクションキューからキャラクターを削除する
    const index = actionQueue.findIndex(c => c.name === character.name);
    if (index !== -1) {
      actionQueue.splice(index, 1);
    }

    // キャラクターのorder要素を削除します。
    const orderElement = orderOfActionDiv.querySelector(`.order[data-name="${character.name}"]`);
    orderElement && orderElement.remove();

    // キャラクターのdivに.defeatを追加
    const characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
    characterDiv && characterDiv.classList.add('defeated');

    logBattleResult(`${character.name}が倒れた！`, character.side);

    // オーダー表示を更新する
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
          itemEffects[item].apply(character);
          characterDiv.remove();
          if (itemSelectionBox.children.length === 0) {
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

