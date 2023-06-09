
const battleSpeed = 100;
const halfSpeed = battleSpeed / 2;
let characters = [];
let characterId = 0;

document.getElementById('loadFile').addEventListener('change', function (e) {
  let file = e.target.files[0];
  if (!file) {
    return;
  }
  let reader = new FileReader();
  reader.onload = function (e) {
    let contents = e.target.result;
    let data = JSON.parse(contents);
    for (let character of data) {
      character.id = characterId++;
      characters.push(character);
    }
    updateCharacterStatus();
  };
  reader.readAsText(file);
});

document.getElementById('startButton').addEventListener('click', function () {
  updateCharacterStatus();
  startBattle();
});

function getActionOrder() {
  let actionOrder = [];
  // 最大速度を取得
  let maxSpeed = Math.max(...characters.map(c => c.speed));
  // 速度0から最大速度までループ
  for (let speed = maxSpeed; speed >= 0; speed--) {
    // 速度が同じキャラクターを取得
    let sameSpeedCharacters = characters.filter(c => c.speed === speed);
    // そのキャラクターをランダムに並べ替えて行動順序のリストに追加
    while (sameSpeedCharacters.length > 0) {
      let randomIndex = Math.floor(Math.random() * sameSpeedCharacters.length);
      actionOrder.push(sameSpeedCharacters[randomIndex]);
      sameSpeedCharacters.splice(randomIndex, 1);
    }
  }
  return actionOrder;
}


function updateCharacterStatus() {
  let characterStatus = document.getElementById("characterStatus");
  characterStatus.innerHTML = '';
  for (let character of characters) {
    let card = document.getElementById(`character-${character.id}`);

    // If the card doesn't exist, create a new one
    if (!card) {
      card = document.createElement("div");
      card.id = `character-${character.id}`;
      card.className = "character-card";

      let img = document.createElement("img");
      img.className = "character-img";
      card.appendChild(img);

      let name = document.createElement("p");
      name.className = "character-name";
      card.appendChild(name);

      let hp = document.createElement("p");
      card.appendChild(hp);

      let role = document.createElement("p");
      role.textContent = `Role: ${character.role}`;
      card.appendChild(role);

      // Create HP indicator
      let hpIndicator = document.createElement('progress');
      hpIndicator.className = 'character-hp-indicator';
      hpIndicator.max = character.maxHP;
      card.appendChild(hpIndicator);

      characterStatus.appendChild(card);
    }

    // Update the card's image, name, and HP
    card.className = character.hp > 0 ? "character-card" : "character-card defeat";
    let img = card.querySelector(".character-img");
    img.src = character.image ? character.image : `img/${character.role}.svg`;
    let name = card.querySelector(".character-name");
    name.textContent = character.name;
    let hp = card.querySelector("p:nth-child(3)");
    hp.textContent = `HP: ${character.hp}/${character.maxHP}`;
    let hpIndicator = card.querySelector(".character-hp-indicator");
    hpIndicator.value = character.hp;
  }
}




function attack(character, target, originalTarget) {
  // 攻撃エフェクトの関数
  function attackEffect() {
    setTimeout(() => {
      let characterCard = document.getElementById(`character-${character.id}`);
      if (characterCard) {
        characterCard.classList.add('shake');
        setTimeout(() => {
          characterCard.classList.remove('shake');
        }, halfSpeed);
      }
    }, 0);
  }
  // ダメージエフェクトの関数
  function damageEffect(damage) {
    setTimeout(() => {
      let targetCard = document.getElementById(`character-${target.id}`);
      if (targetCard) {
        console.log(target.id);
        targetCard.classList.add('hit');
        // ダメージ値を表示
        let damageText = document.createElement("p");
        damageText.textContent = Math.floor(damage);
        damageText.className = "damage";
        targetCard.appendChild(damageText);

        setTimeout(() => {
          targetCard.removeChild(damageText);
          targetCard.classList.remove('hit');
        }, battleSpeed);
      }
    }, 0);
  }
  // ミスエフェクトの関数
  function missEffect() {
    setTimeout(() => {
      let targetCard = document.getElementById(`character-${target.id}`);
      if (targetCard) {
        targetCard.classList.add('miss');
        // 回避表示
        let missText = document.createElement("p");
        missText.textContent = "回避";
        missText.className = "miss";
        targetCard.appendChild(missText);
        setTimeout(() => {
          targetCard.classList.remove('miss');
          targetCard.removeChild(missText);
        }, halfSpeed);
      }
    }, 0);
  }

  // タンクの防御行動をチェック
  if (target.role !== 'tank') {
    let tank = characters.find(c => c.team !== character.team && c.role === 'tank' && c.hp > 0);
    if (tank && Math.random() < 0.5) {
      target = tank;
      addLog(`${tank.name}が${originalTarget.name}を守った！`, "tank_" + tank.team);
    }
  }
  attackEffect()
  setTimeout(() => {
    if (Math.random() < character.accuracy - target.evasion) {
      let damage = Math.max(0, Math.floor(character.attack - target.defense + character.attack * (Math.random() * 0.2 - 0.1)));
      if (Math.random() < character.accuracy / 10) {
        damage *= 2;
        damageEffect(damage);
        addLog(`${character.name} ▶ ${target.name}  ${Math.floor(damage)}ダメージ（クリティカル）！`, "attack_" + character.team);
      } else {
        damageEffect(damage);
        addLog(`${character.name} ▶ ${target.name}  ${Math.floor(damage)}ダメージ！`, "attack_" + character.team);
      }
      target.hp -= damage;
      if (target.hp <= 0) {
        target.hp = 0;
        addLog(`${target.name} が倒れた！`, "defeat_" + target.team);
        // 倒れたキャラクターのDOM要素に'defeat'クラスを追加
        let targetCard = document.getElementById(`character-${target.id}`);
        if (targetCard) {
          targetCard.classList.add('defeat');
        }
      }
      // Update HP indicator
      updateHpIndicator(target);
    } else {
      missEffect();
      addLog(`${character.name} の攻撃が ${target.name} にミス！`, "miss_" + character.team);
    }
  }, halfSpeed);



}


function startBattle() {
  let turn = 0;

  // 行動順序のリストを生成
  let actionOrder = getActionOrder();

  function nextTurn() {
    if (characters.filter(c => c.team === 'A' && c.hp > 0).length > 0 &&
      characters.filter(c => c.team === 'B' && c.hp > 0).length > 0) {

      // 行動順序のリストに従ってキャラクターが行動
      let character = actionOrder[turn % actionOrder.length];

      if (character.hp <= 0) {
        // HPが0以下のキャラクターは行動しない
        turn++;
        setTimeout(nextTurn, 0);
        return;
      }

      // ヒーラーの回復行動
      if (character.role === 'healer') {
        let allies = characters.filter(c => c.team === character.team && c.hp > 0 && c.hp < c.maxHP); // 死亡キャラクターを除外
        if (allies.length > 0 && Math.random() < 0.5) {
          let ally = allies[Math.floor(Math.random() * allies.length)];
          let heal = character.attack;
          ally.hp = Math.min(ally.hp + heal, ally.maxHP);
          healEffect(character, ally);
          healValueEffect(ally, heal);
          addLog(`${character.name} → ${ally.name}  ${Math.floor(heal)}HP回復！`, "heal_" + character.team);
          turn++;
          // Update HP indicator
          updateHpIndicator(ally);
          setTimeout(nextTurn, battleSpeed);
          return;
        }
      }

      let targets = characters.filter(c => c.team !== character.team && c.hp > 0);
      if (targets.length > 0) {
        // ターゲットがいる場合ランダムで選択（7割の確率でタンクを選択）
        let originalTarget = targets[Math.floor(Math.random() * targets.length)];
        // タンクキャラクターが存在し、HPが0より大きい場合に限り、タンクキャラクターを選択する
        let tank = targets.find(c => c.role === 'tank' && c.hp > 0);
        if (tank && Math.random() < 0.7) {
          originalTarget = tank;
        }
        let target = originalTarget;
        attack(character, target, originalTarget);
      }
      turn++;
      // 行動が終わったらステータスを更新
      updateCharacterStatus();
      setTimeout(nextTurn, battleSpeed);
    } else {
      // 勝敗が決まった場合
      if (characters.filter(c => c.team === 'A' && c.hp > 0).length > 0) {
        addLog("チームAが勝利した！", "result");
      } else {
        addLog("チームBが勝利した！", "result");
      }
      // JSON形式でステータスをダウンロード
      splitTeamsAndDownload(characters);
      battleInProgress = false;
      updateCharacterStatus(); // 戦闘が終わったらステータスを更新
    }
  }
  // 全キャラクターの'defeat'クラスをリセット
  for (let character of characters) {
    let characterCard = document.getElementById(`character-${character.id}`);
    if (characterCard) {
      characterCard.classList.remove('defeat');
    }
  }
  function updateHpIndicator(character) {
    let hpIndicator = document.querySelector(`#character-${character.id} .character-hp-indicator`);
    if (hpIndicator) {
      hpIndicator.value = character.hp;
    }
  }
  nextTurn();
}

// ヒールエフェクトの関数
function healEffect(healer, target) {
  setTimeout(() => {
    let healerCard = document.getElementById(`character-${healer.id}`);
    let targetCard = document.getElementById(`character-${target.id}`);
    if (healerCard && targetCard) {
      healerCard.classList.add('heal');
      targetCard.classList.add('healed');
      setTimeout(() => {
        healerCard.classList.remove('heal');
        targetCard.classList.remove('healed');
      }, halfSpeed);
    }
  }, 0);
}

// ヒール値エフェクトの関数
function healValueEffect(target, heal) {
  setTimeout(() => {
    let targetCard = document.getElementById(`character-${target.id}`);
    if (targetCard) {
      // ヒール値を表示
      let healText = document.createElement("p");
      healText.textContent = "+" + Math.floor(heal);
      healText.className = "heal";
      targetCard.appendChild(healText);

      setTimeout(() => {
        targetCard.removeChild(healText);
      }, battleSpeed);
    }
  }, 0);
}
function updateHpIndicator(character) {
  // HPインジケーターを更新
  let card = document.getElementById(`character-${character.id}`);
  if (card) {
    let hpIndicator = card.querySelector(".character-hp-indicator");
    if (hpIndicator) {
      hpIndicator.value = character.hp;
    }
  }
}
// ログを追加する関数
function addLog(text, className) {
  let log = document.getElementById("log");
  let div = document.createElement("div");
  div.textContent = text;
  div.className = className;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// チームごとにステータスをダウンロード
function downloadTeamStatusAsJson(teamCharacters, teamName) {
  // 現在の日時を取得
  let now = new Date();
  // フォーマットを "YYYYMMDD_HHMMSS" に変換
  let dateTimeStr = now.getFullYear() +
    ("0" + (now.getMonth() + 1)).slice(-2) +
    ("0" + now.getDate()).slice(-2) + "_" +
    ("0" + now.getHours()).slice(-2) +
    ("0" + now.getMinutes()).slice(-2) +
    ("0" + now.getSeconds()).slice(-2);

  // JSON.stringifyの第3引数に2を指定して整形
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(teamCharacters, null, 2));
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  // ファイル名に日時を追加
  downloadAnchorNode.setAttribute("download", teamName + "_status_" + dateTimeStr + ".json");
  document.body.appendChild(downloadAnchorNode); // Firefoxで必要
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}



// チームを分割してダウンロード
function splitTeamsAndDownload(characters) {
  let teamA = characters.filter(c => c.team === 'A');
  // let teamB = characters.filter(c => c.team === 'B');

  downloadTeamStatusAsJson(teamA, "TeamA");
  // downloadTeamStatusAsJson(teamB, "TeamB");
}


