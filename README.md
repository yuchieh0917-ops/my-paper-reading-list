# My Paper Reading List

繁體中文的個人學術論文閱讀誌。首頁顯示閱讀統計、想讀／閱讀中的論文，以及已核准發布的簡報。網站使用 HTML、CSS、原生 JavaScript 和 JSON。

加入書目需要提供真實論文的 PDF、DOI 或原文網址。製作摘要與簡報需要可查核的全文，公開展示前須取得使用者明確同意。

## 本機預覽

在終端機切換到含有 `index.html` 的專案根目錄，執行以下指令。

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

用瀏覽器開啟 [本機首頁](http://127.0.0.1:8000/)。預覽期間保持終端機開啟，結束後按 Ctrl+C 停止。如果出現無法連線，先確認預覽服務仍在運作，再重新整理頁面。請透過 HTTP 預覽，讓瀏覽器可以載入 JavaScript 模組和 `data/papers.json`。

## 首次部署至 GitHub Pages

1. 本機預覽完成且取得發布確認後，在 GitHub 建立儲存庫，將可公開的專案檔案放在 `main` 分支根目錄，讓 `index.html`、`AGENTS.md` 和 `.nojekyll` 都位於根目錄。上傳前確認 Git 變更只包含可公開內容，且 `private/`、原始 PDF、PPTX 和待審草稿都未被追蹤。若從 GitHub 網頁上傳檔案，請手動排除私人檔案。
2. 開啟儲存庫的 **Settings → Pages**。在 **Build and deployment** 下選 **Deploy from a branch**，選擇 **main** 和 **/(root)**，按 **Save**。
3. 部署完成後，從 Pages 設定頁開啟網站。專案型網址通常是 `https://<帳號>.github.io/<儲存庫>/`。確認首頁能讀取資料，並在有論文後檢查詳細頁與簡報圖片。

詳細步驟見 [GitHub Pages 發布來源設定](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 網站上架後新增論文

1. 用使用者提供的來源查核原文標題、作者、年份與網址，檢查是否重複，並請使用者確認研究分類與實際閱讀狀態。
2. **只加入想讀清單**時，經確認後依 [AGENTS.md](./AGENTS.md) 第 4 節在 `data/papers.json` 新增書目。使用 `status: "want-to-read"`、`presentationStatus: "not-started"`、空字串摘要及空投影片陣列。保留其他記錄和既有 ID，接著依第 5、6 步檢查及發布。
3. **準備簡報典藏**時，原始 PDF 放在本機的 `private/incoming/`，依 [論文簡報製作指引](./presentation-guidelines.md) 整理，將待審中文摘要與可編輯的 16:9 PPTX 草稿留在 `private/pptx/`。需要時建立這些資料夾。
4. 使用者確認已讀完，且同意發布 3～5 句摘要與簡報後，將通過審核的投影片依順序輸出至 `assets/papers/<paper-id>/slides/slide-01.webp` 等路徑。核對比例、張數、順序和可讀性，再將摘要與相對圖片路徑填入 JSON，並設為 `completed` 和 `published`。共用詳細頁會以 `paper.html?id=<paper-id>` 載入。
5. 本機預覽並檢查卡片、搜尋、篩選、排序、論文詳細頁、首尾翻頁及手機圖表可讀性。確認 Git 變更只包含可公開的 JSON、已核准圖片及有意更新的網站檔案。
6. 取得發布確認後推送到 Pages 指定的 `main` 分支。GitHub Pages 會自動部署到同一個網址。可到 **Actions** 查看進度，部署完成後再檢查新文章與簡報能否開啟。
