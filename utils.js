const utils = {
  withGrid(n) {
    return n * 16;
  },
  asGridCoord(x,y) {
    return `${x*16},${y*16}`
  },
  nextPosition(initialX, initialY, direction) {
    let x = initialX;
    let y = initialY;
    const size = 16;
    if (direction === "left") { 
      x -= size;
    } else if (direction === "right") {
      x += size;
    } else if (direction === "up") {
      y -= size;
    } else if (direction === "down") {
      y += size;
    }
    return {x,y};
  },
  oppositeDirection(direction) {
    if (direction === "left") {return "right"}
    if (direction === "right") {return "left"}
    if (direction === "up") {return "down"}
    return "up"
  },
  wait(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  },
  emitEvent(name, detail) {
    const event = new CustomEvent(name, {
      detail
    });
    document.dispatchEvent(event);
  }
  
}




/*

Wall point and click coordinate getter:

// STEP 1 ----> Add the following methods to your OverworldMap.js class

function registerClick(x, y) {
  const cameraPerson = this.gameObjects.find((obj) => obj.name === "hero");
  const xCoord = Math.floor((x - withGrid(10.5) + cameraPerson.x) / 16);
  const yCoord = Math.floor((y - withGrid(6) + cameraPerson.y) / 16);
  this.addWall(withGrid(xCoord), withGrid(yCoord));
  this.clickedCoordinates.push({ x: xCoord, y: yCoord }); // make sure you declare this as an empty array in the constructor
}

function drawClickedTiles(ctx, cameraPerson) {
  this.clickedCoordinates.forEach((coord) => {
    ctx.fillStyle = "#ff000050";
    ctx.fillRect(
      withGrid(10.5) - cameraPerson.x + coord.x * PADDING,
      withGrid(6) - cameraPerson.y + coord.y * PADDING,
      16, 16
    );
  });
}

// STEP 2 ----> Add the following to the init function of you Overworld.js class

function bindCanvasClickHandler() {
  this.canvas.addEventListener("mousedown", (e) => {
    const bounds = this.canvas.getBoundingClientRect();
    const scale = 3;
    this.map.registerClick(
      (e.clientX - bounds.x) / scale,
      (e.clientY - bounds.y) / scale
    );
  });
}

// FINALLY -----> Add this to the startGameLoop method in your Overworld.js

this.map.drawClickedTiles(this.ctx, cameraPerson);

*/