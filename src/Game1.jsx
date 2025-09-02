// src/components/Game1.jsx
import React, { useEffect } from "react";

function Game1() {
  useEffect(() => {
    /*
      ====================
      在 useEffect 中貼入原本 Game1.html 的 <script> 內容
      ====================
    */

    // 以下程式對應原本 Game1.html 中 <script> 區塊的完整程式

    // -------------------------------
    // 關卡資料與 BFS 邏輯
    // -------------------------------
    const levels = [
      {
        gridSize: 5,
        description: "第 1 關：走到花朵位置 WATER",
        playerStart: { x: 0, y: 4 },
        commands: ["WATER"],
        objects: [
          { type: "flower", x: 4, y: 0, isActive: true, watered: false }
        ],
        obstacles: []
      },
      {
        gridSize: 5,
        description: "第 2 關：先撿蘿蔔，再到兔子位置 FEED",
        playerStart: { x: 0, y: 4 },
        commands: ["FEED"],
        objects: [
          { type: "rabbit", x: 4, y: 0, isActive: true, fed: false },
          { type: "carrot", x: 2, y: 2, isActive: true }
        ],
        obstacles: [
          { x: 2, y: 3 },
          { x: 3, y: 2 }
        ]
      },
      {
        gridSize: 5,
        description: "第 3 關：撿取兩支顏色筆，再到鍋子 MIX",
        playerStart: { x: 0, y: 4 },
        commands: ["MIX"],
        objects: [
          { type: "colorBottle", subType: "red", x: 1, y: 4, isActive: true },
          { type: "colorBottle", subType: "yellow", x: 2, y: 2, isActive: true },
          { type: "mixPot", x: 4, y: 0, isActive: true, mixed: false }
        ],
        obstacles: [
          { x: 3, y: 3 },
          { x: 3, y: 2 }
        ]
      },
      {
        gridSize: 5,
        description: "第 4 關：先撿磁鐵，再分別吸收金屬 MAGNET",
        playerStart: { x: 0, y: 4 },
        commands: ["MAGNET"],
        objects: [
          { type: "magnet", x: 1, y: 4, isActive: true },
          { type: "metal", x: 3, y: 3, isActive: true },
          { type: "metal", x: 4, y: 2, isActive: true }
        ],
        obstacles: [
          { x: 2, y: 3 },
          { x: 2, y: 2 }
        ]
      }
    ];

    let levelCompleted = Array(levels.length).fill(false);
    let levelInitialized = Array(levels.length).fill(false);

    let currentLevelIndex = 0;
    let player = { x: 0, y: 0 };
    let playerInventory = {};
    let failCount = 0;
    let showBestRoute = false;

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const levelInfo = document.getElementById("levelInfo");
    const resultMessage = document.getElementById("resultMessage");
    const resetBtn = document.getElementById("resetBtn");
    const actionBtn = document.getElementById("actionBtn");

    // 定義全域函式 (若你希望在 JSX 上直接呼叫):
    window.selectLevel = function (index) {
      currentLevelIndex = index;
      loadLevel(index, false);
    };

    resetBtn.onclick = () => {
      loadLevel(currentLevelIndex, true);
    };
    actionBtn.onclick = () => {
      const lvl = levels[currentLevelIndex];
      const specialCmd = lvl.commands[0];
      if (specialCmd) {
        if (specialCmd === "MAGNET") {
          let metalOnTile = lvl.objects.find(
            (o) => o.type === "metal" && o.x === player.x && o.y === player.y && o.isActive
          );
          if (metalOnTile) {
            doAction("MAGNET");
            drawGame();
            let metals = lvl.objects.filter((o) => o.type === "metal");
            if (metals.every((m) => !m.isActive)) {
              levelCompleted[currentLevelIndex] = true;
              resultMessage.innerHTML = '<div class="success">關卡完成！</div>';
              checkAllCompleted();
            } else {
              resultMessage.innerHTML = '<div>金屬已吸收，請尋找剩下的金屬。</div>';
            }
          } else {
            failCount++;
            resultMessage.innerHTML = '<div class="fail">沒有在金屬格！失敗回到起點！</div>';
            setTimeout(() => loadLevel(currentLevelIndex, true), 1000);
          }
        } else if (specialCmd === "MIX") {
          lvl.objects.forEach((o) => {
            if (o.type === "mixPot" && o.x === player.x && o.y === player.y) {
              if (
                lvl.selectedColors &&
                lvl.selectedColors.every((color) => playerInventory.colors.includes(color))
              ) {
                o.mixed = true;
              }
            }
          });
          drawGame();
          if (checkWinCondition()) {
            levelCompleted[currentLevelIndex] = true;
            resultMessage.innerHTML = '<div class="success">關卡完成！</div>';
            checkAllCompleted();
          } else {
            failCount++;
            resultMessage.innerHTML = '<div class="fail">還沒成功，角色已回到起點！</div>';
            if (failCount >= 2) showBestRoute = true;
            setTimeout(() => loadLevel(currentLevelIndex, true), 1000);
          }
        } else {
          doAction(specialCmd);
          drawGame();
          if (checkWinCondition()) {
            levelCompleted[currentLevelIndex] = true;
            resultMessage.innerHTML = '<div class="success">關卡完成！</div>';
            checkAllCompleted();
          } else {
            failCount++;
            resultMessage.innerHTML = '<div class="fail">還沒成功，角色已回到起點！</div>';
            if (failCount >= 2) showBestRoute = true;
            setTimeout(() => loadLevel(currentLevelIndex, true), 1000);
          }
        }
      }
    };

    function checkAllCompleted() {
      if (levelCompleted.every((s) => s)) {
        levelInfo.textContent = "恭喜你通過所有關卡！";
        resultMessage.innerHTML = "";
        clearCanvas();
        disableButtons(true);
        drawFinalScreen();
      }
    }

    function loadLevel(index, isReloadFail) {
      if (levelCompleted.every((s) => s)) {
        levelInfo.textContent = "恭喜你通過所有關卡！";
        resultMessage.innerHTML = "";
        clearCanvas();
        disableButtons(true);
        drawFinalScreen();
        return;
      }
      const lvl = levels[index];
      levelInfo.textContent = lvl.description;
      resultMessage.innerHTML = "";
      if (!isReloadFail) {
        failCount = 0;
        showBestRoute = false;
        player.x = lvl.playerStart.x;
        player.y = lvl.playerStart.y;
        playerInventory = {
          hasCarrot: false,
          colors: [],
          hasMagnet: false,
          metalCollected: 0
        };
        randomizeObjects(lvl);
        lvl.objects.forEach((o) => {
          o.isActive = true;
          if (o.type === "flower") o.watered = false;
          if (o.type === "rabbit") o.fed = false;
          if (o.type === "mixPot") {
            o.mixed = false;
            delete o.targetColor;
          }
        });
        if (index === 2) {
          const mixCombinations = [
            { colors: ["red", "yellow"], result: "orange" },
            { colors: ["red", "blue"], result: "purple" },
            { colors: ["yellow", "blue"], result: "green" }
          ];
          const chosen = mixCombinations[Math.floor(Math.random() * mixCombinations.length)];
          const colorBottles = lvl.objects.filter((o) => o.type === "colorBottle");
          if (colorBottles.length >= 2) {
            colorBottles[0].subType = chosen.colors[0];
            colorBottles[1].subType = chosen.colors[1];
          }
          lvl.selectedColors = chosen.colors;
          let mixPot = lvl.objects.find((o) => o.type === "mixPot");
          if (mixPot) {
            mixPot.targetColor = chosen.result;
          }
        }
        if (index !== 2) levelInitialized[index] = true;
      } else {
        player.x = lvl.playerStart.x;
        player.y = lvl.playerStart.y;
        if (failCount >= 2) {
          lvl.bestPath = buildBestPath(lvl);
          showBestRoute = true;
        }
      }
      drawGame();
    }

    function drawFinalScreen() {
      clearCanvas();
      const cw = canvas.width,
        ch = canvas.height;
      const imgW = cw * 0.5,
        imgH = ch * 0.5;
      const x = (cw - imgW) / 2,
        y = (ch - imgH) / 2;
      ctx.drawImage(finalCandyImg, x, y, imgW, imgH);
    }

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

    function buildBestPath(lvl) {
      const gridSize = lvl.gridSize;
      const obsSet = new Set(lvl.obstacles.map((o) => `${o.x},${o.y}`));
      const start = lvl.playerStart;
      let subTargets = [];
      let finalAction = lvl.commands[0] || null;
      switch (finalAction) {
        case "WATER": {
          let fl = lvl.objects.find((o) => o.type === "flower");
          if (!fl) return [];
          subTargets.push({ x: fl.x, y: fl.y, action: "WATER" });
          break;
        }
        case "FEED": {
          let ca = lvl.objects.find((o) => o.type === "carrot");
          let rb = lvl.objects.find((o) => o.type === "rabbit");
          if (ca) subTargets.push({ x: ca.x, y: ca.y, action: null });
          if (rb) subTargets.push({ x: rb.x, y: rb.y, action: "FEED" });
          break;
        }
        case "MIX": {
          let colorBottles = lvl.objects.filter((o) => o.type === "colorBottle");
          colorBottles.forEach((cb) => subTargets.push({ x: cb.x, y: cb.y, action: null }));
          let pot = lvl.objects.find((o) => o.type === "mixPot");
          if (pot) subTargets.push({ x: pot.x, y: pot.y, action: "MIX" });
          break;
        }
        case "MAGNET": {
          let mg = lvl.objects.find((o) => o.type === "magnet");
          if (mg) subTargets.push({ x: mg.x, y: mg.y, action: null });
          let metals = lvl.objects.filter((o) => o.type === "metal");
          metals.forEach((m) => {
            subTargets.push({ x: m.x, y: m.y, action: "MAGNET" });
          });
          break;
        }
        default:
          return [];
      }
      let currentPos = { x: start.x, y: start.y };
      let finalDirections = [];
      for (let i = 0; i < subTargets.length; i++) {
        let st = subTargets[i];
        let seg = bfsFindPath(gridSize, obsSet, currentPos, st);
        if (!seg) return [];
        finalDirections.push(...seg.directions);
        if (st.action) finalDirections.push(st.action);
        currentPos = { x: st.x, y: st.y };
      }
      return finalDirections;
    }

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
        let dirs = [
          [0, -1, "UP"],
          [0, 1, "DOWN"],
          [-1, 0, "LEFT"],
          [1, 0, "RIGHT"]
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

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const ts = tileSize();
      const gridX = Math.floor(clickX / ts);
      const gridY = Math.floor(clickY / ts);
      const dx = gridX - player.x;
      const dy = gridY - player.y;
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        let direction = "";
        if (dx === 1) direction = "RIGHT";
        else if (dx === -1) direction = "LEFT";
        else if (dy === 1) direction = "DOWN";
        else if (dy === -1) direction = "UP";
        movePlayer(direction);
        drawGame();
      }
    });

    function disableButtons(disabled) {
      resetBtn.disabled = disabled;
      actionBtn.disabled = disabled;
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
      if (
        newX < 0 ||
        newX >= lvl.gridSize ||
        newY < 0 ||
        newY >= lvl.gridSize
      )
        return;
      let obsSet = new Set(lvl.obstacles.map((o) => `${o.x},${o.y}`));
      if (obsSet.has(`${newX},${newY}`)) return;
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
            if (o.type === "flower" && o.x === player.x && o.y === player.y) {
              o.watered = true;
            }
          });
          break;
        case "FEED":
          lvl.objects.forEach((o) => {
            if (o.type === "rabbit" && o.x === player.x && o.y === player.y) {
              if (playerInventory.hasCarrot) o.fed = true;
            }
          });
          break;
        case "MIX":
          lvl.objects.forEach((o) => {
            if (o.type === "mixPot" && o.x === player.x && o.y === player.y) {
              if (
                lvl.selectedColors &&
                lvl.selectedColors.every((c) => playerInventory.colors.includes(c))
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

    function drawGame() {
      clearCanvas();
      const lvl = levels[currentLevelIndex];
      drawGrid(lvl.gridSize);
      ctx.fillStyle = "#999";
      lvl.obstacles.forEach((obs) => {
        ctx.fillRect(
          obs.x * tileSize(),
          obs.y * tileSize(),
          tileSize(),
          tileSize()
        );
      });
      lvl.objects.forEach((obj) => {
        if (!obj.isActive) return;
        drawObject(obj);
      });
      ctx.drawImage(
        playerImg,
        player.x * tileSize(),
        player.y * tileSize(),
        tileSize(),
        tileSize()
      );
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
          if (obj.subType === "red") img = bottleRedImg;
          else if (obj.subType === "yellow") img = bottleYellowImg;
          else if (obj.subType === "blue") img = bottleBlueImg;
          else img = bottleRedImg;
          break;
        case "mixPot":
          if (obj.targetColor) {
            ctx.fillStyle = obj.targetColor;
            ctx.beginPath();
            ctx.ellipse(
              obj.x * tileSize() + tileSize() / 2,
              obj.y * tileSize() + tileSize() / 2,
              tileSize() / 2,
              tileSize() / 3,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            return;
          } else {
            img = potImg;
          }
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

    function drawBestRoute(lvl) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,0,0,0.8)";
      ctx.lineWidth = 4;
      if (!lvl.bestPath || lvl.bestPath.length === 0) return;
      let path = lvl.bestPath;
      let x = lvl.playerStart.x,
        y = lvl.playerStart.y;
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
          y: p1.y * tileSize() + tileSize() / 2
        };
        let c2 = {
          x: p2.x * tileSize() + tileSize() / 2,
          y: p2.y * tileSize() + tileSize() / 2
        };
        if (i === 0) ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 載入圖片 (data URI 版)
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
    const bottleBlueImg = new Image();
    bottleBlueImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="40" y="25" width="20" height="40" fill="blue"/><circle cx="50" cy="25" r="10" fill="black"/></svg>';
    const potImg = new Image();
    potImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><ellipse cx="50" cy="50" rx="30" ry="15" fill="purple"/><rect x="20" y="50" width="60" height="10" fill="purple"/></svg>';
    const magnetImg = new Image();
    magnetImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M30,20 L70,20 L70,40 A20,20 0 0 1 30,40 Z" fill="blue"/><path d="M30,40 L70,40 L70,60 A20,20 0 0 1 30,60 Z" fill="red"/></svg>';
    const metalImg = new Image();
    metalImg.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="30" y="30" width="40" height="40" fill="silver"/></svg>';
    const finalCandyImg = new Image();
    finalCandyImg.src =
      "data:image/svg+xml;utf8," +
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
      "<circle cx='50' cy='50' r='40' fill='pink' />" +
      "<path d='M10,50 a40,40 0 0,1 80,0' stroke='white' stroke-width='10' fill='none'/>" +
      "<path d='M10,50 a40,40 0 0,0 80,0' stroke='red' stroke-width='5' fill='none'/>" +
      "</svg>";

    [playerImg, flowerImg, rabbitImg, carrotImg, bottleRedImg, bottleYellowImg, bottleBlueImg, potImg, magnetImg, metalImg, finalCandyImg].forEach(
      (img) => {
        img.onload = () => drawGame();
      }
    );

    // 載入第一關
    loadLevel(currentLevelIndex, false);
  }, []);

  return (
    <div>
      {/* 這裡可以把CSS直接放style，也可抽成CSS檔 */}
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
        #levelSelect {
          margin: 1rem;
        }
        #levelSelect button {
          margin: 0 0.3rem;
          padding: 0.3rem 0.6rem;
          font-size: 1rem;
          cursor: pointer;
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

      <div id="levelSelect">
        <button onClick={() => window.selectLevel(0)}>關卡 1 (WATER)</button>
        <button onClick={() => window.selectLevel(1)}>關卡 2 (FEED)</button>
        <button onClick={() => window.selectLevel(2)}>關卡 3 (MIX)</button>
        <button onClick={() => window.selectLevel(3)}>關卡 4 (MAGNET)</button>
      </div>

      <div id="levelInfo"></div>

      <div id="gameContainer">
        <canvas id="gameCanvas" width="500" height="500"></canvas>
      </div>

      <div id="commandPanel">
        <div id="buttonRow">
          <button id="resetBtn">Reset</button>
          <button id="actionBtn">Action</button>
        </div>
      </div>

      <div id="resultMessage"></div>
    </div>
  );
}

export default Game1;
