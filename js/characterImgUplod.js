export function characterImgUplod(dropZone) {
  // ドラッグオーバーイベントのデフォルトアクションをキャンセル
  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
  });

  // ドロップイベントを処理
  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();

    let files = e.dataTransfer.files;
    let currentDropZone = e.currentTarget; // 現在のドロップゾーンを変数に格納

    if (files.length > 0) {
      let file = files[0];

      // 画像ファイルであるかチェック
      if (file.type.startsWith("image/")) {
        let reader = new FileReader();

        // 画像を読み込んだ後、background-imageプロパティにセットして表示
        reader.onload = function (event) {
          currentDropZone.style.backgroundImage = "url(" + event.target.result + ")";
          currentDropZone.textContent = ''; // テキストを消去
        };
        reader.readAsDataURL(file);
      }
    }
  });
}
