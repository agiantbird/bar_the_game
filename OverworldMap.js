class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      // npcA: new Person({
      //   x: utils.withGrid(7),
      //   y: utils.withGrid(9),
      //   src: "/images/characters/people/npc1_gray.png",
      //   behaviorLoop: [
      //     { type: "stand",  direction: "left", time: 1800 },
      //     { type: "stand",  direction: "up", time: 4000 },
      //     { type: "stand",  direction: "right", time: 1200 },
      //     { type: "stand",  direction: "up", time: 300 },
      //   ],
      //   talking: [
      //     {
      //       events: [
      //         { type: "textMessage", text: "I'm busy...", faceHero: "npcA" },
      //         { type: "textMessage", text: "Go away!"},
      //         { who: "hero", type: "walk",  direction: "up" },
      //         { who: "hero", type: "stand",  direction: "down", time: 300 },
      //       ]
      //     }
      //   ]
      // }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        behaviorLoop: [
          { type: "stand",  direction: "right", time: 1800 },
          { type: "stand",  direction: "down", time: 4000 }
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
            ]
          }
        ]
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        behaviorLoop: [
          { type: "stand",  direction: "right", time: 300 },
          { type: "stand",  direction: "down", time: 5000 }
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterO: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/characters/people/o_sitting.png",
        behaviorLoop: [
          { type: "stand",  direction: "right", time: 900 },
          { type: "stand",  direction: "up", time: 4000 }
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hi :)", faceHero: "characterO" },
              { type: "textMessage", text: "I'm O.!"},
            ]
          }
        ]
      }),
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      // emptyStool3: new Person({
      //   x: utils.withGrid(8),
      //   y: utils.withGrid(7),
      //   src: "/images/assets/stool_sprite_sheet.png",
      // }),
      // npcB: new Person({
      //   x: utils.withGrid(9),
      //   y: utils.withGrid(4),
      //   src: "/images/characters/people/hero_gray.png",
        // behaviorLoop: [
        //   { type: "walk",  direction: "left" },
        //   { type: "stand",  direction: "up", time: 800 },
        //   { type: "walk",  direction: "up" },
        //   { type: "walk",  direction: "right" },
        //   { type: "walk",  direction: "down" },
        // ]
      // }),
    },
    walls: {
      // back wall
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      //     door is at 6, 3
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,

      // bar
      [utils.asGridCoord(4,4)] : true,
      [utils.asGridCoord(4,5)] : true,
      [utils.asGridCoord(4,6)] : true,
      [utils.asGridCoord(5,6)] : true,
      [utils.asGridCoord(6,6)] : true,
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(6,3)]: [
        {
          events: [
            // { who: "npcB", type: "walk",  direction: "left" },
            // { who: "npcB", type: "walk",  direction: "left" },
            // { who: "npcB", type: "walk",  direction: "left" },
            // { who: "npcB", type: "stand",  direction: "up", time: 500 },
            // { type: "textMessage", text:"You can't be in there!"},
            // { who: "npcB", type: "walk",  direction: "right" },
            // { who: "npcB", type: "walk",  direction: "right" },
            // { who: "npcB", type: "walk",  direction: "right" },
            // { who: "npcB", type: "stand",  direction: "down", time: 500 },
            { who: "hero", type: "walk",  direction: "down" }
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "Kitchen" }
            { type: "changeMap", map: "C02_Bar" },
            // the above 'turns the page' to the next chapter
            // but you need to actually put the text of the next chapter here
            // and not in the C02_Bar object, for example

            // stand command is just to give the change map animation time
            ////// for this chapter, maybe have L at the vending machine, then walk over to sit at the bar
            ///////// .. how to do a sitting down animation ?
            // to resolve before the text kicks on - still, probably good to add 
            // "..."'s at the begginning of each chapter 
            { who: "characterM", type: "stand",  direction: "down", time: 400 },
            { type: "textMessage", text: "L: It's weird that it's here though-- isn't it, J.?"},
            { type: "textMessage", text: "J: Why's that?"},
            { type: "textMessage", text: "L: Well, you serve drinks here. Why would you also have a vending machine people can buy drinks from?"},
            { type: "textMessage", text: "J: It's just soda; you can't get beer or anything from it."},
            { type: "textMessage", text: "L: Sure, but you have soda at the bar. Doesn't that thing just cost you time to stock?"},
            { type: "textMessage", text: "J: I guess it would, but I don't stock it."},
            { type: "textMessage", text: "M: You don't?"},
            { type: "textMessage", text: "J: Nope."},
            { type: "textMessage", text: "L: Then who does? \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0  \u00A0  \u00A0  \u00A0 \u00A0 \u00A0 \u00A0 M: Then who does?"},
            { type: "textMessage", text: "J: Some guy."},
            { type: "textMessage", text: "L: Some guy? \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0  \u00A0  \u00A0  \u00A0 \u00A0 \u00A0 M: Some guy?"},
            { type: "textMessage", text: "J: Some guy."},
            { type: "textMessage", text: "L: It can't make much money for him either."},
            { type: "textMessage", text: ".............."},
            { type: "textMessage", text: "L: How long has that thing been here, anyway? I've never thought about it before. Is it new?"},
            { type: "textMessage", text: "M: It's covered in dust."},
            { type: "textMessage", text: "J: It's not new."},
            { type: "textMessage", text: ".............."},
            { type: "textMessage", text: "L: How have I never noticed it?"},
            { type: "textMessage", text: "M: Why would you look for a soda machine in a bar? Like you've been saying this whole time."},
            { type: "textMessage", text: "L: Yeah, it's weird that it's here though."},
            { type: "textMessage", text: "M: The soda company probably tries to put one wherever there is space and an outlet,"},
            { type: "textMessage", text: "M: betting some will make money, some will lose money."},
            { type: "textMessage", text: "M: It will all even out in the end and the product will pay for its own advertising."},
            { type: "textMessage", text: "L: Pay for its own advertising?"},
            { type: "textMessage", text: "M: Sure. It's a basic strategy but clever in its own way."},
            { type: "textMessage", text: "L: I don't think a vending machine would make me think about a product. Just about a vending machine."},
            { type: "textMessage", text: "M: But you can't think of a vending machine without thinking about what it has inside."},
            { type: "textMessage", text: "L: I could think of an empty vending machine."},
            { type: "textMessage", text: "M: Why would you?"},
            { type: "textMessage", text: "L: I don't know."},
            { type: "textMessage", text: "M: Would it still be a vending machine at that point?"},
            { type: "textMessage", text: "L: I don't know."},
            { type: "textMessage", text: "J: The soda company doesn't own the vending machine."},
            { type: "textMessage", text: "M: It doesn't?"},
            { type: "textMessage", text: "J: Nope."},
            { type: "textMessage", text: "L: Who does?"},
            { type: "textMessage", text: "J: Some guy."},
            { type: "textMessage", text: "M: Some guy?"},
            { type: "textMessage", text: "J: Yep."},
            { type: "textMessage", text: "L: The same guy that stocks it?"},
            { type: "textMessage", text: "J: The very same."},
            { type: "textMessage", text: "M: Who is he?"},
            { type: "textMessage", text: "J: I don't know much about him. He licenses vending machines in the area"},
            { type: "textMessage", text: "J: and asked if he could put one in my bar not long after I first opened this place up."},
            { type: "textMessage", text: "L: And you said yes?"},
            { type: "textMessage", text: "M: The vending machine is here, isn't it?"},
            { type: "textMessage", text: "L: It is."},
            { type: "textMessage", text: "L: What does it cost, J.?"},
            { type: "textMessage", text: "J: For what?"},
            { type: "textMessage", text: "L: For the machine? How much do you pay the guy?"},
            { type: "textMessage", text: "J: Nothing."},
            { type: "textMessage", text: "L: Nothing?"},
            { type: "textMessage", text: "J: Nothing."},
            { type: "textMessage", text: "L: Nothing..."},
            { type: "textMessage", text: "M: It's big and it has a refrigerator. Doesn't it cost you a lot in electricity?"},
            { type: "textMessage", text: "J: It uses less than you'd think, but I don't pay for its energy costs."},
            { type: "textMessage", text: "M: You don't?"},
            { type: "textMessage", text: "J: Nope."},
            { type: "textMessage", text: "L: Who pays for it, then?"},
            { type: "textMessage", text: "J: The guy. We square up once a year."},
            { type: "textMessage", text: "L: Who uses it?"},
            { type: "textMessage", text: "J: Mostly the in-between kinds of customers. People that are coming in to wait out some weather..."},
            { type: "textMessage", text: "J: People that need to charge their phone..."},
            { type: "textMessage", text: "J: People that come in to ask how to get somewhere or if something is nearby..."},
            { type: "textMessage", text: "J: People that end up in a bar but don't need anything from a bar"},
            { type: "textMessage", text: "J: and want to buy something to justify their visit."},
            { type: "textMessage", text: "M: But you don't get that money."},
            { type: "textMessage", text: "J: No, but they don't need to buy something to justify their visit."},
            { type: "textMessage", text: "L: And it's not much money."},
            { type: "textMessage", text: "M: Yeah you're not missing out on much. How much money could that really make?"},
            { type: "textMessage", text: "J: It's not much but it adds up higher than you'd think. Maybe a couple hundred bucks a year."},
            { type: "textMessage", text: "L: That is high."},
            { type: "textMessage", text: "M: But not much."},
            { type: "textMessage", text: "J: High but not much."},
            { type: "textMessage", text: "M: How much does it cost in electricity?"},
            { type: "textMessage", text: "J: About what it earns."},
            { type: "textMessage", text: "L: So the guy doesn't make anything? That's a bummer."},
            { type: "textMessage", text: "J: He doesn't lose anything, either. Just time."},
            { type: "textMessage", text: "M: We all lose that."},
            { type: "textMessage", text: "L: So what's the point of it?"},
            { type: "textMessage", text: "J: I don't think it has one. Or maybe it is the point."},
            { type: "textMessage", text: "L: It's its own point?"},
            { type: "textMessage", text: "......."},
            { type: "textMessage", text: "M: It's its own point?"},







            { type: "textMessage", text: "M: I am M!"},
            { type: "textMessage", text: "L: I am L!"},
            { type: "textMessage", text: "J: I am J!"},
          ]
        }
      ]
    }
  },
  C02_Bar: {
    // TODO: make 
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        behaviorLoop: [
          { type: "stand",  direction: "right", time: 1800 },
          { type: "stand",  direction: "down", time: 4000 }
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
            ]
          }
        ]
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        behaviorLoop: [
          { type: "stand",  direction: "right", time: 300 },
          { type: "stand",  direction: "down", time: 5000 }
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // back wall
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      //     door is at 6, 3
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,

      // bar
      [utils.asGridCoord(4,4)] : true,
      [utils.asGridCoord(4,5)] : true,
      [utils.asGridCoord(4,6)] : true,
      [utils.asGridCoord(5,6)] : true,
      [utils.asGridCoord(6,6)] : true,
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
    },
    cutsceneSpaces: {
      // cut scene activation point could be thematic to chapter,
      // so moving over to the vending machine for example
      // though, it would be better if
      // [utils.asGridCoord(5,5)]: [
      //   {
      //     events: [
      //       { type: "textMessage", text: "Did this text start right away?"},
      //       { type: "textMessage", text: "If so, great! We've got chapters figured out."},
      //     ]
      //   }
      // ],
      [utils.asGridCoord(6,3)]: [
        {
          events: [
            { who: "hero", type: "walk",  direction: "down" }
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", map: "Kitchen" }
          ]
        }
      ]
    }
  },
  Kitchen: {
    // lowerSrc: "/images/maps/text_scene_test.png",
    // upperSrc: "/images/maps/text_scene_test.png",
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(6),
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "You made it!", faceHero:"npcB" },
            ]
          }
        ]
      })
    }
  },
}
