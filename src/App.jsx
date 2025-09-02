// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


// src/App.jsx
import React from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Game1 from "./Game1";
import Game1MultiHard from "./Game1MultiHard";
import Game1Numbers from "./Game1Numbers";

function App() {
  return (
    <HashRouter>
      <div style={{ padding: 20 }}>
        <h1>遊戲選單</h1>
        <p>請選擇要前往的遊戲：</p>
        <ul>
          <li><Link to="/game1">魔法花園 - BFS 動態路線</Link></li>
          <li><Link to="/game1multi">魔法花園 - 多步指令 / Hard</Link></li>
          <li><Link to="/game1numbers">數量配對遊戲</Link></li>
        </ul>

        <hr />
        <Routes>
          <Route path="/game1" element={<Game1 />} />
          <Route path="/game1multi" element={<Game1MultiHard />} />
          <Route path="/game1numbers" element={<Game1Numbers />} />
          {/* 預設路徑: 直接顯示選單 */}
          <Route path="*" element={<div>請從上方選單進入遊戲</div>} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
