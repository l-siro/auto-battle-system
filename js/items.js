// items.js
export const itemEffects = {
  "力の加護": {
    description: "力が10上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.attack;
      character.attack += 10;
      // ログに出力
      let logText = `${character.name}の力...${old_status} ▶ ${character.attack}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    }
  },
  "素早さの加護": {
    description: "素早さが10上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.speed
      character.speed += 10;
      console.log(character.speed);
      let logText = `${character.name}の素早さ...${old_status} ▶ ${character.speed}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    }
  },
  "防御力の加護": {
    description: "防御力が1上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.defense
      character.defense += 10;
      console.log(character.defense);
      let logText = `${character.name}の防御力...${old_status} ▶ ${character.defense}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    }
  },
  "最大HPの加護": {
    description: "最大HPが10上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.maxHP
      character.maxHP += 10;
      console.log(character.maxHP);
      let logText = `${character.name}の最大HP...${old_status} ▶ ${character.maxHP}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    }
  },
  "ハイポーション": {
    description: "HPが10回復",
    apply: function(character,battleLogDiv) {
      let old_status = character.hp
      character.hp += 10;
      console.log(character.hp);
      let logText = `${character.name}のHP...${old_status} ▶ ${character.hp}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    }
  },
  "エリクサー": {
    description: "HPが全回復",
    apply: function(character,battleLogDiv) {
      let old_status = character.hp
      character.hp = character.maxHP;
      console.log(character.hp);
      let logText = `${character.name}のHP...${old_status} ▶ ${character.hp}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
    }
  }
}