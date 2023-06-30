
// スキル定義
export const skills = [
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
    name: 'エリアヒール',
    id: 'areaHealing',
    type: 'healing',
    spCost: 5,
    // スキルの効果
    effect: function (user, target) {
      let healingAmount = user.spirit;
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
    effect: function (user, target, battleLogDiv) {
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
      let baseDamage = (user.attack / 2) - (target.defense / 4);
      let damage = baseDamage  * 1.5;
      damage = Math.floor(damage);
      if (damage < 1) {
        damage = 1;
      }
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
      let baseDamage = (user.attack / 2) - (target.defense / 4);
      let damage = baseDamage * 3;
      damage = Math.floor(damage);
      // console.log('スキル発動前ダメージ値確認', damage);
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      console.log('連撃', user.attack, '->', target.defense , baseDamage, damage);

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
      console.log('狙撃スキル発動', character.name,'の命中率が',character.accuracy);
    },
    // 狙撃スキルの使用条件を定義
    condition: function (user, target) {
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
      console.log('鉄壁スキル発動', character.name,'の防御力が',character.defense);
    },
    // スキル使用条件
    condition: function (character) {
      return true;
    }
  }

];