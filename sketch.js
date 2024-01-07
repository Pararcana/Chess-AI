let startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
let newFEN = "rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP3N/2N5/1P2PPPP/R1BQKB1R"
let mouseBuffer = [false, false, false]
let flip = true
let highlightSquares = []
let arrowSquares = []
let pieces
let decile
let testText

function preload() {
	// Pieces by Cburnett - Own work, CC BY-SA 3.0
    pieces = {
        "k": loadImage("Pieces/bKing.png"),
        "q": loadImage("Pieces/bQueen.png"),
        "r": loadImage("Pieces/bRook.png"),
    	"b": loadImage("Pieces/bBishop.png"),
        "n": loadImage("Pieces/bKnight.png"),
        "p": loadImage("Pieces/bPawn.png"),
        "K": loadImage("Pieces/wKing.png"),
        "Q": loadImage("Pieces/wQueen.png"),
        "R": loadImage("Pieces/wRook.png"),
        "B": loadImage("Pieces/wBishop.png"),
        "N": loadImage("Pieces/wKnight.png"),
        "P": loadImage("Pieces/wPawn.png")
    }
	sfx = {
		"boom": loadSound("SFX/boom.mp3")
	}
}

function setup() {
	for (let element of document.getElementsByClassName("p5Canvas")) {
		element.addEventListener("contextmenu", v => v.preventDefault());
	}
}

function drawArrow(x1, y1, x2, y2, ghost=false) {
	if (!flip && !ghost) {[x1, y1, x2, y2] = [10-x1, 10-y1, 10-x2, 10-y2]}
	else if (!flip && ghost) {[x1, y1] = [10-x1, 10-y1]}
	let hypotenuse = Math.sqrt(Math.abs(x1-x2)**2 + Math.abs(y1-y2)**2)
	let angle = Math.atan((y1-y2) / (x1-x2))
	let xAvg = (x1+x2)/2
	let yAvg = (y1+y2)/2

	circle(x2 * decile, y2 * decile, decile/3)
	circle(x2 * decile, y2 * decile, decile/2)

	push()
	translate(xAvg * decile, yAvg * decile)
	rotate(angle)
	translate(-xAvg * decile, -yAvg * decile)
	rect(xAvg * decile, yAvg * decile, hypotenuse * decile + decile/4, decile/4, decile/8)
	pop()
}

function drawBoard() {
	push()
	stroke(0, 0)
	for (x = 1; x <= 8; x++) {
		for (y = 1; y <= 8; y++) {
			let rgb = (x+y) % 2 !== 0 ? [100, 50, 175] : [200, 150, 255]
			fill(...rgb)
			square((x*decile), (y*decile), decile)
		}
	}

	fill(235, 64, 52, 200)
	for (let [x, y] of highlightSquares) {
		if (!flip) {[x, y] = [9-x, 9-y]}
		square(x*decile, y*decile, decile)
	}

	drawPosFromFEN(startFEN)

	rectMode(CENTER)
	for (let [x1, y1, x2, y2] of arrowSquares) {
		drawArrow(x1, y1, x2, y2)
	}
	if (mouseBuffer[2] === RIGHT && mouseIsPressed === true && mouseButton === RIGHT && mouseBuffer[0]) {
		drawArrow(mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, mouseX/decile, mouseY/decile, true)
	}
	pop()
}

function drawPosFromFEN(fen) {
	let x = flip ? 1 : 8
	let y = flip ? 1 : 8

	for (let char of fen) {
		if (char === "/") {
			x = flip ? 1 : 8
			flip ? y++ : y--
		} else if (isNaN(Number(char))) {
			image(pieces[char], x*decile, y*decile, decile, decile)
			flip ? x++ : x--
		} else {
			flip ? x += Number(char) : x -= Number(char)
		}
	}
}

function drawPosFromBoard() {
	for (let x = 1; x <= 8; x++) {
		for (let y = 1; y <= 8; y++) {
			if (board[y-1][x-1] !== "#") {
				image(pieces[board[y-1][x-1]], x*decile, y*decile, decile, decile)
			}
		}
	}
}

function draw() {
	createCanvas(windowWidth, windowHeight)
	decile = Math.min(windowWidth, windowHeight) / 10

	drawBoard()
	text(testText, mouseX, mouseY)
}

function keyPressed() {
	if (key === "x") {flip = !flip}
}

function mousePressed() {
	[rank, file] = getRankandFileFromMouse(mouseX, mouseY)
	mouseBuffer = [rank, file, mouseButton]
}

function mouseReleased() {
	[rank, file] = getRankandFileFromMouse(mouseX, mouseY)
	if (mouseBuffer.join("") === [rank, file, RIGHT].join("") && rank && file) {
		if (highlightSquares.every(arr => arr.join("") !== [rank, file].join(""))) {
			highlightSquares.push([rank, file])
		} else {
			highlightSquares = highlightSquares.filter(v => v.join("") !== [rank, file].join(""))
		}
	} else if (mouseBuffer[2] === RIGHT && mouseBuffer[0] && mouseBuffer[1] && rank && file) {
		if (arrowSquares.every(arr => arr.join("") !== [mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5].join(""))) {
			arrowSquares.push([mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5])
		} else {
			arrowSquares = arrowSquares.filter(v => v.join("") !== [mouseBuffer[0]+0.5, mouseBuffer[1]+0.5, rank+0.5, file+0.5].join(""))
		}
	} else if (mouseBuffer[2] === LEFT) {
		highlightSquares = []
		arrowSquares = []
	}
}

function getRankandFileFromMouse(x, y, isRelease, button) {
	if (Math.min(x,y) > decile && Math.max(x,y) < 9 * decile) {
		let rank = Math.floor(x/decile)
		let file = Math.floor(y/decile)
		if (!flip) {rank = 9 - rank; file = 9 - file}
		return [rank, file]
	}
	return [false, false]
}
