import { logBattleResult } from '../js/battle.js';
import { updateStatus } from '../js/battle.js';
// items.js


export const itemEffects = {
  "力の加護": {
    description: "攻撃力が25%上昇",
    apply: function(character) {
      let old_status = character.attack;
      character.attack *= 1.25;
      character.attack = Math.floor(character.attack);

      logBattleResult(`${character.name}の攻撃力...${old_status} > ${character.attack}`, character.side);
      updateStatus(character);
    }
  },
  "素早さの加護": {
    description: "素早さが25%上昇",
    apply: function(character) {
      let old_status = character.speed
      character.speed *= 1.25;
      character.speed = Math.floor(character.speed);

      logBattleResult(`${character.name}の素早さ...${old_status} > ${character.speed}`, character.side);
      updateStatus(character)
    }
  },
  "防御力の加護": {
    description: "防御力が25%上昇",
    apply: function(character) {
      let old_status = character.defense
      character.defense *= 1.25;
      character.defense = Math.floor(character.defense);

      logBattleResult(`${character.name}の防御力...${old_status} > ${character.defense}`, character.side);
      updateStatus(character)
    }
  },
  "体力の加護": {
    description: "最大HPが25%上昇",
    apply: function(character) {
      let old_status = character.maxHP
      character.maxHP *= 1.25;
      character.maxHP = Math.floor(character.maxHP);

      logBattleResult(`${character.name}の最大HP...${old_status} > ${character.maxHP}`, character.side);
      updateStatus(character)
    }
  },
  "命中の加護": {
    description: "命中率が25%上昇",
    apply: function(character) {
      let old_status = character.accuracy
      character.accuracy *= 1.25;
      character.accuracy = Math.floor(character.accuracy);

      logBattleResult(`${character.name}の命中力...${old_status} > ${character.accuracy}`, character.side);
      updateStatus(character)
    }
  },
  "回避の加護": {
    description: "回避率が25%上昇",
    apply: function(character) {
      let old_status = character.evasion
      character.evasion *= 1.25;
      character.evasion = Math.floor(character.evasion);

      logBattleResult(`${character.name}の回避力...${old_status} > ${character.evasion}`, character.side);
      updateStatus(character)
    }
  },



  "エリクサー": {
    description: "HPが全回復",
    apply: function(character) {
      let old_status = character.hp
      character.hp = character.maxHP;

      logBattleResult(`${character.name}のHP...${old_status} > ${character.hp}`, character.side);
      updateStatus(character)
    }
  }
}