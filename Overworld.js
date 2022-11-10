class Overworld {
 constructor(config) {
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
   this.map = null;
 }

 draw() {
  // clean up old draws
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // update all objects
  Object.values(this.map.gameObjects).forEach(obj => {
    obj.update({ arrow: this.directionInput.direction, map: this.map });
  });

  // establish the camera person
  const cameraPerson = this.map.gameObjects.hero;

  // draw ground layer
  this.map.drawLowerImage(this.ctx, cameraPerson);

  // draw game objects
  Object.values(this.map.gameObjects)
    .sort((a, b) => a.y - b.y)
    .forEach(obj => {
    obj.sprite.draw(this.ctx, cameraPerson);
  });

  // draw upper layer
  this.map.drawUpperImage(this.ctx, cameraPerson);
}

startGameLoop() {
  const fps = 60;
  let now;
  let then = Date.now();
  let interval = 1000/fps;
  let delta;
  
  const step = () => {

    if (!this.map.isPaused) {
      requestAnimationFrame(step)
    }

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
      then = now - (delta % interval);
      this.draw();
    }
  }

  step();
}

 bindActionInput() {
   new KeyPressListener("Enter", () => {
     //Is there a person here to talk to?
     this.map.checkForActionCutscene()
   })

   new KeyPressListener("Escape", () => {
    //Pause menu
    if(!this.map.isCutscenePlaying) {
      this.map.startCutscene([
        { type: "pause" }
      ])
    }
  })
 }

 bindHeroPositionCheck() {
   document.addEventListener("PersonWalkingComplete", e => {
     if (e.detail.whoId === "hero") {
       //Hero's position has changed
       this.map.checkForFootstepCutscene()
     }
   })
 }

 startMap(mapConfig, heroInitialState=null) {
  this.map = new OverworldMap(mapConfig);
  this.map.overworld = this;
  this.map.mountObjects();
  if(heroInitialState) {
    const {hero} = this.map.gameObjects
    this.map.removeWall(hero.x, hero.y);
    hero.x = heroInitialState.x;
    hero.y = heroInitialState.y;
    hero.direction = heroInitialState.direction;
    this.map.addWall(hero.x, hero.y);
  }

  this.progress.mapId = mapConfig.id;
  this.progress.startingHeroX = this.map.gameObjects.hero.x;
  this.progress.startingHeroY = this.map.gameObjects.hero.y;
  this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
  this.map.checkForFootstepCutscene();
 }

 async init() {

  const container = document.querySelector(".game-container")
  //Create a new Progress tracker
  this.progress = new Progress();

  //Show the title screen
  this.titleScreen = new TitleScreen({
    progress: this.progress
  })
  const useSaveFile = await this.titleScreen.init(container)

  //Potentially load saved data
  let initialHeroState = null;
  const saveFile = this.progress.getSaveFile();
  if (useSaveFile) {
    this.progress.load();
    initialHeroState = {
      x: this.progress.startingHeroX,
      y: this.progress.startingHeroY,
      direction: this.progress.startingHeroDirection,
    }
  }

  // start the first map (alter which map is initial map in Progress.js for easy dev)
  this.startMap(window.OverworldMaps[this.progress.mapId],initialHeroState);

  // create controls
  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();
  this.directionInput.init();

  // start game
  this.startGameLoop();


  // this.map.startCutscene([
  // ])
 }
}