"use strict";

document.addEventListener("DOMContentLoaded", function (event) {
    console.log("DOM fully loaded and parsed");

    // TRUE IF WE ARE IN PLAYING MODE
    var playing = true;
    // INITIAL STATE
    var initial = true;
    // Percentage of BOMBS in playground
    var percentageOfBoms = 15;
    // NUMBER OF BOMBS
    var totalNumberOfBombs = 0;
    var numberOfBombs = 0;
    // GAME OVER - BOOL
    var gameOver = false;
    // function for timing
    var timeInterval = void 0;
    var sec = 0;
    var min = 0;
    var minutesElement = document.getElementById("minutes");
    var secondsElement = document.getElementById("seconds");

    var availableWidth = window.innerWidth;
    var availableHeight = window.innerHeight;
    var mainContainer = document.getElementById("main-container");
    var playground = document.getElementById("playground");
    var sizeOfCell = 25;
    var numberOfColumns = 10;
    var numberOfRows = 10;
    var optionButton = document.getElementById("optionButton");
    var bombsNumber = document.getElementById("bombsNumber");
    var mainHeading = document.getElementById("mainHeading");
    // WINNING CONDITION
    var numberOfAllCells = numberOfRows * numberOfColumns;
    var numberOfClickedCells = 0;
    var winningState = numberOfAllCells - numberOfBombs;
    var firstClick = true;

    // ELEMENTS of INPUT
    var rowsInput = document.getElementById("numberOfRowsInput");
    var columnsInput = document.getElementById("numberOfColumnsInput");
    var percentageInput = document.getElementById("percentageInput");
    var autoSwitch = document.getElementById("autoSwitch");
    var autoCoordinates = true;
    var newGameButton = document.getElementById("submitBtn");
    var rowsFromInput = 0;
    var columnsFromInput = 0;
    var percentageFromInput = 0;

    //MODAL
    var optionModal = document.getElementById("optionModal");
    var closeModal = document.getElementById("closeModal");

    // OPEN MODAL = CLICK OPTION BUTTON
    optionButton.addEventListener("click", function () {
        optionModal.style.display = "block";
        rowsInput.value = numberOfRows;
        columnsInput.value = numberOfColumns;
        stopTime();
    });

    // SWITCHING BETWEEN AUTO AND CUSTOM ROWS AND COLUMNS
    autoSwitch.addEventListener("click", function () {
        if (autoCoordinates) {
            autoCoordinates = false;
            autoSwitch.innerText = "OFF";
            rowsInput.disabled = false;
            columnsInput.disabled = false;
        } else {
            autoCoordinates = true;
            autoSwitch.innerText = "ON";
            rowsInput.disabled = true;
            columnsInput.disabled = true;
        }
    });

    // CLOSING MODAL
    closeModal.addEventListener("click", function () {
        optionModal.style.display = "none";
        if (playing && !firstClick) {
            startTime();
        }
    });
    optionModal.addEventListener("click", function (e) {
        if (e.target == optionModal) {
            optionModal.style.display = "none";
            if (playing && !firstClick) {
                startTime();
            }
        }
    });

    rowsInput.addEventListener("change", function () {
        rowsFromInput = rowsInput.value;
    });
    columnsInput.addEventListener("change", function () {
        columnsFromInput = columnsInput.value;
    });
    percentageInput.addEventListener("change", function () {
        percentageOfBoms = percentageInput.value;
    });

    // NEW GAME
    newGameButton.addEventListener("click", function () {
        setGame();
        optionModal.style.display = "none";
        if (playing && !firstClick) {
            startTime();
        }
    });

    // STARTING NEW GAME WHEN THE PAGE IS LOADED
    setGame();

    // GAME LOOP
    function setGame() {
        showTitle();
        clearPlayground();
        setPlayground();
        stopTime();
        resetTime();
        updateTime();
    }

    // SETTING PLAYGROUND - MAINLY CELLS
    function setPlayground() {
        // True when page is loaded
        if (initial) {
            rowsInput.value = numberOfRows;
            columnsInput.value = numberOfColumns;
            percentageInput.value = percentageOfBoms;
        }

        numberOfClickedCells = 0;
        if (autoCoordinates) {
            // UPDATING THE AVAILABLE WIDTH AND HEIGHT 
            updateWidthAndHeight();
            // NUMBER OF COLUMNS for playground
            numberOfColumns = Math.floor(availableWidth * updateWidthOfContainer() / sizeOfCell);
            // NUMBER OF ROWS for playground
            numberOfRows = Math.floor(availableHeight / sizeOfCell) - 6;
        } else {
            numberOfRows = rowsFromInput;
            numberOfColumns = columnsFromInput;
            console.log(numberOfRows);
        }

        playground.style.width = numberOfColumns * sizeOfCell + "px";
        playground.style.height = numberOfRows * sizeOfCell + "px";
        // Adjusting of width of main-container
        mainContainer.style.width = numberOfColumns * sizeOfCell + "px";
        numberOfAllCells = numberOfRows * numberOfColumns;

        // FILLING PLAYGROUND WITH CELLS
        setCell();

        // FILLING THE BOMBS
        fillTheBombs(numberOfRows, numberOfColumns);
        // New Winning condition
        winningState = numberOfAllCells - numberOfBombs;
        // SET AMOUNT BOMBS ARRAY
        setAmountBombsArray(numberOfRows, numberOfColumns);
    }

    // SETTING CELLS in PLAYGROUND
    function setCell() {
        for (var i = 0; i < numberOfRows; i++) {
            for (var j = 0; j < numberOfColumns; j++) {
                var cell = document.createElement("div");
                cell.className = "btn";
                cell.id = i + "," + j;
                playground.appendChild(cell);

                // RIGHT CLICK EVENT
                cell.addEventListener("contextmenu", function (e) {
                    var id = this.id.split(",");
                    var x = parseInt(id[0]);
                    var y = parseInt(id[1]);

                    e.preventDefault();
                    if (!clickedArray[x][y]) {
                        if (!arrayOfFlags[x][y]) {
                            this.style.background = "url('images/flag.png')";
                            arrayOfFlags[x][y] = true;
                            numberOfBombs--;
                            updateNumberOfBombs();
                        } else {
                            this.style.background = "rgba(129, 197, 245, 0.8)";
                            arrayOfFlags[x][y] = false;
                            numberOfBombs++;
                            updateNumberOfBombs();
                        }
                    }
                });

                // LEFT CLICK EVENT
                cell.addEventListener("click", function () {
                    var id = this.id.split(",");
                    var x = parseInt(id[0]);
                    var y = parseInt(id[1]);

                    if (gameOver) {
                        gameOver = false;
                        setGame();
                        firstClick = true;
                        playing = true;
                        return;
                    }
                    if (firstClick && playing) {
                        firstClick = false;
                        startTime();
                    }

                    if (!clickedArray[x][y] && !arrayOfFlags[x][y] && playing) {
                        clickTheCell(x, y);
                    }
                });
            }
        }
        // CLEARING FLOAT OF CELLS
        var clearDiv = document.createElement("div");
        clearDiv.className = "clear";
        playground.appendChild(clearDiv);
    }

    // FILLING WITH THE BOMB and clickedArray function
    var arrayOfBombs;
    var clickedArray;
    var arrayOfFlags;
    function fillTheBombs(rows, columns) {
        numberOfBombs = 0;
        arrayOfBombs = new Array(rows);
        clickedArray = new Array(rows);
        arrayOfFlags = new Array(rows);
        // clear the array of bombs
        for (var i = 0; i < rows; i++) {
            arrayOfBombs[i] = new Array(columns);
            clickedArray[i] = new Array(columns);
            arrayOfFlags[i] = new Array(columns);
            for (var j = 0; j < columns; j++) {
                var isBomb = randomBomb();
                arrayOfBombs[i][j] = isBomb;
                if (isBomb) {
                    numberOfBombs++;
                }
                clickedArray[i][j] = false;
                arrayOfFlags[i][j] = false;
            }
        }
        // Update number of bombs 
        updateNumberOfBombs();
    };

    // PRECOMPUTED AMOUNT OF BOMBS
    var amountBombsArray;
    function setAmountBombsArray(rows, columns) {
        amountBombsArray = new Array(rows);
        for (var i = 0; i < rows; i++) {
            amountBombsArray[i] = new Array(columns);
            for (var j = 0; j < columns; j++) {
                if (arrayOfBombs[i][j]) {
                    amountBombsArray[i][j] = 100;
                } else {
                    amountBombsArray[i][j] = getNumberOfBombsAround(i, j);
                }
                //console.log("id: " + i+","+j + ": "+amountBombsArray[i][j] + "  bomb: " + arrayOfBombs[i][j]);
            }
        }
    };

    // GET NUMBERS OF BOMBS AROUND THE CELL
    function getNumberOfBombsAround(x, y) {
        var varX = parseInt(x);
        var varY = parseInt(y);
        var amountOfBombs = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (varX + i >= 0 && varX + i < numberOfRows && varY + j >= 0 && varY + j < numberOfColumns) {
                    if (arrayOfBombs[varX + i][varY + j]) {
                        amountOfBombs++;
                    }
                }
            }
        }
        return amountOfBombs;
    };

    // Random function for filling bomb = returning 
    function randomBomb() {
        var randomNumber = Math.floor(Math.random() * 100);
        if (randomNumber < percentageOfBoms) {
            return true;
        } else {
            return false;
        }
    };

    // CLEAR PLAYGROUND
    function clearPlayground() {
        while (playground.firstChild) {
            playground.removeChild(playground.firstChild);
        }
    };

    // UPDATING THE WIDTH OF MAIN-CONTAINER according to the actual width
    function updateWidthOfContainer() {
        if (availableWidth > 678) {
            return 0.60;
        } else if (availableWidth > 400) {
            return 0.90;
        } else {
            return 0.95;
        }
    };

    // UPDATING AVAILABLE WIDTH AND HEIGHT
    function updateWidthAndHeight() {
        availableWidth = window.innerWidth;
        availableHeight = window.innerHeight;
    };

    // UPDATE NUMBER OF BOBMBS IN THE UI
    function updateNumberOfBombs() {
        bombsNumber.innerText = numberOfBombs;
    };

    // CLICKING THE CELL IN THE PLAYGROUND
    function clickTheCell(x, y) {

        var varX = parseInt(x);
        var varY = parseInt(y);

        var currentCell = document.getElementById(varX + "," + varY);

        if (!gameOver && !clickedArray[varX][varY]) {
            // Setting the cell as CLICKED
            currentCell.className += " isClicked";
            currentCell.style.background = "rgba(250, 250, 250, 0.9)";
            // increasing the number of clicked cells, importatnt for checking VICTORY
            numberOfClickedCells++;
            clickedArray[varX][varY] = true;

            checkWinningCondition();

            if (arrayOfBombs[varX][varY]) {
                currentCell.style.background = "url('images/clickedBomb.png')";
                setGameOver();
            } else {
                var amountBombsAround = amountBombsArray[varX][varY];
                if (amountBombsAround > 0) {
                    currentCell.innerText = amountBombsAround;
                    // COLOR OF NUMBER
                    if (amountBombsAround < 8) {
                        currentCell.style.color = colorTheNumber(amountBombsAround);
                    }
                    if (amountBombsAround == 8) {
                        currentCell.style.color = "white";
                        currentCell.style.background = "black";
                    }
                }
                if (amountBombsAround === 0) {
                    revealCellsAround(varX, varY);
                }
            }
        }
    };

    // COLOR THE NUMBER OF BOMBS IN THE UI
    function colorTheNumber(num) {
        if (num == 1) {
            return "blue";
        }
        if (num == 2) {
            return "darkGreen";
        }
        if (num == 3) {
            return "red";
        }
        if (num == 4) {
            return "purple";
        }
        if (num == 5) {
            return "brown";
        }
        if (num == 6) {
            return "navy";
        }
        if (num == 7) {
            return "black";
        }
    };

    // REVEAL ALL CELLS
    function revealAllCells() {
        var allCells = document.getElementsByClassName("btn");
        for (var i = 0; i < allCells.length; i++) {
            if (!allCells[i].classList.contains("isClicked")) {
                allCells[i].className += " isClicked";
                var coordinates = allCells[i].id.split(",");
                var varX = parseInt(coordinates[0]);
                var varY = parseInt(coordinates[1]);
                if (!arrayOfFlags[varX][varY]) {
                    if (arrayOfBombs[varX][varY]) {
                        allCells[i].style.background = "url('images/bomb2.png')";
                    } else {
                        var amountBombsAround = getNumberOfBombsAround(varX, varY);
                        if (amountBombsAround > 0) {
                            allCells[i].innerText = amountBombsAround;
                            // COLOR OF NUMBER
                            if (amountBombsAround < 8) {
                                allCells[i].style.color = colorTheNumber(amountBombsAround);
                            }
                            if (amountBombsAround == 8) {
                                allCells[i].style.color = "white";
                                allCells[i].style.background = "black";
                            }
                        }
                    }
                }
            }
        }
    };

    // SHOWING GAME OVER
    function setGameOver() {
        mainHeading.innerText = "Game Over";
        mainHeading.style.color = "#eee";
        mainHeading.style.background = "red";
        gameOver = true;
        playing = false;
        revealAllCells();
        stopTime();
    }

    // SHOW TITLE OF THE GAME
    function showTitle() {
        mainHeading.innerText = "MINESWEEPER";
        mainHeading.style.color = "#242281";
        mainHeading.style.background = "rgba(250, 250, 250, 0.6)";
    }

    function revealCellsAround(x, y) {
        var varX = parseInt(x);
        var varY = parseInt(y);

        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (varX + i >= 0 && varX + i < numberOfRows && varY + j >= 0 && varY + j < numberOfColumns && !clickedArray[varX + i][varY + j] && !arrayOfFlags[varX + i][varY + j]) {
                    clickedArray[varX + i][varY + j] = true;
                    numberOfClickedCells++;

                    checkWinningCondition();

                    var actualCell = document.getElementById(varX + i + "," + (varY + j));

                    var localNumberOfBombs = parseInt(amountBombsArray[varX + i][varY + j]);
                    if (localNumberOfBombs > 0 && localNumberOfBombs < 9) {
                        actualCell.innerText = localNumberOfBombs;
                        actualCell.style.color = colorTheNumber(localNumberOfBombs);
                        actualCell.className += " isClicked";
                    }
                    if (localNumberOfBombs == 0) {
                        revealCellsAround(varX + i, varY + j);
                        actualCell.className += " isClicked";
                    }
                }
            }
        }
    };

    // CHECKING WINNING CONDITION
    function checkWinningCondition() {
        if (numberOfClickedCells == winningState) {
            mainHeading.innerText = "You Win";
            mainHeading.style.background = "green";
            mainHeading.style.color = "#eee";
            revealAllCells();
            gameOver = true;
            playing = false;
            stopTime();
        }
    }

    // START TIME
    function startTime() {
        timeInterval = setInterval(function () {
            sec++;
            if (sec == 60) {
                sec = 0;
                min++;
            };
            updateTime();
        }, 1000);
    };
    // STOP TIME
    function stopTime() {
        clearInterval(timeInterval);
    };
    // RESTE TIME
    function resetTime() {
        sec = 0;
        min = 0;
    };
    // UPDATE TIME
    function updateTime() {
        if (sec < 10) {
            secondsElement.innerText = "0" + sec;
        } else {
            secondsElement.innerText = sec;
        }
        if (min < 10) {
            minutesElement.innerText = "0" + min;
        } else {
            minutesElement.innerText = min;
        }
    };
});