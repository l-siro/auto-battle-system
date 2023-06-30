import { updateStatus } from "./battle.js";
import { createActionQueue } from "./battle.js";
import { updateOrderDisplay } from "./battle.js";
import { updateSP } from "./battle.js";

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
    let imageUpload = document.getElementById("bg-upload");
    let backgroundImage = document.getElementById("background-image");

    imageUpload.addEventListener("change", function (e) {
      let file = e.target.files[0];
      let reader = new FileReader();

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

  const appDisplayInner = document.querySelector('#bg-upload');
  const bgTarget = document.querySelector('#background-image');

  appDisplayInner.addEventListener('dragover', function (e) {
    e.preventDefault();
    console.log('dragover');
    bgTarget.classList.add('bgUp');
  });
  appDisplayInner.addEventListener('dragleave', function (e) {
    e.preventDefault();
    console.log('dragleave');
    bgTarget.classList.remove('bgUp');
  });
  appDisplayInner.addEventListener('drop', function (e) {
    bgTarget.classList.remove('bgUp');
  });

  // キャラクター画像更新処理
  document.addEventListener("DOMContentLoaded", function () {
    let characterImgUpload = document.getElementById("characterImgUpload");
    let characterImage = document.getElementById("character-image");

    
  });
  

  // ステータス表示切り替え
  document.addEventListener('DOMContentLoaded', function() {
    let targetElement = document.getElementById('battle-field');

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Shift') {
            targetElement.classList.add('show-status');
        }
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === 'Shift') {
            targetElement.classList.remove('show-status');
        }
    });  
  });

 

  // キーボードショートカット
  document.addEventListener('keydown', function(event) {
    if (event.key === ' ') {
      event.preventDefault();
      document.querySelector('#strategy-pause').click();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      // バトル開始ボタンが押せる状態ならクリック
      if (!document.querySelector('#start-battle').inert) {
        document.querySelector('#start-battle').click();
      }
    }
    if (event.key === 'c') {
      gui.classList.toggle('open');
    }
    // 右矢印キー
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      document.querySelector('#speed-control-2x').click();
    }
    // 左矢印キー
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      document.querySelector('#speed-control-1x').click();
    }
    // 上矢印キー
    if (event.key === 'a') {
      event.preventDefault();
      document.querySelector('#upload').click();
    }
  });
}



export function setRecoverHPListener(characters) {
  // HPを全回復するボタン
  characters.forEach(c => {
    console.log('import:',c.name,c.hp);
    c.hp = c.maxHP;
    let characterDiv = document.querySelector(`.character[data-name="${c.name}"]`);
    characterDiv.classList.remove('defeated');

    // アクションキューを再作成する
    let actionQueue = createActionQueue(characters);
    updateOrderDisplay(actionQueue);
    updateStatus(c);
  });
}

export function setEnemyClearListener(characters, sharedSP, actionQueue) {
  // 敵のクリアボタン
  let enemySideFront = document.querySelector('.enemy-side .frontline');
  let enemySideBack = document.querySelector('.enemy-side .backline');
  while (enemySideFront.firstChild) {
    enemySideFront.removeChild(enemySideFront.firstChild);
  }
  while (enemySideBack.firstChild) {
    enemySideBack.removeChild(enemySideBack.firstChild);
  }

  sharedSP.enemy = 0;
  updateSP('enemy');
  
  // characters配列から敵キャラクターを直接削除
  for (let i = characters.length - 1; i >= 0; i--) {
    if (characters[i].side !== 'ally') {
      characters.splice(i, 1);
    }
  }

  actionQueue = createActionQueue(characters);
  // console.log('GUI...actionQueue:',actionQueue);
  updateOrderDisplay(actionQueue);
}