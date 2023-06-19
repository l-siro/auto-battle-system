export function controlGUI() {

  // GUI表示切り替え
  const gui = document.querySelector('.gui');
  const commandButtons = document.querySelector('.command-buttons');
  commandButtons.addEventListener('mouseover', () => gui.classList.add('open'));
  gui.addEventListener('mouseleave', () => gui.classList.remove('open')); 



  // バトルログ表示切り替え
  document.querySelector('#battle-log').addEventListener('click', function () {
    this.classList.toggle('open');
  });

  // 背景更新処理
  document.addEventListener("DOMContentLoaded", function () {
    var imageUpload = document.getElementById("bg-upload");
    var backgroundImage = document.getElementById("background-image");

    imageUpload.addEventListener("change", function (e) {
      var file = e.target.files[0];
      var reader = new FileReader();

      reader.onload = function (e) {
        backgroundImage.style.transition = 'opacity 0.5s'; // 暗くなるのに0.5秒かけるように設定
        backgroundImage.style.opacity = 0; // 透明度を0に設定（暗くする）

        setTimeout(function() {
          backgroundImage.style.transition = 'opacity 4s'; // 明るくなるのに4秒かけるように設定
          backgroundImage.style.backgroundImage = "url(" + e.target.result + ")"; // 新しい画像を設定
          backgroundImage.style.opacity = 1; // 透明度を1に設定（明るくする）
        }, 500); // 500ms後（暗くなる遷移が完了した後）に実行
      };

      reader.readAsDataURL(file);
    });
  });
}



export function setRecoverHPListener(characters, createActionQueue, updateOrderDisplay, updateStatus) {
  // HPを全回復するボタン
  characters.forEach(c => {
    console.log('import:',c.name,c.hp);
    c.hp = c.maxHP;
    let characterDiv = document.querySelector(`.character[data-name="${c.name}"]`);
    characterDiv.classList.remove('defeated');

    // アクションキューを再作成する
    let actionQueue = createActionQueue(characters);
    updateOrderDisplay();
    updateStatus(c);
  });
}

export function setEnemyClearListener(characters, createActionQueue, updateOrderDisplay, updateSP, sharedSP) {
  // 敵のクリアボタン
  let enemySideFront = document.querySelector('.enemy-side .frontline');
  let enemySideBack = document.querySelector('.enemy-side .backline');
  while (enemySideFront.firstChild) {
    enemySideFront.removeChild(enemySideFront.firstChild);
  }
  while (enemySideBack.firstChild) {
    enemySideBack.removeChild(enemySideBack.firstChild);
  }
  console.log('characters:', characters);
  characters = characters.filter(c => c.side === 'ally');
  let actionQueue = createActionQueue(characters);
  updateOrderDisplay();
  // 敵のスキルポイントをリセット
  sharedSP.enemy = 0;
  updateSP('enemy');
}