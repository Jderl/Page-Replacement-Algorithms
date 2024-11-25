function transpose(matrix, numRows) {
  const transposed = [];
  for (let i = 0; i < numRows; i++) {
    const row = [];
    for (let j = 0; j < matrix.length; j++) {
      row.push(matrix[j][i] || "-");
    }
    transposed.push(row);
  }
  return transposed;
}

function fifo(sequence, frameCount) {
  const frames = [];
  const allSteps = [];
  let hit = 0,
    miss = 0,
    replaceIndex = 0;

  sequence.forEach((page) => {
    if (frames.includes(page)) {
      hit++;
    } else {
      miss++;
      if (frames.length === frameCount) {
        frames[replaceIndex] = page;
      } else {
        frames.push(page);
      }
      replaceIndex = (replaceIndex + 1) % frameCount;
    }
    allSteps.push([...frames]);
  });

  return {
    hit,
    miss,
    ratio: (hit / sequence.length) * 100,
    steps: transpose(allSteps, frameCount),
  };
}

function lru(sequence, frameCount) {
  const frames = [];
  const allSteps = [];
  let hit = 0,
    miss = 0;

  sequence.forEach((page) => {
    const index = frames.indexOf(page);
    if (index === -1) {
      miss++;
      if (frames.length === frameCount) {
        frames.shift();
      }
      frames.push(page);
    } else {
      hit++;
      frames.splice(index, 1);
      frames.push(page);
    }
    allSteps.push([...frames]);
  });

  return {
    hit,
    miss,
    ratio: (hit / sequence.length) * 100,
    steps: transpose(allSteps, frameCount),
  };
}

function opt(sequence, frameCount) {
  const frames = [];
  const allSteps = [];
  let hit = 0,
    miss = 0;

  sequence.forEach((page, currentIndex) => {
    if (frames.includes(page)) {
      hit++;
    } else {
      miss++;
      if (frames.length < frameCount) {
        frames.push(page);
      } else {
        let farthestIndex = -1;
        let replaceIndex = -1;
        frames.forEach((frame, i) => {
          const nextUseIndex = sequence.slice(currentIndex + 1).indexOf(frame);
          if (nextUseIndex === -1 || nextUseIndex > farthestIndex) {
            farthestIndex = nextUseIndex;
            replaceIndex = i;
          }
        });
        frames[replaceIndex] = page;
      }
    }
    allSteps.push([...frames]);
  });

  return {
    hit,
    miss,
    ratio: (hit / sequence.length) * 100,
    steps: transpose(allSteps, frameCount),
  };
}



// function displayResults(algorithmName, result) {
//   const resultDiv = document.getElementById("results");
//   resultDiv.innerHTML += `<h3>${algorithmName}</h3>`;
//   resultDiv.innerHTML += `<p>Hits: ${result.hit}, Page Faults (Misses): ${
//     result.miss
//   }, Hit Ratio: ${result.ratio.toFixed(2)}%</p>`;

//   const table = document.createElement("table");
//   result.steps.forEach((row) => {
//     const tr = document.createElement("tr");
//     row.forEach((cell) => {
//       const td = document.createElement("td");

//       // If the cell is empty, make it grey
//       if (cell === "-") {
//         td.textContent = cell;
//         td.style.backgroundColor = "#d3d3d3"; // Grey for empty slots
//         td.style.color = "black"; // Black text for empty slots
//       } else {
//         // For non-empty cells, check if it is a page fault (miss) and highlight with red
//         td.textContent = cell;
//         if (cell === "miss") {
//           // Assuming 'miss' marks a page fault
//           td.style.backgroundColor = "#f44336"; // Red for page faults
//           td.style.color = "white"; // White text for page faults
//         } else {
//           td.style.backgroundColor = "white"; // Regular background for hits
//         }
//       }
//       tr.appendChild(td);
//     });
//     table.appendChild(tr);
//   });

//   resultDiv.appendChild(table);
// }

function displayResults(algorithmName, result) {
  const resultDiv = document.getElementById("results");
  resultDiv.innerHTML += `<h3>${algorithmName}</h3>`;
  resultDiv.innerHTML += `<p>Hits: ${result.hit}, Page Faults (Misses): ${result.miss}, Hit Ratio: ${result.ratio.toFixed(2)}%</p>`;

  const table = document.createElement("table");
  result.steps.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      for (let colIndex = 0; colIndex < result.steps[0].length; colIndex++) {
          const cell = row[colIndex] || "-"; // Fill missing cells with "-"
          const td = document.createElement("td");

          if (cell && typeof cell === "object") {
              td.textContent = cell.value;
              if (cell.type === "miss") {
                  td.className = "miss"; // Highlight misses
              }
          } else {
              td.textContent = cell; // Handle empty or default cells
              td.className = cell === "-" ? "empty" : "";
          }

          tr.appendChild(td);
      }
      table.appendChild(tr);
  });

  resultDiv.appendChild(table);
}

function calculate() {
  const sequence = document.getElementById("sequence").value.split(" ");
  const frameCount = parseInt(document.getElementById("frames").value, 10);
  const fifoResult = fifo(sequence, frameCount);
  const lruResult = lru(sequence, frameCount);
  const optResult = opt(sequence, frameCount);

  const resultDiv = document.getElementById("results");
  resultDiv.innerHTML = ""; // Clear previous results

  displayResults("FIFO", fifoResult);
  displayResults("LRU", lruResult);
  displayResults("OPT", optResult);
}
