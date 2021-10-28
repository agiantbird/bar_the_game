class OverworldMap {
  constructor(config) {
    this.gameObjects = config.gameObjects;

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;
  }

  drawLowerImage(ctx) {
    ctx.drawImage(this.lowerImage, 0, 0)
  }

  drawUpperImage(ctx) {
    ctx.drawImage(this.upperImage, 0, 0)
  } 
}

window.OverworldMaps = {
  BarRoom: {
    lowerSrc: "/images/maps/BarLower.png",
    upperSrc: "/images/maps/BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5)
      }),
      npc1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc1.png"
      }),
      npc2: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/npc2.png"
      })
    }
  }
}
