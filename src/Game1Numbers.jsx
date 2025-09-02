// src/components/Game1Numbers.jsx
import React, { useEffect } from "react";

function Game1Numbers() {
  useEffect(() => {
    /*
      =========================================================
      以下貼入原本 Game1_numbers.html 中 <script> 的程式內容
      包含模式切換、題目生成、Base64圖片等。
      =========================================================
    */

    // 10 種 Base64 內嵌 SVG 圖案 (遊戲關卡中使用)
    const allItems = [
      {
        name: "player",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0ib3JhbmdlIi8+PC9zdmc+",
      },
      {
        name: "flower",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB4PSIzNSIgeT0iMzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI2MCIgZmlsbD0iZ3JlZW4iLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjIwIiByPSIxNSIgZmlsbD0ibWFnZW50YSIvPjwvc3ZnPg==",
      },
      {
        name: "rabbit",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZWxsaXBzZSBjeD0iNTAiIGN5PSI2MCIgcng9IjIwIiByeT0iMzAiIGZpbGw9ImdyYXkiLz48Y2lyY2xlIGN4PSI0MiIgY3k9IjUwIiByPSIxMCIgZmlsbD0iYmxhY2siLz48Y2lyY2xlIGN4PSI1OCIgc3R5bGU9IiIgY3k9IjUwIiByPSIxMCIgZmlsbD0iYmxhY2siLz48L3N2Zz4=",
      },
      {
        name: "carrot",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cG9seWdvbiBwb2ludHM9IjUwLDIwIDY1LDgwIDM1LDgwIiBmaWxsPSJvcmFuZ2UiLz48cmVjdCB4PSI0NiIgeT0iMTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjEwIiBmaWxsPSJncmVlbiIvPjwvc3ZnPg==",
      },
      {
        name: "bottleRed",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB4PSI0MCIgeT0iMjUiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0icmVkIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSIyNSIgcj0iMTAiIGZpbGw9ImJsYWNrIi8+PC9zdmc+",
      },
      {
        name: "bottleYellow",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB4PSI0MCIgeT0iMjUiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0ieWVsbG93Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSIyNSIgcj0iMTAiIGZpbGw9ImJsYWNrIi8+PC9zdmc+",
      },
      {
        name: "bottleBlue",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB4PSI0MCIgeT0iMjUiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0iYmx1ZSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iMjUiIHI9IjEwIiBmaWxsPSJibGFjayIvPjwvc3ZnPg==",
      },
      {
        name: "pot",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZWxsaXBzZSBjeD0iNTAiIGN5PSI1MCIgcng9IjMwIiByeT0iMTUiIGZpbGw9InB1cnBsZSIvPjxyZWN0IHg9IjIwIiB5PSI1MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjEwIiBmaWxsPSJwdXJwbGUiLz48L3N2Zz4=",
      },
      {
        name: "magnet",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cGF0aCBkPSJNMzAsMjAgTDcwLDIwIEw3MCw0MCBBMjAsMjAgMCAwIDEgMzAsNDAgWiIgZmlsbD0iYmx1ZSIvPjxwYXRoIGQ9Ik0zMCw0MCBMNzAsNDAgTDcwLDYwIEEyMCwyMCAwIDAgMSAzMCw2MCBaIiBmaWxsPSJyZWQiLz48L3N2Zz4=",
      },
      {
        name: "metal",
        imageUrl:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB4PSIzMCIgeT0iMzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ic2lsdmVyIi8+PC9zdmc+",
      },
    ];

    // 糖果圖示 (完全通關時顯示) – 這裡使用一個簡單的 candy SVG
    const candyImageUrl =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB4PSIyMCIgeT0iNDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgcng9IjEwIiBmaWxsPSJyZWQiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjUwIiByPSIxMCIgZmlsbD0ieWVsbG93Ii8+PGNpcmNsZSBjeD0iODAiIGN5PSI1MCIgcj0iMTAiIGZpbGw9InllbGxvdzIiLz48L3N2Zz4=";

    let gameMode = null; // 'normal' or 'reverse'
    let levelData = []; // 10 關的題目資料
    let currentLevel = 0; // 目前關卡索引
    let score = 0; // 答對次數
    const totalLevels = 10; // 總關卡數

    const menuContainer = document.getElementById("menu-container");
    const gameContainer = document.getElementById("game-container");
    const confirmButton = document.getElementById("confirm-button");
    const resetButton = document.getElementById("reset-button");

    // 進入遊戲模式
    window.startGame = function (mode) {
      gameMode = mode;
      // 隱藏 menu-container
      menuContainer.style.display = "none";
      // 顯示 game-container
      gameContainer.style.display = "block";

      const items = [...allItems];
      shuffleArray(items);
      const numbersArray = Array.from({ length: 10 }, (_, i) => i + 1);
      shuffleArray(numbersArray);

      levelData = [];
      for (let i = 0; i < totalLevels; i++) {
        levelData.push({
          item: items[i],
          count: numbersArray[i],
        });
      }

      currentLevel = 0;
      score = 0;

      if (gameMode === "reverse") {
        confirmButton.style.display = "inline-block";
        confirmButton.onclick = checkAnswerReverse;
        resetButton.style.display = "inline-block";
        resetButton.onclick = resetReversePlacement;
      } else {
        confirmButton.style.display = "none";
        resetButton.style.display = "none";
      }

      showLevel(currentLevel);
    };

    function showLevel(levelIndex) {
      if (levelIndex >= totalLevels) {
        endGame();
        return;
      }
      gameContainer.innerHTML = ""; // 先清空

      const { item, count } = levelData[levelIndex];
      if (gameMode === "normal") {
        showNormalLevel(item, count);
      } else {
        showReverseLevel(item, count);
      }
    }

    // 正常模式：顯示圖案與選項
    function showNormalLevel(item, count) {
      const { name, imageUrl } = item;

      const titleDiv = document.createElement("div");
      titleDiv.className = "item-title";
      titleDiv.innerHTML = `
        <h2>請數這個圖案：</h2>
        <img src="${imageUrl}" alt="${name}" style="width:80px;" />
      `;
      gameContainer.appendChild(titleDiv);

      const itemContainer = document.createElement("div");
      itemContainer.className = "item-container";
      for (let i = 0; i < count; i++) {
        itemContainer.innerHTML += `<img src="${imageUrl}" alt="${name}" />`;
      }
      gameContainer.appendChild(itemContainer);

      const options = generateOptions(count, 4);
      options.forEach((num) => {
        const btn = document.createElement("button");
        btn.className = "option-button";
        btn.textContent = num;
        btn.addEventListener("click", () => checkAnswerNormal(num, count));
        gameContainer.appendChild(btn);
      });
    }

    // 正常模式答案檢查
    function checkAnswerNormal(selectedNumber, correctNumber) {
      removeFeedback();
      const feedbackEl = document.createElement("div");
      feedbackEl.id = "feedback";
      if (selectedNumber === correctNumber) {
        feedbackEl.textContent = "答對了！";
        feedbackEl.style.color = "green";
        score++;
        currentLevel++;
        setTimeout(() => {
          showLevel(currentLevel);
        }, 800);
      } else {
        feedbackEl.textContent = "再試試看～";
        feedbackEl.style.color = "red";
      }
      gameContainer.appendChild(feedbackEl);
    }

    // 相反模式：顯示數字題目與點擊產生圖案
    let reverseItemCount = 0;
    let reverseItemContainer;
    // let currentItemUrl = "";

    function showReverseLevel(item, count) {
      const { name, imageUrl } = item;
      reverseItemCount = 0;
    //   currentItemUrl = imageUrl;

      const titleDiv = document.createElement("div");
      titleDiv.className = "item-title";
      titleDiv.innerHTML = `
        <h2>請擺出下列數量的圖案：</h2>
        <p style="font-size:1.5rem; color:blue;">${count}</p>
        <p>點擊圖案即可在下方擺放一個</p>
      `;
      gameContainer.appendChild(titleDiv);

      const clickItemDiv = document.createElement("div");
      clickItemDiv.className = "item-container";
      const clickableImg = document.createElement("img");
      clickableImg.src = imageUrl;
      clickableImg.alt = name;
      clickableImg.style.cursor = "pointer";
      clickableImg.addEventListener("click", () => {
        reverseItemContainer.innerHTML += `<img src="${imageUrl}" alt="${name}" />`;
        reverseItemCount++;
      });
      clickItemDiv.appendChild(clickableImg);
      gameContainer.appendChild(clickItemDiv);

      reverseItemContainer = document.createElement("div");
      reverseItemContainer.className = "item-container";
      gameContainer.appendChild(reverseItemContainer);
    }

    // 相反模式答案檢查
    function checkAnswerReverse() {
      removeFeedback();
      if (currentLevel >= totalLevels) {
        endGame();
        return;
      }
      const { count } = levelData[currentLevel];
      const feedbackEl = document.createElement("div");
      feedbackEl.id = "feedback";
      if (reverseItemCount === count) {
        feedbackEl.textContent = "答對了！";
        feedbackEl.style.color = "green";
        score++;
        currentLevel++;
        setTimeout(() => {
          showLevel(currentLevel);
        }, 800);
      } else {
        feedbackEl.textContent = "再試試看～";
        feedbackEl.style.color = "red";
      }
      gameContainer.appendChild(feedbackEl);
    }

    // 重新擺放 (相反模式)
    function resetReversePlacement() {
      removeFeedback();
      reverseItemCount = 0;
      if (reverseItemContainer) {
        reverseItemContainer.innerHTML = "";
      }
    }

    // 遊戲結束，顯示分數與糖果
    function endGame() {
      gameContainer.innerHTML = `
        <h2>恭喜通過全部關卡！</h2>
        <p>你的分數：${score} / ${totalLevels}</p>
        <p>獎勵糖果：</p>
        <img src="${candyImageUrl}" alt="Candy" style="width:100px;" />
      `;
      confirmButton.style.display = "none";
      resetButton.style.display = "none";
    }

    function generateOptions(correct, totalOptions) {
      let result = [correct];
      while (result.length < totalOptions) {
        let rand = Math.floor(Math.random() * 10) + 1;
        if (!result.includes(rand)) {
          result.push(rand);
        }
      }
      shuffleArray(result);
      return result;
    }

    function removeFeedback() {
      const oldFeedback = document.getElementById("feedback");
      if (oldFeedback) {
        oldFeedback.remove();
      }
    }

    // Fisher-Yates 洗牌
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  }, []);

  return (
    <div>
      {/* 這裡可直接放原本 <style> 區塊 */}
      <style>{`
        body {
          font-family: sans-serif;
          text-align: center;
          margin: 20px;
        }
        #menu-container, #game-container {
          margin-top: 30px;
        }
        .option-button {
          margin: 5px;
          padding: 10px 20px;
          font-size: 1rem;
          cursor: pointer;
        }
        .item-title {
          margin: 20px;
        }
        .item-container {
          margin: 20px;
        }
        .item-container img {
          width: 60px;
          margin: 5px;
        }
        #feedback {
          margin-top: 10px;
          font-weight: bold;
        }
        #confirm-button, #reset-button {
          display: none;
          margin: 5px;
          padding: 10px 20px;
          font-size: 1rem;
          cursor: pointer;
        }
      `}</style>

      <h1>數量配對遊戲</h1>
      <div id="menu-container">
        <p>請選擇要玩的模式：</p>
        {/* 這裡用 onClick 呼叫 window.startGame */}
        <button
          className="option-button"
          onClick={() => window.startGame("normal")}
        >
          正常模式
        </button>
        <button
          className="option-button"
          onClick={() => window.startGame("reverse")}
        >
          相反模式
        </button>
      </div>

      <div id="game-container" style={{ display: "none" }}></div>
      <button id="confirm-button">確認</button>
      <button id="reset-button">重新擺放</button>
    </div>
  );
}

export default Game1Numbers;
