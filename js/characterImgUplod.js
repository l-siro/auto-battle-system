export function characterImgUplod(dropZone, characters) {
  // ドラッグオーバーイベントのデフォルトアクションをキャンセル
  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', function (e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });

  // ドロップイベントを処理
  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    let files = e.dataTransfer.files;
    let currentDropZone = e.currentTarget; // 現在のドロップゾーンを変数に格納

    
    // #order-of-actionの子要素を取得
    let orderOfAction = document.getElementById('order-of-action');
    let orderOfActionChildren = orderOfAction.children;
    let dropZoneName = currentDropZone.closest('.character').querySelector('.character-name').textContent;
    
    // dropZoneNameと一致するdata-nameを持つorderOfActionChildrenを取得
    let orderOfActionChild = Array.from(orderOfActionChildren).find(function (orderOfActionChild) {
      return orderOfActionChild.dataset.name === dropZoneName;
    });
    
    console.log(orderOfActionChild);

    if (files.length > 0) {
      let file = files[0];

      // 画像ファイルであるかチェック
      if (file.type.startsWith("image/")) {
        let reader = new FileReader();

        // 画像を読み込んだ後、background-imageプロパティにセットして表示
        reader.onload = function (event) {
          currentDropZone.style.backgroundImage = "url(" + event.target.result + ")";
          // currentDropZone.textContent = ''; // テキストを消去
          orderOfActionChild.style.backgroundImage = currentDropZone.style.backgroundImage;
          console.log('画像を読み込みました');
        };
        reader.readAsDataURL(file);
      }
    }
  });
}
