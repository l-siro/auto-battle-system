// items.js
import { updateStatus } from './battle.js';


export const itemEffects = {
  "力の加護": {
    description: "攻撃力が25%上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.attack;
      character.attack *= 1.25;
      character.attack = Math.floor(character.attack);
      // ログに出力
      let logText = `${character.name}の攻撃力...${old_status} > ${character.attack}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      updateStatus(character)
    }
  },
  "素早さの加護": {
    description: "素早さが25%上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.speed
      character.speed *= 1.25;
      character.speed = Math.floor(character.speed);
      console.log(character.speed);
      let logText = `${character.name}の素早さ...${old_status} > ${character.speed}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      updateStatus(character)
    }
  },
  "防御力の加護": {
    description: "防御力が25%上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.defense
      character.defense *= 1.25;
      character.defense = Math.floor(character.defense);
      console.log(character.defense);
      let logText = `${character.name}の防御力...${old_status} > ${character.defense}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      updateStatus(character)
    }
  },
  "体力の加護": {
    description: "最大HPが25%上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.maxHP
      character.maxHP *= 1.25;
      character.maxHP = Math.floor(character.maxHP);
      console.log(character.maxHP);
      let logText = `${character.name}の最大HP...${old_status} > ${character.maxHP}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      updateStatus(character)
    }
  },
  "命中の加護": {
    description: "命中率が25%上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.accuracy
      character.accuracy *= 1.25;
      character.accuracy = Math.floor(character.accuracy);
      console.log(character.accuracy);
      let logText = `${character.name}の命中力...${old_status} > ${character.accuracy}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      updateStatus(character)
    }
  },
  "回避の加護": {
    description: "回避率が25%上昇",
    apply: function(character,battleLogDiv) {
      let old_status = character.evasion
      character.evasion *= 1.25;
      character.evasion = Math.floor(character.evasion);
      console.log(character.evasion);
      let logText = `${character.name}の回避力...${old_status} > ${character.evasion}`;
      let logDiv = document.createElement('div');
      logDiv.textContent = logText;
      battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
      updateStatus(character)
    }
  }



  // "エリクサー": {
  //   description: "HPが全回復",
  //   apply: function(character,battleLogDiv) {
  //     let old_status = character.hp
  //     character.hp = character.maxHP;
  //     console.log(character.hp);
  //     let logText = `${character.name}のHP...${old_status} > ${character.hp}`;
  //     let logDiv = document.createElement('div');
  //     logDiv.textContent = logText;
  //     battleLogDiv.insertBefore(logDiv, battleLogDiv.firstChild);
  //     updateStatus(character)
  //   }
  // }
}