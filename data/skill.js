import { attributes } from '../js/battle.js';

// スキル定義
export const skills = [
  {
    name: 'ヒール',
    id: 'healing',
    type: 'healing',
    spCost: 1,
    // スキルの効果
    effect: function (user, target) {
      let healingAmount = user.spirit * 2;
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
    effect: function (user, targets) {
      let totalHealing = 0;
      for (let target of targets) {
        let healingAmount = user.spirit;
        if (target.hp + healingAmount > target.maxHP) {
          healingAmount = target.maxHP - target.hp;
        }
        target.hp += healingAmount;
        totalHealing += healingAmount;
      }
      return totalHealing;
    },
    // スキル使用条件
    condition: function (user, targets) {
      return sharedSP[user.side] >= this.spCost && targets.some(target => target.hp < target.maxHP && target.side === user.side && target.hp > 0);
    }
  },
  {
    name: '火炎弾',
    id: 'FlameBullet',
    type: 'damage',
    attribute: 'fire',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['fire'] : 1;
      let damage = (user.intelligence * attributeValue) - (target.intelligence / 2);
      damage = Math.floor(damage);
      // console.log(attribute);
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      if (critical) {
        damage *= 4;
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
    name: '炎舞踏',
    id: 'BlazingDance',
    type: 'areaAttack',
    attribute: 'fire',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      // console.log("Targets:", target);
      let totalDamage = 0;

      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['fire'] : 1;
      let baseDamage = (user.intelligence * attributeValue) - (target.intelligence / 2);

      let damage = baseDamage / 4;
      damage = Math.floor(damage);

      if (critical) {
        damage *= 4;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      totalDamage += damage;

      return totalDamage;
    },
    condition: function (user, targets) {
      return sharedSP[user.side] >= this.spCost && targets.some(target => target.hp > 0 && target.side !== user.side);
    }
  },
  {
    name: '水刃斬り',
    id: 'AquaSlash',
    type: 'damage',
    attribute: 'water',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['water'] : 1;
      let damage = (user.intelligence * attributeValue) - (target.intelligence / 2);
      damage = Math.floor(damage);
      // console.log(attribute);
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      if (critical) {
        damage *= 4;
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
    name: '水涛嵐',
    id: 'TorrentialDeluge',
    type: 'areaAttack',
    attribute: 'water',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      // console.log("Targets:", target);
      let totalDamage = 0;

      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['water'] : 1;
      let baseDamage = (user.intelligence * attributeValue) - (target.intelligence / 2);

      let damage = baseDamage / 4;
      damage = Math.floor(damage);

      if (critical) {
        damage *= 4;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      totalDamage += damage;

      return totalDamage;
    },
    condition: function (user, targets) {
      return sharedSP[user.side] >= this.spCost && targets.some(target => target.hp > 0 && target.side !== user.side);
    }
  },
  {
    name: '雷拳',
    id: 'ThunderFist',
    type: 'damage',
    attribute: 'thunder',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['thunder'] : 1;
      let damage = (user.intelligence * attributeValue) - (target.intelligence / 2);
      damage = Math.floor(damage);
      // console.log(attribute);
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      if (critical) {
        damage *= 4;
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
    name: '雷鳴波',
    id: 'ThunderSurge',
    type: 'areaAttack',
    attribute: 'thunder',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      // console.log("Targets:", target);
      let totalDamage = 0;

      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['thunder'] : 1;
      let baseDamage = (user.intelligence * attributeValue) - (target.intelligence / 2);

      let damage = baseDamage / 4;
      damage = Math.floor(damage);

      if (critical) {
        damage *= 4;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      totalDamage += damage;

      return totalDamage;
    },
    condition: function (user, targets) {
      return sharedSP[user.side] >= this.spCost && targets.some(target => target.hp > 0 && target.side !== user.side);
    }
  },
  {
    name: '光矢撃',
    id: 'RadiantArrowStrike',
    type: 'damage',
    attribute: 'light',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['light'] : 1;
      let damage = (user.intelligence * attributeValue) - (target.intelligence / 2);
      damage = Math.floor(damage);
      // console.log(attribute);
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      if (critical) {
        damage *= 4;
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
    name: '光輪舞',
    id: 'HaloDance',
    type: 'areaAttack',
    attribute: 'light',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      // console.log("Targets:", target);
      let totalDamage = 0;

      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['light'] : 1;
      let baseDamage = (user.intelligence * attributeValue) - (target.intelligence / 2);

      let damage = baseDamage / 4;
      damage = Math.floor(damage);

      if (critical) {
        damage *= 4;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      totalDamage += damage;

      return totalDamage;
    },
    condition: function (user, targets) {
      return sharedSP[user.side] >= this.spCost && targets.some(target => target.hp > 0 && target.side !== user.side);
    }
  },
  {
    name: '闇牙斬り',
    id: 'ShadowFangSlash',
    type: 'damage',
    attribute: 'dark',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['dark'] : 1;
      let damage = (user.intelligence * attributeValue) - (target.intelligence / 2);
      damage = Math.floor(damage);
      // console.log(attribute);
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      if (critical) {
        damage *= 4;
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
    name: '闇影渦',
    id: 'ShadowVortex',
    type: 'areaAttack',
    attribute: 'dark',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      // console.log("Targets:", target);
      let totalDamage = 0;

      let attribute = attributes.find(a => a.name === target.attribute);
      let attributeValue = attribute ? attribute['dark'] : 1;
      let baseDamage = (user.intelligence * attributeValue) - (target.intelligence / 2);

      let damage = baseDamage / 4;
      damage = Math.floor(damage);

      if (critical) {
        damage *= 4;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      totalDamage += damage;

      return totalDamage;
    },
    condition: function (user, targets) {
      return sharedSP[user.side] >= this.spCost && targets.some(target => target.hp > 0 && target.side !== user.side);
    }
  },
  {
    name: '強攻撃',
    id: 'strong-attack',
    type: 'damage',
    spCost: 1,
    // スキルの効果
    effect: function (user, target, critical) {
      let baseDamage = (user.attack / 2) - (target.defense / 4);
      let damage = baseDamage  * 1.5;
      damage = Math.floor(damage);
      if (damage < 1) {
        damage = 1;
      }
      if (critical) {
        damage *= 4;
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
    effect: function (user, target, critical) {
      let baseDamage = (user.attack / 2) - (target.defense / 4);
      let damage = baseDamage * 3;
      damage = Math.floor(damage);
      // console.log('スキル発動前ダメージ値確認', damage);
      if (critical) {
        damage *= 4;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      // console.log('連撃', user.attack, '->', target.defense , baseDamage, damage);
      return damage;
    },
    condition: function (user, target) {
      // 通常攻撃と同じ条件
      return sharedSP[user.side] >= this.spCost && target.hp > 0 && target.side !== user.side;
    }
  },
  {
    name: '破裂波',
    id: 'burst-wave',
    type: 'areaAttack',
    spCost: 2,
    // スキルの効果
    effect: function (user, target, critical) {
      // console.log("Targets:", target);

      let totalDamage = 0;

      let baseDamage = (user.attack / 2) - (target.defense / 4);
      let damage = baseDamage / 4;
      damage = Math.floor(damage);

      if (critical) {
        damage *= 4;
      }
      if (target.hp - damage < 0) {
        damage = target.hp;
      }
      target.hp -= damage;
      totalDamage += damage;

      return totalDamage;
    },
    condition: function (user, targets) {
      return sharedSP[user.side] >= this.spCost && targets.some(target => target.hp > 0 && target.side !== user.side);
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