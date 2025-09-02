// src/components/Game1MultiHard.jsx
import React, { useEffect } from "react";

function Game1MultiHard() {
  useEffect(() => {
    /*
      =========================================================================
      這裡貼入原本 Game1_multi_hard.html 中 <script> 的所有程式碼，
      保持所有函式與變數命名，只要確保對應的元素 ID 與下方 JSX 一致即可。
      =========================================================================
    */

    // ------------------------------
    //  以下為完整的原腳本程式 (含 BFS, 指令面板等邏輯)
    // ------------------------------

    /*
      ===============================================================================      
      1) 這裡示範四關，與先前類似，但不再手動寫死 bestPath。改成依實際隨機位置跑 BFS。
      2) BFS -> 先從玩家起點到「必須撿取的道具1」，再 BFS 到「道具2」，最後 BFS 到「最終目標」，
         合併所有路徑指令，再加上最後動作(WATER/FEED/MIX/MAGNET) 形成 bestPath。
      3) 地圖5x5，若 BFS 無法通過障礙或越界到達目標，就會回傳null，則 bestPath = []。
      4) 第 2 次失敗後 -> showBestRoute=true，drawGame() 時會呼叫 drawBestRoute(lvl) 用紅線顯示 BFS 算出的路線。
      ===============================================================================    
    */

    // ----------------------------------
    // 關卡資料
    // ----------------------------------
    const levels = [
      // level0: WATER
      {
        gridSize: 5,
        description: "第 1 關：走到花朵位置 WATER",
        playerStart: { x: 0, y: 4 },
        commands: ["WATER"], // Action => "WATER"
        objects: [
          { type: "flower", x: 4, y: 0, isActive: true, watered: false },
        ],
        obstacles: [],
      },
      // level1: FEED
      {
        gridSize: 5,
        description: "第 2 關：先撿蘿蔔，再到兔子位置 FEED",
        playerStart: { x: 0, y: 4 },
        commands: ["FEED"],
        objects: [
          { type: "rabbit", x: 4, y: 0, isActive: true, fed: false },
          { type: "carrot", x: 2, y: 2, isActive: true },
        ],
        obstacles: [
          { x: 2, y: 3 },
          { x: 3, y: 2 },
        ],
      },
      // level2: MIX
      {
        gridSize: 5,
        description: "第 3 關：撿紅+黃，再到鍋子 MIX",
        playerStart: { x: 0, y: 4 },
        commands: ["MIX"],
        objects: [
          { type: "colorBottle", subType: "red", x: 1, y: 4, isActive: true },
          { type: "colorBottle", subType: "yellow", x: 2, y: 2, isActive: true },
          { type: "mixPot", x: 4, y: 0, isActive: true, mixed: false },
        ],
        obstacles: [
          { x: 3, y: 3 },
          { x: 3, y: 2 },
        ],
      },
      // level3: MAGNET
      {
        gridSize: 5,
        description: "第 4 關：先撿磁鐵，用它吸收所有金屬 MAGNET",
        playerStart: { x: 0, y: 4 },
        commands: ["MAGNET"],
        objects: [
          { type: "magnet", x: 1, y: 4, isActive: true },
          { type: "metal", x: 3, y: 3, isActive: true },
          { type: "metal", x: 4, y: 2, isActive: true },
        ],
        obstacles: [
          { x: 2, y: 3 },
          { x: 2, y: 2 },
        ],
      },
    ];

    // 紀錄：每關是否已初始化(隨機化/計算路線)
    let levelInitialized = Array(levels.length).fill(false);

    // 遊戲主要狀態
    let currentLevelIndex = 0;
    let player = { x: 0, y: 0 };
    let playerInventory = {};

    // 指令序列
    let commandList = [];

    // 失敗次數
    let failCount = 0;
    // 是否顯示最佳路線
    let showBestRoute = false;

    // ========== DOM 參考 ==========
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const levelInfo = document.getElementById("levelInfo");
    const resultMessage = document.getElementById("resultMessage");
    const commandQueueDiv = document.getElementById("commandQueue");

    // 按鈕
    const resetBtn = document.getElementById("resetBtn");
    const upBtn = document.getElementById("upBtn");
    const downBtn = document.getElementById("downBtn");
    const leftBtn = document.getElementById("leftBtn");
    const rightBtn = document.getElementById("rightBtn");
    const actionBtn = document.getElementById("actionBtn");
    const okBtn = document.getElementById("okBtn");

    // 綁定事件
    resetBtn.onclick = () => {
      clearCommands();
    };
    upBtn.onclick = () => {
      addCommand("UP");
    };
    downBtn.onclick = () => {
      addCommand("DOWN");
    };
    leftBtn.onclick = () => {
      addCommand("LEFT");
    };
    rightBtn.onclick = () => {
      addCommand("RIGHT");
    };
    actionBtn.onclick = () => {
      const lvl = levels[currentLevelIndex];
      const specialCmd = lvl.commands[0];
      if (specialCmd) addCommand(specialCmd);
    };
    okBtn.onclick = () => {
      runCommands();
    };

    // -------------------------------------------
    // 載入圖示 (角色 & 物件)
    // -------------------------------------------
    const playerImg = new Image();
    playerImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="orange"/></svg>';

    const flowerImg = new Image();
    flowerImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="35" y="30" width="30" height="60" fill="green"/><circle cx="50" cy="20" r="15" fill="magenta"/></svg>';

    const rabbitImg = new Image();
    rabbitImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><ellipse cx="50" cy="60" rx="20" ry="30" fill="gray"/><circle cx="42" cy="50" r="4" fill="black"/><circle cx="58" cy="50" r="4" fill="black"/></svg>';

    const carrotImg = new Image();
    carrotImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><polygon points="50,20 65,80 35,80" fill="orange"/><rect x="46" y="10" width="8" height="10" fill="green"/></svg>';

    const bottleRedImg = new Image();
    bottleRedImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="40" y="25" width="20" height="40" fill="red"/><circle cx="50" cy="25" r="10" fill="black"/></svg>';

    const bottleYellowImg = new Image();
    bottleYellowImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="40" y="25" width="20" height="40" fill="yellow"/><circle cx="50" cy="25" r="10" fill="black"/></svg>';

    const potImg = new Image();
    potImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><ellipse cx="50" cy="50" rx="30" ry="15" fill="purple"/><rect x="20" y="50" width="60" height="10" fill="purple"/></svg>';

    const magnetImg = new Image();
    magnetImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M30,20 L70,20 L70,40 A20,20 0 0 1 30,40 Z" fill="blue"/><path d="M30,40 L70,40 L70,60 A20,20 0 0 1 30,60 Z" fill="red"/></svg>';

    const metalImg = new Image();
    metalImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="30" y="30" width="40" height="40" fill="silver"/></svg>';

    [playerImg, flowerImg, rabbitImg, carrotImg, bottleRedImg, bottleYellowImg, potImg, magnetImg, metalImg].forEach(
      (img) => (img.onload = () => drawGame())
    );

    // -------------------------------------------
    // 初始化: 載入第一關
    // -------------------------------------------
    loadLevel(currentLevelIndex, false);

    // -------------------------------------------
    // 載入關卡
    //   isReloadFail = true => 同關失敗後重載
    //   isReloadFail = false => 首次 or 通關 => 計算 BFS
    // -------------------------------------------
    function loadLevel(index, isReloadFail) {
      if (index >= levels.length) {
        levelInfo.textContent = "恭喜你，已完成所有關卡！";
        resultMessage.innerHTML = "";
        clearCanvas();
        disableButtons(true);
        return;
      }

      const lvl = levels[index];
      levelInfo.textContent = lvl.description;
      resultMessage.innerHTML = "";

      // 非失敗 => 重置 failCount & 不顯示路線
      if (!isReloadFail) {
        failCount = 0;
        showBestRoute = false;
      }

      // 重置玩家
      player.x = lvl.playerStart.x;
      player.y = lvl.playerStart.y;
      playerInventory = {
        hasCarrot: false,
        colors: [],
        hasMagnet: false,
        metalCollected: 0,
      };

      // 若尚未初始化 => 隨機物品 + 計算 BFS 路線
      if (!isReloadFail && !levelInitialized[index]) {
        randomizeObjects(lvl);
        // 重置所有物件狀態
        lvl.objects.forEach((o) => {
          o.isActive = true;
          if (o.type === "flower") o.watered = false;
          if (o.type === "rabbit") o.fed = false;
          if (o.type === "mixPot") o.mixed = false;
        });
        // 動態計算 BFS 得到 bestPath
        lvl.bestPath = buildBestPath(lvl);
        levelInitialized[index] = true;
      }

      // 清空指令
      commandList = [];
      updateCommandQueueDisplay();
      drawGame();
    }

    // -------------------------------------------
    // 隨機化物品位置 (障礙不動)
    // -------------------------------------------
    function randomizeObjects(lvl) {
      const used = new Set();
      lvl.obstacles.forEach((obs) => used.add(`${obs.x},${obs.y}`));
      used.add(`${lvl.playerStart.x},${lvl.playerStart.y}`);

      lvl.objects.forEach((obj) => {
        let placed = false,
          tries = 100;
        while (!placed && tries > 0) {
          const rx = Math.floor(Math.random() * lvl.gridSize);
          const ry = Math.floor(Math.random() * lvl.gridSize);
          const key = `${rx},${ry}`;
          if (!used.has(key)) {
            obj.x = rx;
            obj.y = ry;
            used.add(key);
            placed = true;
          }
          tries--;
        }
      });
    }

    // -------------------------------------------
    // 動態計算 BFS 路線
    // -------------------------------------------
    function buildBestPath(lvl) {
      // 依關卡需求，組合 BFS sub-target
      const gridSize = lvl.gridSize;
      const obsSet = new Set(lvl.obstacles.map((o) => `${o.x},${o.y}`));

      const start = lvl.playerStart; // (x,y)

      let subTargets = [];
      let finalAction = lvl.commands[0] || null; // WATER/FEED/MIX/MAGNET

      switch (finalAction) {
        case "WATER": {
          let fl = lvl.objects.find((o) => o.type === "flower");
          if (!fl) return [];
          subTargets.push({ x: fl.x, y: fl.y, action: "WATER" });
          break;
        }
        case "FEED": {
          // BFS: player -> carrot -> rabbit
          let ca = lvl.objects.find((o) => o.type === "carrot");
          let rb = lvl.objects.find((o) => o.type === "rabbit");
          if (ca) subTargets.push({ x: ca.x, y: ca.y, action: null }); // 撿蘿蔔
          if (rb) subTargets.push({ x: rb.x, y: rb.y, action: "FEED" });
          break;
        }
        case "MIX": {
          // BFS: player -> redBottle -> yellowBottle -> mixPot
          let red = lvl.objects.find(
            (o) => o.type === "colorBottle" && o.subType === "red"
          );
          let yel = lvl.objects.find(
            (o) => o.type === "colorBottle" && o.subType === "yellow"
          );
          let pot = lvl.objects.find((o) => o.type === "mixPot");
          if (red) subTargets.push({ x: red.x, y: red.y, action: null });
          if (yel) subTargets.push({ x: yel.x, y: yel.y, action: null });
          if (pot) subTargets.push({ x: pot.x, y: pot.y, action: "MIX" });
          break;
        }
        case "MAGNET": {
          // BFS: player -> magnet -> metal1 -> action -> metal2 -> action ...
          let mg = lvl.objects.find((o) => o.type === "magnet");
          if (mg) subTargets.push({ x: mg.x, y: mg.y, action: null });

          let metals = lvl.objects.filter((o) => o.type === "metal");
          metals.forEach((m) => {
            subTargets.push({ x: m.x, y: m.y, action: "MAGNET" });
          });
          break;
        }
        default: {
          return [];
        }
      }

      let currentPos = { x: start.x, y: start.y };
      let finalDirections = [];

      for (let i = 0; i < subTargets.length; i++) {
        let st = subTargets[i];
        // BFS from currentPos -> st
        let seg = bfsFindPath(gridSize, obsSet, currentPos, st);
        if (!seg) {
          return [];
        }
        finalDirections.push(...seg.directions);
        if (st.action) {
          finalDirections.push(st.action);
        }
        currentPos = { x: st.x, y: st.y };
      }

      return finalDirections;
    }

    // -------------------------------------------
    // 單次 BFS：從 srcPos -> dstPos
    // -------------------------------------------
    function bfsFindPath(gridSize, obsSet, src, dst) {
      let visited = new Set();
      let queue = [];
      const key = (x, y) => `${x},${y}`;

      queue.push({ x: src.x, y: src.y, parent: null });
      visited.add(key(src.x, src.y));

      let foundNode = null;

      while (queue.length > 0) {
        let node = queue.shift();
        if (node.x === dst.x && node.y === dst.y) {
          foundNode = node;
          break;
        }
        // 4個方向
        let dirs = [
          [0, -1, "UP"],
          [0, 1, "DOWN"],
          [-1, 0, "LEFT"],
          [1, 0, "RIGHT"],
        ];
        for (let i = 0; i < dirs.length; i++) {
          let [dx, dy, dir] = dirs[i];
          let nx = node.x + dx,
            ny = node.y + dy;
          if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue;
          if (obsSet.has(key(nx, ny))) continue;
          if (!visited.has(key(nx, ny))) {
            visited.add(key(nx, ny));
            queue.push({ x: nx, y: ny, parent: node, move: dir });
          }
        }
      }

      if (!foundNode) return null;

      let pathPos = [];
      let directions = [];
      let cur = foundNode;
      while (cur) {
        pathPos.push({ x: cur.x, y: cur.y });
        if (cur.move) directions.push(cur.move);
        cur = cur.parent;
      }
      pathPos.reverse();
      directions.reverse();

      return { pathPositions: pathPos, directions };
    }

    // -------------------------------------------
    // 指令序列
    // -------------------------------------------
    function addCommand(cmd) {
      commandList.push(cmd);
      updateCommandQueueDisplay();
    }

    function clearCommands() {
      commandList = [];
      updateCommandQueueDisplay();
      resultMessage.innerHTML = "";
    }

    function updateCommandQueueDisplay() {
      commandQueueDiv.innerHTML = "";
      commandList.forEach((cmd, i) => {
        const span = document.createElement("span");
        span.className = "cmdItem";
        if (cmd === "UP") span.textContent = "↑";
        else if (cmd === "DOWN") span.textContent = "↓";
        else if (cmd === "LEFT") span.textContent = "←";
        else if (cmd === "RIGHT") span.textContent = "→";
        else span.textContent = "Action";
        span.onclick = () => {
          commandList.splice(i, 1);
          updateCommandQueueDisplay();
        };
        commandQueueDiv.appendChild(span);
      });
    }

    // -------------------------------------------
    // 執行指令 (OK)
    // -------------------------------------------
    async function runCommands() {
      disableButtons(true);
      resultMessage.innerHTML = "";

      for (let i = 0; i < commandList.length; i++) {
        await executeCommand(commandList[i]);
        drawGame();
      }

      if (checkWinCondition()) {
        resultMessage.innerHTML = '<div class="success">恭喜過關！</div>';
        currentLevelIndex++;
        setTimeout(() => loadLevel(currentLevelIndex, false), 1200);
      } else {
        failCount++;
        resultMessage.innerHTML =
          '<div class="fail">還沒成功，角色已回到起點！</div>';

        if (failCount >= 2) {
          showBestRoute = true;
        }

        setTimeout(() => loadLevel(currentLevelIndex, true), 1000);
      }

      disableButtons(false);
    }

    function disableButtons(disabled) {
      [
        resetBtn,
        upBtn,
        downBtn,
        leftBtn,
        rightBtn,
        actionBtn,
        okBtn,
      ].forEach((btn) => (btn.disabled = disabled));
    }

    // -------------------------------------------
    // 單一步驟指令
    // -------------------------------------------
    const MOVE_SPEED = 500;
    function executeCommand(cmd) {
      return new Promise((resolve) => {
        if (["UP", "DOWN", "LEFT", "RIGHT"].includes(cmd)) {
          movePlayer(cmd);
        } else {
          doAction(cmd);
        }
        setTimeout(() => resolve(), MOVE_SPEED);
      });
    }

    function movePlayer(direction) {
      const lvl = levels[currentLevelIndex];
      let newX = player.x,
        newY = player.y;
      switch (direction) {
        case "UP":
          newY--;
          break;
        case "DOWN":
          newY++;
          break;
        case "LEFT":
          newX--;
          break;
        case "RIGHT":
          newX++;
          break;
      }
      // 邊界
      if (newX < 0 || newX >= lvl.gridSize || newY < 0 || newY >= lvl.gridSize)
        return;
      // 障礙
      let key = (x, y) => `${x},${y}`;
      let obsSet = new Set(lvl.obstacles.map((o) => key(o.x, o.y)));
      if (obsSet.has(key(newX, newY))) return;

      // 移動
      player.x = newX;
      player.y = newY;
      pickUpIfPossible(lvl);
    }

    function pickUpIfPossible(lvl) {
      lvl.objects.forEach((obj) => {
        if (!obj.isActive) return;
        if (obj.x === player.x && obj.y === player.y) {
          switch (obj.type) {
            case "carrot":
              playerInventory.hasCarrot = true;
              obj.isActive = false;
              break;
            case "colorBottle":
              if (!playerInventory.colors.includes(obj.subType)) {
                playerInventory.colors.push(obj.subType);
              }
              obj.isActive = false;
              break;
            case "magnet":
              playerInventory.hasMagnet = true;
              obj.isActive = false;
              break;
          }
        }
      });
    }

    function doAction(action) {
      const lvl = levels[currentLevelIndex];
      switch (action) {
        case "WATER":
          lvl.objects.forEach((o) => {
            if (
              o.type === "flower" &&
              o.x === player.x &&
              o.y === player.y
            ) {
              o.watered = true;
            }
          });
          break;
        case "FEED":
          lvl.objects.forEach((o) => {
            if (
              o.type === "rabbit" &&
              o.x === player.x &&
              o.y === player.y
            ) {
              if (playerInventory.hasCarrot) o.fed = true;
            }
          });
          break;
        case "MIX":
          lvl.objects.forEach((o) => {
            if (o.type === "mixPot" && o.x === player.x && o.y === player.y) {
              if (
                playerInventory.colors.includes("red") &&
                playerInventory.colors.includes("yellow")
              ) {
                o.mixed = true;
              }
            }
          });
          break;
        case "MAGNET":
          if (!playerInventory.hasMagnet) return;
          lvl.objects.forEach((o) => {
            if (
              o.type === "metal" &&
              o.x === player.x &&
              o.y === player.y &&
              o.isActive
            ) {
              o.isActive = false;
              playerInventory.metalCollected =
                (playerInventory.metalCollected || 0) + 1;
            }
          });
          break;
      }
    }

    // -------------------------------------------
    // 判斷是否過關
    // -------------------------------------------
    function checkWinCondition() {
      const lvl = levels[currentLevelIndex];
      switch (currentLevelIndex) {
        case 0: {
          let f = lvl.objects.find((o) => o.type === "flower");
          return f && f.watered;
        }
        case 1: {
          let r = lvl.objects.find((o) => o.type === "rabbit");
          return r && r.fed;
        }
        case 2: {
          let pot = lvl.objects.find((o) => o.type === "mixPot");
          return pot && pot.mixed;
        }
        case 3: {
          let metals = lvl.objects.filter((o) => o.type === "metal");
          return metals.every((m) => !m.isActive);
        }
      }
      return false;
    }

    // -------------------------------------------
    // 繪製
    // -------------------------------------------
    function drawGame() {
      clearCanvas();
      const lvl = levels[currentLevelIndex];
      drawGrid(lvl.gridSize);

      // 畫障礙
      ctx.fillStyle = "#999";
      lvl.obstacles.forEach((obs) => {
        ctx.fillRect(
          obs.x * tileSize(),
          obs.y * tileSize(),
          tileSize(),
          tileSize()
        );
      });

      // 物件
      lvl.objects.forEach((obj) => {
        if (!obj.isActive) return;
        drawObject(obj);
      });

      // 角色
      ctx.drawImage(
        playerImg,
        player.x * tileSize(),
        player.y * tileSize(),
        tileSize(),
        tileSize()
      );

      // 若需顯示最佳路線 => 在最上層畫紅線
      if (showBestRoute && lvl.bestPath) {
        drawBestRoute(lvl);
      }
    }

    function clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawGrid(gridSize) {
      ctx.strokeStyle = "#999";
      for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize(), 0);
        ctx.lineTo(i * tileSize(), gridSize * tileSize());
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * tileSize());
        ctx.lineTo(gridSize * tileSize(), i * tileSize());
        ctx.stroke();
      }
    }

    function drawObject(obj) {
      let img;
      switch (obj.type) {
        case "flower":
          img = flowerImg;
          break;
        case "rabbit":
          img = rabbitImg;
          break;
        case "carrot":
          img = carrotImg;
          break;
        case "colorBottle":
          img = obj.subType === "red" ? bottleRedImg : bottleYellowImg;
          break;
        case "mixPot":
          img = potImg;
          break;
        case "magnet":
          img = magnetImg;
          break;
        case "metal":
          img = metalImg;
          break;
      }
      if (img) {
        ctx.drawImage(
          img,
          obj.x * tileSize(),
          obj.y * tileSize(),
          tileSize(),
          tileSize()
        );
      }
    }

    function tileSize() {
      return 500 / levels[currentLevelIndex].gridSize;
    }

    // -------------------------------------------
    // 把 level.bestPath 畫到畫布上
    // 只處理移動指令(UP/DOWN/LEFT/RIGHT)
    // -------------------------------------------
    function drawBestRoute(lvl) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,0,0,0.8)";
      ctx.lineWidth = 4;

      if (!lvl.bestPath || lvl.bestPath.length === 0) return;
      let path = lvl.bestPath;
      let x = lvl.playerStart.x;
      let y = lvl.playerStart.y;

      let points = [{ x, y }];
      for (let i = 0; i < path.length; i++) {
        let cmd = path[i];
        switch (cmd) {
          case "UP":
            y--;
            break;
          case "DOWN":
            y++;
            break;
          case "LEFT":
            x--;
            break;
          case "RIGHT":
            x++;
            break;
        }
        points.push({ x, y });
      }

      ctx.beginPath();
      for (let i = 0; i < points.length - 1; i++) {
        let p1 = points[i],
          p2 = points[i + 1];
        let c1 = {
          x: p1.x * tileSize() + tileSize() / 2,
          y: p1.y * tileSize() + tileSize() / 2,
        };
        let c2 = {
          x: p2.x * tileSize() + tileSize() / 2,
          y: p2.y * tileSize() + tileSize() / 2,
        };
        if (i === 0) ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
      }

      ctx.stroke();
      ctx.restore();
    }
  }, []);

  return (
    <div>
      {/* 將原本 <style> 放到 JSX 的 <style> 裏 */}
      <style>{`
        body {
          margin: 0; 
          padding: 0;
          font-family: sans-serif;
          text-align: center;
          background: #f2f2f2;
        }
        h1, h2 {
          margin: 0.5rem 0;
        }
        #gameContainer {
          display: inline-block;
          position: relative;
          margin: 20px auto;
          border: 2px solid #666;
          background: #fff;
        }
        #commandPanel {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        #buttonRow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
        }
        #commandQueue {
          min-height: 40px;
          background: #eee;
          border: 1px dashed #aaa;
          padding: 10px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          width: 80%;
          margin: 0 auto;
        }
        .cmdItem {
          background: #ccc;
          border-radius: 4px;
          padding: 5px 10px;
          margin: 5px;
          font-weight: bold;
          cursor: pointer;
        }
        #levelInfo {
          font-weight: bold;
          margin: 1rem 0;
          min-height: 30px;
        }
        #resultMessage {
          margin-top: 1rem;
          font-weight: bold;
          min-height: 30px;
        }
        .success {
          color: green;
          font-size: 1.2rem;
        }
        .fail {
          color: red;
        }
      `}</style>

      <h1>魔法花園 - 動態路線演算版</h1>
      <h2>物品隨機擺放，BFS 即時計算正確路線</h2>

      <div id="levelInfo"></div>
      <div id="gameContainer">
        <canvas id="gameCanvas" width="500" height="500"></canvas>
      </div>

      <div id="commandPanel">
        <div id="buttonRow">
          <button id="resetBtn">Reset</button>
          <button id="upBtn">↑</button>
          <button id="downBtn">↓</button>
          <button id="leftBtn">←</button>
          <button id="rightBtn">→</button>
          <button id="actionBtn">Action</button>
          <button id="okBtn">OK</button>
        </div>
        <div id="commandQueue"></div>
      </div>

      <div id="resultMessage"></div>
    </div>
  );
}

export default Game1MultiHard;
