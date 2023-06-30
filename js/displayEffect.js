
// エフェクト関数

// 通常攻撃エフェクト適用関数
export function applyAttackEffect(character, turnTime) {
  // Display attack effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('attack');

  setTimeout(function () {
    characterDiv.classList.remove('attack');
  }, turnTime / 2); // Remove the attack effect after turnTime / 2ms
}

// 回避エフェクト適用関数
export function applyMissEffect(character, turnTime) {
  // Display miss effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('miss');

  setTimeout(function () {
    characterDiv.classList.remove('miss');
  }, turnTime / 2); // Remove the miss effect after turnTime / 2ms
}

// ダメージエフェクト適用関数
export function applyDamageEffect(character, damage, turnTime) {
  // Display damage effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('damage');
  // ダメージ数値表記を追加
  let damageDiv = document.createElement('div');
  damageDiv.classList.add('damage-text');
  damageDiv.textContent = damage;
  characterDiv.appendChild(damageDiv);

  setTimeout(function () {
    characterDiv.classList.remove('damage');
    characterDiv.removeChild(damageDiv);
  }, turnTime / 2); // Remove the damage effect after turnTime / 2ms
}

// 回復エフェクト適用関数
export function applyRecoveryEffect(character, recoveryAmount, turnTime) {
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
  }, turnTime / 2); // Remove the recovery effect after turnTime / 2ms
}
