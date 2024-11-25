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
    let hit = 0, miss = 0, replaceIndex = 0;

    sequence.forEach((page) => {
        const step = frames.slice(); // Create a copy of current frames
        if (frames.includes(page)) {
            hit++;
            step.push({ value: page, type: "hit" });
        } else {
            miss++;
            if (frames.length < frameCount) {
                frames.push(page);
            } else {
                frames[replaceIndex] = page;
            }
            replaceIndex = (replaceIndex + 1) % frameCount;
            step.push({ value: page, type: "miss" });
        }
        allSteps.push(step);
    });

    return {
        hit,
        miss,
        ratio: (hit / sequence.length) * 100,
        steps: transpose(allSteps, frameCount ), // Extra column for hit/miss
    };
}

function lru(sequence, frameCount) {
    const frames = [];
    const allSteps = [];
    let hit = 0, miss = 0;

    sequence.forEach((page) => {
        const step = frames.slice();
        const index = frames.indexOf(page);
        if (index === -1) {
            miss++;
            if (frames.length === frameCount) {
                frames.shift();
            }
            frames.push(page);
            step.push({ value: page, type: "miss" });
        } else {
            hit++;
            frames.splice(index, 1);
            frames.push(page);
            step.push({ value: page, type: "hit" });
        }
        allSteps.push(step);
    });

    return {
        hit,
        miss,
        ratio: (hit / sequence.length) * 100,
        steps: transpose(allSteps, frameCount + 1),
    };
}

function opt(sequence, frameCount) {
    const frames = [];
    const allSteps = [];
    let hit = 0, miss = 0;

    sequence.forEach((page, currentIndex) => {
        const step = frames.slice();
        if (frames.includes(page)) {
            hit++;
            step.push({ value: page, type: "hit" });
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
            step.push({ value: page, type: "miss" });
        }
        allSteps.push(step);
    });

    return {
        hit,
        miss,
        ratio: (hit / sequence.length) * 100,
        steps: transpose(allSteps, frameCount + 1),
    };
}

function displayResults(algorithmName, result) {
    const resultDiv = document.getElementById("results");
    resultDiv.innerHTML += `<h3>${algorithmName}</h3>`; // Fixed string interpolation
    resultDiv.innerHTML += `<p>Hits: ${result.hit}, Page Faults (Misses): ${result.miss}, Hit Ratio: ${result.ratio.toFixed(2)}%</p>`; // Fixed string interpolation

    const table = document.createElement("table");
    result.steps.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
            const td = document.createElement("td");

            if (cell && typeof cell === "object") {
                td.textContent = cell.value;
                if (cell.type === "miss") {
                    td.className = "miss";
                } else if (cell.type === "hit") {
                    td.className = "hit";
                }
            } else {
                td.textContent = cell || "-";
            }

            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    resultDiv.appendChild(table);
}

function calculate() {
    const sequence = document.getElementById("sequence").value.split(" ");
    const frameCount = parseInt(document.getElementById("frames").value, 10);

    if (!sequence || isNaN(frameCount) || frameCount <= 0) {
        alert("Please provide a valid sequence and frame size.");
        return;
    }

    const fifoResult = fifo(sequence, frameCount);
    const lruResult = lru(sequence, frameCount);
    const optResult = opt(sequence, frameCount);

    const resultDiv = document.getElementById("results");
    resultDiv.innerHTML = ""; // Clear previous results

    displayResults("FIFO", fifoResult);
    displayResults("LRU", lruResult);
    displayResults("OPT", optResult);
}
