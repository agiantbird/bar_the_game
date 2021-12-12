class Overworld {
 constructor(config) {
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
   this.map = null;
 }

  startGameLoop() {
    const step = () => {
      //Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Establish the camera person
      const cameraPerson = this.map.gameObjects.hero;

      //Update all objects
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })

      //Draw Lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      //Draw Game Objects
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })

      //Draw Upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);
      
      if(!this.map.isPaused) {
        requestAnimationFrame(() => {
          step();   
        })
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

 startMap(mapConfig) {
  this.map = new OverworldMap(mapConfig);
  this.map.overworld = this;
  this.map.mountObjects();
  this.map.checkForFootstepCutscene();
 }

 init() {
  // this.startMap(window.OverworldMaps.DemoRoom);
  //starting at chap 5 for easy dev
  this.startMap(window.OverworldMaps.C10_Bar_Pt1);


  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();
  this.directionInput.init();

  this.startGameLoop();


  this.map.startCutscene([
    // { type: "changeMap", map: "DemoRoom" },
    // chapter 1
    // { who: "characterM", type: "stand",  direction: "right", time: 20 },
    // { who: "characterL", type: "stand",  direction: "right", time: 20 },
    // { type: "textMessage", text: "... ... ... ... ... ... ... ... ... ..."},
    // { type: "textMessage", text: " ... ... ... ..."},
    // { type: "textMessage", text: "."},
    // { type: "textMessage", text: '...'},
    // { type: "textMessage", text: "."},
    // { type: "textMessage", text: "L: ...The beginning."},
    // { who: "characterM", type: "stand",  direction: "down", time: 400 },
    // { type: "textMessage", text: "M: You mean how long since the beginning?"},
    // { type: "textMessage", text: "L: Yeah, how long have we been sitting here, since we started sitting here?"},
    // { who: "characterO", type: "stand",  direction: "left", time: 400 },
    // { type: "textMessage", text: "O: I'm not sure. Does it matter?"},
    // { who: "characterM", type: "stand",  direction: "right", time: 20 },
    // { who: "characterO", type: "stand",  direction: "up", time: 400 },
    // { type: "textMessage", text: "."},
    // { type: "textMessage", text: "."},
    // { type: "textMessage", text: "."},
    // { who: "characterL", type: "stand",  direction: "down", time: 400 },
    // { type: "textMessage", text: "L: ...We were here before M."},
    // { who: "characterM", type: "stand",  direction: "down", time: 2000 },
    // { type: "textMessage", text: "M: I was here at 10:30."},
    // { type: "textMessage", text: ".............."},
    // { who: "characterM", type: "stand",  direction: "down", time: 2000 },
    // { who: "characterM", type: "stand",  direction: "down", time: 2000 },
    // { who: "characterL", type: "stand",  direction: "right", time: 2000 },
    // { type: "textMessage", text: "L: So we've been here since 10:30 at least."},
    // { who: "characterO", type: "stand",  direction: "left", time: 400 },
    // { type: "textMessage", text: "O: At least."},
    // { who: "characterL", type: "stand",  direction: "up", time: 2000 },
    // { who: "characterL", type: "stand",  direction: "down", time: 2000 },
    // { who: "characterL", type: "stand",  direction: "right", time: 2000 },
    // { who: "characterL", type: "stand",  direction: "down", time: 2000 },
    // { type: "textMessage", text: "L: But how long since?"},
    // { who: "characterL", type: "stand",  direction: "down", time: 100 },
    // { type: "textMessage", text: "M: It's 12:10, now."},
    // { type: "textMessage", text: "L: So for a bit."},
    // { who: "characterL", type: "stand",  direction: "right", time: 100 },
    // { type: "textMessage", text: "O: And some time before."},
    // { who: "characterO", type: "stand",  direction: "up", time: 400 },
    // { type: "textMessage", text: ".............."},
    // { type: "textMessage", text: ".............."},
    // { type: "textMessage", text: ".............."},
    // { type: "textMessage", text: "L: Felt shorter."},
    // { who: "characterO", type: "stand",  direction: "left", time: 400 },
    // { type: "textMessage", text: "O: It did. Longer, too."},
    // { type: "textMessage", text: ".............."},
    // { type: "textMessage", text: ".............."},
    // { type: "textMessage", text: ".............."},
    // { type: "textMessage", text: "How much longer will we be here?"},
    // { type: "textMessage", text: ".............."},
    // { type: "textMessage", text: ".............."},
  ])
 }
}