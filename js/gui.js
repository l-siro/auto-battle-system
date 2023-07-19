import { updateStatus } from "./battle.js";
import { createActionQueue } from "./battle.js";
import { updateOrderDisplay } from "./battle.js";
import { updateSP } from "./battle.js";
import { logBattleResult } from "./battle.js";

export function controlGUI() {

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
    bgTarget.classList.add('bgUp');
  });
  appDisplayInner.addEventListener('dragleave', function (e) {
    e.preventDefault();
    bgTarget.classList.remove('bgUp');
  });
  appDisplayInner.addEventListener('drop', function (e) {
    bgTarget.classList.remove('bgUp');
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


  // メニュー表示
  const menu = document.getElementById('menu');
  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    // クリックした要素が.characterとその子要素の場合はメニューを表示しない
    if (event.target.closest('.character')) {
      return;
    };
    menu.classList.remove('show');
    setTimeout(function() {
      menu.style.left = (event.clientX - 10) + 'px';
      menu.style.top = (event.clientY - 25) + 'px';
      menu.classList.add('show');  
    }, 100);
  });
  
  // pause-settingをクリックしたら#pauseSettingMenuメニューを開く
  const pauseSettingMenu = document.getElementById('pauseSettingMenu');
  document.getElementById('pause-setting').addEventListener('click', function(event) {
    pauseSettingMenu.classList.remove('show');
    setTimeout(function() {
      pauseSettingMenu.style.left = (event.clientX - 10) + 'px';
      pauseSettingMenu.style.top = (event.clientY - 25) + 'px';
      pauseSettingMenu.classList.add('show');  
    }, 100);
  });

  // メニューを閉じる
  document.addEventListener('click', function (event) {
    // selectboxとcheckboxの場合はメニューを閉じない
    if (event.target.closest('.selectbox') || event.target.closest('.pause-setting-menu')) {
      return;
    };
    menu.classList.remove('show');
    pauseSettingMenu.classList.remove('show');
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

  // 天候変更
  document.querySelector('#weather').addEventListener('change', function() {
    let weather = document.querySelector('#weather').value;
    // #background-imageに天候クラスを付与
    document.querySelector('#background-image').classList.remove(
      'none',
      'sunny',
      'rainy',
      'snowy',
      'cloudy',
      'foggy',
      'thunder',
      'stormy',
      'sand-stormy',
      'snow-heavy',
      'fog',
      'mana'
    );
    document.querySelector('#background-image').classList.add(weather);
  });
}

export function createContextMenu(characters) {
  let characterMenu = document.getElementById('character-menu');
  let characterBoxes = document.querySelectorAll('.character');
  
  let lastClickedCharacter = null;
  
  // グローバル関数を設定します。
  window.getClickedCharacter = function() {
    return lastClickedCharacter;
  };

  characterBoxes.forEach(characterBox => {
    characterBox.addEventListener('contextmenu', function (event) {
      event.preventDefault();
      characterMenu.classList.remove('show');
      setTimeout(function() {
        characterMenu.style.left = (event.clientX - 10) + 'px';
        characterMenu.style.top = (event.clientY - 25) + 'px';
        characterMenu.classList.add('show');
      }, 100);

      let clickCharacterName = event.target.closest('.character').dataset.name;
      let clickCharacter = characters.find(c => c.name === clickCharacterName);
      
      // クリックしたキャラクターを保存します。
      lastClickedCharacter = clickCharacter;
      console.log(lastClickedCharacter);
      //menu-ttlにキャラクター名を設定
      let menuTtl = characterMenu.querySelector('.menu-ttl');
      menuTtl.textContent = clickCharacterName + 'のメニュー';
      
      let menuItems = characterMenu.querySelectorAll('.character-menu-item');
      menuItems.forEach(menuItem => {
        menuItem.dataset.name = clickCharacterName;
      });

    });
  });

  window.addEventListener('click', function (event) {
    if (event.target.tagName === 'SELECT') {
      return;
    };
    characterMenu.classList.remove('show');
  });
}




export function setRecoverHPListener(characters, efficacy, targetCharacter) {
  const recoveryFactors = {
    full: 1,
    half: 0.5,
    quarter: 0.25
  };

  const updateCharacterHP = (character, factor) => {
    character.hp += Math.floor(character.maxHP * factor);
    if (character.hp > character.maxHP) {
      character.hp = character.maxHP;
    }

    let characterDiv = document.querySelector(`.character[data-name="${character.name}"]`);
    characterDiv.classList.remove('defeated');
    let actionQueue = createActionQueue(characters);
    updateOrderDisplay(actionQueue);
    updateStatus(character);
  };

  const isAll = targetCharacter === 'all';
  const recoveryFactor = recoveryFactors[efficacy];

  if (isAll) {
    characters.forEach(character => {
    let recoveryAmount = Math.floor(character.maxHP * recoveryFactor);
      console.log('import:', character.name, character.hp);
      updateCharacterHP(character, recoveryFactor);
      let cls = [character.side,'heal'] 
      logBattleResult(`${character.name}のHPが<span class="num">${recoveryAmount}</span>回復した!`, cls)
    });
  } else {
    let recoveryAmount = Math.floor(targetCharacter.maxHP * recoveryFactor);
    console.log('import:', targetCharacter.name, targetCharacter.hp);
    updateCharacterHP(targetCharacter, recoveryFactor);
    let cls = [targetCharacter.side,'heal'] 
    logBattleResult(`${targetCharacter.name}のHPが<span class="num">${recoveryAmount}</span>回復した!`, cls);
  }
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