
// エフェクト関数

// 通常攻撃エフェクト適用関数
export function applyAttackEffect(character) {
  // Display attack effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('attack');

  setTimeout(function () {
    characterDiv.classList.remove('attack');
  }, 500); // Remove the attack effect after 500ms
}

// 回避エフェクト適用関数
export function applyMissEffect(character) {
  // Display miss effect (this is just a very basic effect)
  let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
  characterDiv.classList.add('miss');

  setTimeout(function () {
    characterDiv.classList.remove('miss');
  }, 500); // Remove the miss effect after 500ms
}

// ダメージエフェクト適用関数
export function applyDamageEffect(character, damage) {
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
  }, 500); // Remove the damage effect after 500ms
}

// 回復エフェクト適用関数
export function applyRecoveryEffect(character, recoveryAmount) {
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
