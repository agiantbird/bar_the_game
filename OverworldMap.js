class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.overrideCheckForFootstepCutscene = config.overrideCheckForFootstepCutscene || false;
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;
    this.useShadow = config.useShadow || false;

    this.isCutscenePlaying = false;
    this.isPaused = false;
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
    if (!this.isCutscenePlaying && !this.overrideCheckForFootstepCutscene && match) {
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
    id: "DemoRoom",
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "Kitchen" }
            // { type: "changeMap", map: "C02_Bar" },
            { type: "changeMap",
              map: "C02_Bar",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // the above 'turns the page' to the next chapter
            // but you need to actually put the text of the next chapter here
            // and not in the C02_Bar object, for example

            // stand command is just to give the change map animation time
            ////// for this chapter, maybe have L at the vending machine, then walk over to sit at the bar
            ///////// .. how to do a sitting down animation ?
            // to resolve before the text kicks on - still, probably good to add 
            // "..."'s at the begginning of each chapter 
            { who: "characterM", type: "stand",  direction: "down", time: 400 },
            // { type: "textMessage", text: "L: It's weird that it's here though-- isn't it, J.?"},
            // { type: "textMessage", text: "J: Why's that?"},
            // { type: "textMessage", text: "L: Well, you serve drinks here. Why would you also have a vending machine people can buy drinks from?"},
            // { type: "textMessage", text: "J: It's just soda; you can't get beer or anything from it."},
            // { type: "textMessage", text: "L: Sure, but you have soda at the bar. Doesn't that thing just cost you time to stock?"},
            // { type: "textMessage", text: "J: I guess it would, but I don't stock it."},
            // { type: "textMessage", text: "M: You don't?"},
            // { type: "textMessage", text: "J: Nope."},
            // { type: "textMessage", text: "L: Then who does? \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0  \u00A0  \u00A0  \u00A0 \u00A0 \u00A0 \u00A0 M: Then who does?"},
            // { type: "textMessage", text: "J: Some guy."},
            // { type: "textMessage", text: "L: Some guy? \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0  \u00A0  \u00A0  \u00A0 \u00A0 \u00A0 M: Some guy?"},
            // { type: "textMessage", text: "J: Some guy."},
            // { type: "textMessage", text: "L: It can't make much money for him either."},
            // { type: "textMessage", text: ".............."},
            // { type: "textMessage", text: "L: How long has that thing been here, anyway? I've never thought about it before. Is it new?"},
            // { type: "textMessage", text: "M: It's covered in dust."},
            // { type: "textMessage", text: "J: It's not new."},
            // { type: "textMessage", text: ".............."},
            // { type: "textMessage", text: "L: How have I never noticed it?"},
            // { type: "textMessage", text: "M: Why would you look for a soda machine in a bar? Like you've been saying this whole time."},
            // { type: "textMessage", text: "L: Yeah, it's weird that it's here though."},
            // { type: "textMessage", text: "M: The soda company probably tries to put one wherever there is space and an outlet,"},
            // { type: "textMessage", text: "M: betting some will make money, some will lose money."},
            // { type: "textMessage", text: "M: It will all even out in the end and the product will pay for its own advertising."},
            // { type: "textMessage", text: "L: Pay for its own advertising?"},
            // { type: "textMessage", text: "M: Sure. It's a basic strategy but clever in its own way."},
            // { type: "textMessage", text: "L: I don't think a vending machine would make me think about a product. Just about a vending machine."},
            // { type: "textMessage", text: "M: But you can't think of a vending machine without thinking about what it has inside."},
            // { type: "textMessage", text: "L: I could think of an empty vending machine."},
            // { type: "textMessage", text: "M: Why would you?"},
            // { type: "textMessage", text: "L: I don't know."},
            // { type: "textMessage", text: "M: Would it still be a vending machine at that point?"},
            // { type: "textMessage", text: "L: I don't know."},
            // { type: "textMessage", text: "J: The soda company doesn't own the vending machine."},
            // { type: "textMessage", text: "M: It doesn't?"},
            // { type: "textMessage", text: "J: Nope."},
            // { type: "textMessage", text: "L: Who does?"},
            // { type: "textMessage", text: "J: Some guy."},
            // { type: "textMessage", text: "M: Some guy?"},
            // { type: "textMessage", text: "J: Yep."},
            // { type: "textMessage", text: "L: The same guy that stocks it?"},
            // { type: "textMessage", text: "J: The very same."},
            // { type: "textMessage", text: "M: Who is he?"},
            // { type: "textMessage", text: "J: I don't know much about him. He licenses vending machines in the area"},
            // { type: "textMessage", text: "J: and asked if he could put one in my bar not long after I first opened this place up."},
            // { type: "textMessage", text: "L: And you said yes?"},
            // { type: "textMessage", text: "M: The vending machine is here, isn't it?"},
            // { type: "textMessage", text: "L: It is."},
            // { type: "textMessage", text: "L: What does it cost, J.?"},
            // { type: "textMessage", text: "J: For what?"},
            // { type: "textMessage", text: "L: For the machine? How much do you pay the guy?"},
            // { type: "textMessage", text: "J: Nothing."},
            // { type: "textMessage", text: "L: Nothing?"},
            // { type: "textMessage", text: "J: Nothing."},
            // { type: "textMessage", text: "L: Nothing..."},
            // { type: "textMessage", text: "M: It's big and it has a refrigerator. Doesn't it cost you a lot in electricity?"},
            // { type: "textMessage", text: "J: It uses less than you'd think, but I don't pay for its energy costs."},
            // { type: "textMessage", text: "M: You don't?"},
            // { type: "textMessage", text: "J: Nope."},
            // { type: "textMessage", text: "L: Who pays for it, then?"},
            // { type: "textMessage", text: "J: The guy. We square up once a year."},
            // { type: "textMessage", text: "L: Who uses it?"},
            // { type: "textMessage", text: "J: Mostly the in-between kinds of customers. People that are coming in to wait out some weather..."},
            // { type: "textMessage", text: "J: People that need to charge their phone..."},
            // { type: "textMessage", text: "J: People that come in to ask how to get somewhere or if something is nearby..."},
            // { type: "textMessage", text: "J: People that end up in a bar but don't need anything from a bar"},
            // { type: "textMessage", text: "J: and want to buy something to justify their visit."},
            // { type: "textMessage", text: "M: But you don't get that money."},
            // { type: "textMessage", text: "J: No, but they don't need to buy something to justify their visit."},
            // { type: "textMessage", text: "L: And it's not much money."},
            // { type: "textMessage", text: "M: Yeah you're not missing out on much. How much money could that really make?"},
            // { type: "textMessage", text: "J: It's not much but it adds up higher than you'd think. Maybe a couple hundred bucks a year."},
            // { type: "textMessage", text: "L: That is high."},
            // { type: "textMessage", text: "M: But not much."},
            // { type: "textMessage", text: "J: High but not much."},
            // { type: "textMessage", text: "M: How much does it cost in electricity?"},
            // { type: "textMessage", text: "J: About what it earns."},
            // { type: "textMessage", text: "L: So the guy doesn't make anything? That's a bummer."},
            // { type: "textMessage", text: "J: He doesn't lose anything, either. Just time."},
            // { type: "textMessage", text: "M: We all lose that."},
            { type: "textMessage", text: "L: So what's the point of it?"},
            { type: "textMessage", text: "J: I don't think it has one. Or maybe it is the point."},
            { type: "textMessage", text: "L: It's its own point?"},
            { type: "textMessage", text: "......."},
            { type: "textMessage", text: "M: It vends soda."},
          ]
        }
      ]
    }
  },
  C02_Bar: {
    id: "C02_Bar",
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            //{ type: "changeMap", map: "C03_K_Bedroom_Pt_1" },
            { type: "changeMap",
              map: "C03_K_Bedroom_Pt_1",
              x: utils.withGrid(2),
              y: utils.withGrid(5),
              direction: "down"
            },
            // need to also load up text and events for the next scene
            // { type: "changeMap", map: "C03_K_Bedroom_Pt_2" },
            // { who: "hero", type: "walk",  direction: "down" },
            // { who: "hero", type: "walk",  direction: "right" },
          ]
        }
      ]
    }
  },
  C03_K_Bedroom_Pt_1: {
    id: "C03_K_Bedroom_Pt_1",
    lowerSrc: "/images/maps/k_bedroom_lower_with_furniture_no_weather_machine.png",
    // upperSrc: "/images/maps/text_scene_test.png",
    upperSrc: "/images/maps/k_bedroom_upper_clean_wip.png",
    // lowerSrc: "/images/maps/KitchenLower.png",
    // upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(2),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc1_gray.png"
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

      // bed and nightstand
      [utils.asGridCoord(1,7)] : true,
      [utils.asGridCoord(2,7)] : true,
      [utils.asGridCoord(1,8)] : true,

      // desk
      [utils.asGridCoord(5,9)] : true,
      [utils.asGridCoord(6,9)] : true,

      // lamp
      [utils.asGridCoord(9,7)] : true,
      [utils.asGridCoord(10,8)] : true,
      [utils.asGridCoord(10,9)] : true,

      // weather machine
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(8,5)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(9,4)] : true,
      [utils.asGridCoord(9,5)] : true,
      [utils.asGridCoord(9,6)] : true,
    },
    cutsceneSpaces: {
    // cutsceneSpaces: {
      [utils.asGridCoord(2,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1800 },
            { type: "textMessage", text: "....*POP*....*FIZZ*....*POP*...."},
            { type: "textMessage", text: "K: ....????"},
            { who: "hero", type: "stand",  direction: "right", time: 600 },
            { type: "textMessage", text: "K: ....!!!!"},
            { who: "hero", type: "stand",  direction: "down", time: 100 },
            { type: "changeMap",
              map: "C03_K_Bedroom_Pt_2",
              x: utils.withGrid(2),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "changeMap", map: "C03_K_Bedroom_Pt_2" },
          ],
        },
      ],
    },
  },
  C03_K_Bedroom_Pt_2: {
    id: "C03_K_Bedroom_Pt_2",
    lowerSrc: "/images/maps/k_bedroom_lower_with_furniture_with_weather_machine.png",
    // upperSrc: "/images/maps/text_scene_test.png",
    upperSrc: "/images/maps/k_bedroom_upper_clean_wip.png",
    // lowerSrc: "/images/maps/KitchenLower.png",
    // upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(2),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc1_gray.png",
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

      // bed and nightstand
      [utils.asGridCoord(1,7)] : true,
      [utils.asGridCoord(2,7)] : true,
      [utils.asGridCoord(1,8)] : true,

      // desk
      [utils.asGridCoord(5,9)] : true,
      [utils.asGridCoord(6,9)] : true,

      // lamp
      [utils.asGridCoord(9,7)] : true,
      [utils.asGridCoord(10,8)] : true,
      [utils.asGridCoord(10,9)] : true,

      // weather machine
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(8,5)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(9,4)] : true,
      [utils.asGridCoord(9,5)] : true,
      [utils.asGridCoord(9,6)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(6,3)]: [
        {
          events: [
            // { type: "changeMap", map: "C04_Bar" },
            { type: "changeMap",
              map: "C04_Bar",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },

            { who: "hero", type: "stand",  direction: "right", time: 1800 },
            // { type: "textMessage", text: "L: You've had this place a long time, huh?"},
            // { type: "textMessage", text: "J: I suppose I have."},
            // { type: "textMessage", text: "L: What was here beforehand?"},
            // { type: "textMessage", text: "J: Nothing."},
            // { type: "textMessage", text: "L: Nothing?"},
            // { type: "textMessage", text: "J: Nothing."},
            // { type: "textMessage", text: "L: So you built this place?"},
            // { type: "textMessage", text: "J: No."},
            // { type: "textMessage", text: "L: No?"},
            // { type: "textMessage", text: "J: The building was here. There just wasn't a business operating in it, which is why I could buy it."},
            // { type: "textMessage", text: "L: What was here before you and before it was nothing?"},
            // { type: "textMessage", text: "J: I don't know; I didn't ask. There was some furniture I kept and some that I got rid of."},
            // { type: "textMessage", text: "I ordered the bar you're sitting at and a company installed it."},
            // { type: "textMessage", text: "L: What furniture did you keep?"},
            // { type: "textMessage", text: "J: Those tables and chairs by the door. Those magazine racks I keep the spare menus in."},
            // { type: "textMessage", text: "L: But those could have been for any business..."},
            // { type: "textMessage", text: "J: I guess so."},
            // { type: "textMessage", text: ".........."},
            // { type: "textMessage", text: ".........."},
            { type: "textMessage", text: "L: Have you looked in the walls?"},
            { type: "textMessage", text: "J: In the walls?"},
            { type: "textMessage", text: "L: Yes."},
            { type: "textMessage", text: "J: Why would I look in the walls?"},
            // { type: "textMessage", text: "L: I don't know..."},
            // { type: "textMessage", text: "L: Because you looked at everything outside of them, I guess."},
          ],
        },
      ],
    },
  },
  C04_Bar: {
    id: "C04_Bar",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      emptyStool6: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
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
      [utils.asGridCoord(6,3)]: [
        {
          events: [
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C05_Bar",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "changeMap", map: "C05_Bar" },
            // { type: "textMessage", text: "M: What are you looking at?"},
            // { type: "textMessage", text: "J: Nothing."},
            // { type: "textMessage", text: "M: Oh, ok."},
            // { type: "textMessage", text: "J: But I feel like there isn't supposed to be nothing there. Wasn't there something there?"},
            // { type: "textMessage", text: "M: There was something there?"},
            // { type: "textMessage", text: "L: There's a wall there."},
            // { type: "textMessage", text: "M: A wall isn't something, it's a place for something."},
            // { type: "textMessage", text: "L: It's a 'there' but not a thing?"},
            // { type: "textMessage", text: "M: Right, and it is an 'is'."},
            // { type: "textMessage", text: "L: It is?"},
            // { type: "textMessage", text: "J: I think there was a window there."},
            // { type: "textMessage", text: "M: A window?"},
            // { type: "textMessage", text: "J: A window."},
            // { type: "textMessage", text: "M: There can't have been a window there. There's a wall there."},
            { type: "textMessage", text: "L: Maybe someone took it."},
            { type: "textMessage", text: "J: Took it?"},
            { type: "textMessage", text: "L: Yeah, stole it."},
            { type: "textMessage", text: "M: How do you steal a window?"},
            { type: "textMessage", text: "L: You cut it out of the wall."},
            // { type: "textMessage", text: "M: Then there'd be a window-sized window cut out of the wall."},
            // { type: "textMessage", text: "J: I don't think it was stolen."},
            // { type: "textMessage", text: "L: You should have put bars over it."},
            // { type: "textMessage", text: "M: Do you remember what was outside?"},
            // { type: "textMessage", text: "J: Outside the window?"},
            // { type: "textMessage", text: "M: Yes, when you looked through the window."},
            // { type: "textMessage", text: "J: Not really... No, I guess not."},
            // { type: "textMessage", text: "M: Then it probably was never there. Maybe you had a window there in another bar you tended."},
            // { type: "textMessage", text: "J: Yeah, maybe."},
          ]
        }
      ]
    }
  },
  C05_Bar: {
    id: "C05_Bar",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },  
  C06_Bar_Pt1: {
    id: "C06_Bar_Pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterDuckWorrier: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(11),
        src: "/images/characters/people/hero_gray.png",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 300 },
        //   { type: "stand",  direction: "down", time: 5000 }
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I fret over ducks!", faceHero: "characterDuckWorrier" },
              // { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool7: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "down", time: 1800 },
            { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            { who: "characterDuckWorrier", type: "stand",  direction: "up", time: 1800 },
            { type: "textMessage", text: "........."},
            { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            { who: "characterDuckWorrier", type: "walk",  direction: "right" },
            { who: "characterDuckWorrier", type: "walk",  direction: "left" },
            { who: "characterDuckWorrier", type: "walk",  direction: "left" },
            { who: "characterDuckWorrier", type: "walk",  direction: "right" },
            { who: "characterDuckWorrier", type: "walk",  direction: "right" },
            { who: "characterDuckWorrier", type: "walk",  direction: "left" },
            { who: "characterDuckWorrier", type: "stand",  direction: "down", time: 1800 },
            { who: "characterDuckWorrier", type: "stand",  direction: "up", time: 1800 },
            { who: "characterDuckWorrier", type: "stand",  direction: "down", time: 1800 },
            { who: "characterDuckWorrier", type: "stand",  direction: "up", time: 1800 },
            { type: "textMessage", text: "Customer: ...excuse me?"},
            // { type: "textMessage", text: "J: Yes?"},
            // { type: "textMessage", text: "............"},
            // { type: "textMessage", text: "J: ...something to drink?"},
            // { type: "textMessage", text: "Customer: No, thank you. I was just wondering-- you own this bar, yes?"},
            // { type: "textMessage", text: "J: Yes."},
            // { type: "textMessage", text: "Customer: And you're here most days?"},
            // { type: "textMessage", text: "J: Yes."},
            // { type: "textMessage", text: "Customer: And have you seen a duck?"},
            // { type: "textMessage", text: "J: A duck?"},
            // { type: "textMessage", text: "Customer: Yes."},
            // { type: "textMessage", text: "J: Yes, I've seen a duck before."},
            // { type: "textMessage", text: "Customer: No, not a duck."},
            // { type: "textMessage", text: "J: Not a duck?"},
            // { type: "textMessage", text: "Customer: I mean not any duck. A duck in your parking lot."},
            // { type: "textMessage", text: "J: Oh!"},
            // { type: "textMessage", text: "Customer: Oh? Then you've seen it?"},
            // { type: "textMessage", text: "J: No, not once."},
            // { type: "textMessage", text: "Customer: Oh. I thought maybe you adopted the duck or maybe that you killed it."},
            // { type: "textMessage", text: "I used to see it everyday in your parking lot, but I haven't for a week or so."},
            // { type: "textMessage", text: "J: Nope."},
            // { type: "textMessage", text: "Customer: Perhaps it migrated."},
            // { type: "textMessage", text: "J: About the time for it, I suppose."},
            // { type: "textMessage", text: "Customer: I don't like the duck very much."},
            // { type: "textMessage", text: "J: No?"},
            // { type: "textMessage", text: "Customer: No. I'm nervous it might fly at my head or peck at my feet each time I walk past it."},
            // { type: "textMessage", text: "But I also worry about the duck from time to time the rest of the day once I'm away from it."},
            // { type: "textMessage", text: "J: It must be a relief to you that it's gone?"},
            // { type: "textMessage", text: "Customer: No... No, I don't think so. Well, thank you."},
            // { type: "textMessage", text: "............"},
            // { type: "textMessage", text: "............"},
            // { who: "characterDuckWorrier", type: "stand",  direction: "left", time: 1800 },
            // { type: "textMessage", text: "Customer: Ah!"},
            // { who: "characterDuckWorrier", type: "walk",  direction: "left" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "left" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "left" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "left" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "up" },
            // { who: "characterDuckWorrier", type: "stand",  direction: "up", time: 1800 },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "right" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "right" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "right" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "right" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // { who: "characterDuckWorrier", type: "walk",  direction: "down" },
            // characterDuckWorrier
            { type: "changeMapNoTransition", map: "C06_Bar_Pt2" },
            // { type: "textMessage", text: "TEST RAISE SNAKES"},
            // { type: "textMessage", text: "K: ....????"},
            // { who: "hero", type: "stand",  direction: "right", time: 600 },
            // { type: "textMessage", text: "K: ....!!!!"},
            // { who: "hero", type: "stand",  direction: "down", time: 100 },
            // { type: "changeMap", map: "C03_K_Bedroom_Pt_2" },
          ],
        },
      ],
    },
    // overrideCheckForFootstepCutscene: false,
  },
  C06_Bar_Pt2: {
    id: "C06_Bar_Pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool7: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C07_Bar_Pt1" },
            { type: "changeMap",
              map: "C07_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },

            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
    // overrideCheckForFootstepCutscene: false,
  },
  C07_Bar_Pt1: {
    id: "C07_Bar_Pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(11),
        src: "/images/characters/people/hero_gray.png",
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
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "down", time: 1800 },
            { who: "characterL", type: "walk",  direction: "up" },
            { who: "characterL", type: "walk",  direction: "up" },
            { who: "characterL", type: "walk",  direction: "up" },
            { who: "characterL", type: "walk",  direction: "left" },
            { who: "characterL", type: "walk",  direction: "left" },
            { who: "characterL", type: "walk",  direction: "left" },
            { who: "characterL", type: "walk",  direction: "up" },
            { who: "characterL", type: "walk",  direction: "up" },
            { who: "characterL", type: "walk",  direction: "up" },
            { who: "characterL", type: "stand",  direction: "right", time: 400 },
            { type: "textMessage", text: "L: Your sign is out."},
            { who: "hero", type: "stand",  direction: "left", time: 400 },

            { type: "changeMapNoTransition", map: "C07_Bar_Pt2" },
            // { type: "changeMapNoTransition", map: "C06_Bar_Pt2" },
            // { type: "textMessage", text: "TEST RAISE SNAKES"},
            // { type: "textMessage", text: "K: ....????"},
            // { who: "hero", type: "stand",  direction: "right", time: 600 },
            // { type: "textMessage", text: "K: ....!!!!"},
            // { who: "hero", type: "stand",  direction: "down", time: 100 },
            // { type: "changeMap", map: "C03_K_Bedroom_Pt_2" },
          ],
        },
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", map: "C06_Bar_Pt1" },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C07_Bar_Pt2: {
    id: "C07_Bar_Pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      vendingMachineHitBox: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(3),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
        talking: [
          {
            events: [
              { type: "textMessage", text: "Why not buy a water, the wet stuff we all love to drink?" },
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            // { who: "characterL", type: "stand",  direction: "right", time: 400 },
            // { who: "hero", type: "stand",  direction: "left", time: 400 },
            // { type: "textMessage", text: "M: What sign?"},
            // { type: "textMessage", text: "J: The bar's sign."},
            { type: "textMessage", text: "M: The bar has a sign?"},
            { type: "textMessage", text: "J: Yep."},
            { type: "textMessage", text: "M: And the sign is out?"},
            { type: "textMessage", text: "L: It's not lit up."},
            { type: "textMessage", text: "M: It lights up?"},
            // { type: "textMessage", text: "J: Yep. I just fipped the switch for it. Thanks, L."},
            // { type: "textMessage", text: "M: Is it big?"},
            // { type: "textMessage", text: "L: Pretty big."},
            // { type: "textMessage", text: "J: About sign-sized."},
            // { type: "textMessage", text: "M: Where is it?"},
            // { who: "characterL", type: "stand",  direction: "left", time: 800 },
            // { who: "characterL", type: "stand",  direction: "down", time: 800 },
            // { who: "characterL", type: "stand",  direction: "left", time: 800 },
            // { who: "characterL", type: "stand",  direction: "down", time: 800 },
            // { who: "characterL", type: "stand",  direction: "left", time: 800 },
            // { type: "textMessage", text: "L: It'd be past right about there."},
            // { who: "characterM", type: "stand",  direction: "left", time: 2000 },
            // { type: "textMessage", text: "M: I've never seen it."},
            // { type: "textMessage", text: "L: You mean you've never noticed it?"},
            // { type: "textMessage", text: "M: No."},


            // { who: "characterM", type: "walk",  direction: "up" },
            // { who: "characterL", type: "walk",  direction: "up" },
            // { who: "characterL", type: "walk",  direction: "up" },
            // { who: "characterL", type: "walk",  direction: "left" },
            // { who: "characterL", type: "walk",  direction: "left" },
            // { who: "characterL", type: "walk",  direction: "left" },
            // { who: "characterL", type: "walk",  direction: "up" },
            // { who: "characterL", type: "walk",  direction: "up" },
            // { who: "characterL", type: "walk",  direction: "up" },
            // { who: "characterL", type: "stand",  direction: "right", time: 400 },
            // { type: "textMessage", text: "L: Your sign is out."},
            // { who: "hero", type: "stand",  direction: "left", time: 400 },

            // { type: "changeMapNoTransition", map: "C07_Bar_Pt2" },
            // { type: "changeMapNoTransition", map: "C06_Bar_Pt2" },
            // { type: "textMessage", text: "K: ....????"},
            // { who: "hero", type: "stand",  direction: "right", time: 600 },
            // { type: "textMessage", text: "K: ....!!!!"},
            // { who: "hero", type: "stand",  direction: "down", time: 100 },
            // { type: "changeMap", map: "C03_K_Bedroom_Pt_2" },
          ],
        },
      ],
      [utils.asGridCoord(6,3)]: [
        {
          events: [
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [

            // { type: "changeMap", map: "C08_Black_Background_Text_Scene" },
            { type: "changeMap",
              map: "C08_Black_Background_Text_Scene",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C08_Black_Background_Text_Scene: {
    id: "C08_Black_Background_Text_Scene",
    // lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    // upperSrc: "/images/maps/C01_BarUpper.png",
    lowerSrc: "/images/maps/all_black_screen.png",
    upperSrc: "/images/maps/all_black_screen.png",
    // lowerSrc: "/images/maps/gif_test.gif",
    // upperSrc: "/images/maps/gift_test.gif",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            // { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "What would you say to yourself, . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . if you could talk to yourself ? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            // { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . I can talk to myself."},
            // { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            // { type: "textMessage", text: ". . . . But as a stranger, I mean . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            // { type: "textMessage", text: ". . . . . . . As an objective party . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            // { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            // { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . I don't talk to strangers ."},
            // { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},

            // { type: "changeMap", map: "sattelite_animated_background_frame_1_test" },
            { type: "changeMap",
              map: "sattelite_animated_background_frame_1_test",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  sattelite_animated_background_frame_1_test: {
    id: "sattelite_animated_background_frame_1_test",
    lowerSrc: "/images/maps/sattelite_animated_background_frame_1_test.png",
    upperSrc: "/images/maps/sattelite_animated_background_frame_1_test.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "changeMapNoTransition", map: "sattelite_animated_background_frame_2_test" },
          ],
        },
      ]
    }
  },
  sattelite_animated_background_frame_2_test: {
    id: "sattelite_animated_background_frame_2_test",
    lowerSrc: "/images/maps/sattelite_animated_background_frame_2_test.png",
    upperSrc: "/images/maps/sattelite_animated_background_frame_2_test.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "changeMapNoTransition", map: "sattelite_animated_background_frame_3_test" },
          ],
        },
      ]
    }
  },
  sattelite_animated_background_frame_3_test: {
    id: "sattelite_animated_background_frame_3_test",
    lowerSrc: "/images/maps/sattelite_animated_background_frame_1_test.png",
    upperSrc: "/images/maps/sattelite_animated_background_frame_1_test.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "changeMapNoTransition", map: "sattelite_animated_background_frame_4_test" },
          ],
        },
      ]
    }
  },
  sattelite_animated_background_frame_4_test: {
    id: "sattelite_animated_background_frame_4_test",
    lowerSrc: "/images/maps/sattelite_animated_background_frame_2_test.png",
    upperSrc: "/images/maps/sattelite_animated_background_frame_2_test.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "changeMapNoTransition", map: "sattelite_animated_background_frame_5_test" },
          ],
        },
      ]
    }
  },
  sattelite_animated_background_frame_5_test: {
    id: "sattelite_animated_background_frame_5_test",
    lowerSrc: "/images/maps/sattelite_animated_background_frame_1_test.png",
    upperSrc: "/images/maps/sattelite_animated_background_frame_1_test.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "changeMapNoTransition", map: "sattelite_animated_background_frame_6_test" },
          ],
        },
      ]
    }
  },
  sattelite_animated_background_frame_6_test: {
    id: "sattelite_animated_background_frame_6_test",
    lowerSrc: "/images/maps/sattelite_animated_background_frame_2_test.png",
    upperSrc: "/images/maps/sattelite_animated_background_frame_2_test.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "changeMapNoTransition", map: "C09_Space_Sattelite_Scene_Pt1" },
          ],
        },
      ]
    }
  },
  C09_Space_Sattelite_Scene_Pt1: {
    id: "C09_Space_Sattelite_Scene_Pt1",
    // lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    // upperSrc: "/images/maps/C01_BarUpper.png",
    lowerSrc: "/images/maps/earth_sattelite_wip.png",
    upperSrc: "/images/maps/earth_sattelite_wip.png",
    // lowerSrc: "/images/maps/gif_test.gif",
    // upperSrc: "/images/maps/gift_test.gif",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "textMessage", text: "- - - - - - EARTH'S EXOSPHERE, 1960 A.D. - - - - - -"},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "There is a box above the Earth."},
            { type: "textMessage", text: "There is a television camera sticking out of the box."},
            { type: "textMessage", text: "The box orbits the Earth 1,302 times."},
            { type: "textMessage", text: "The box takes 23,000 pictures."},
            { type: "textMessage", text: "The box has a geocentric reference system."},
            { type: "textMessage", text: "The box goes north until it is south, then south until it is north."},
            { type: "textMessage", text: "The box records images on tape recorders."},
            { type: "textMessage", text: "The box sends images back to Earth."},
            { type: "textMessage", text: "There is a cyclone over the gulf of Alaska."},
            { type: "textMessage", text: "There are cloud streets in the Caribbean sea."},
            { type: "textMessage", text: "There is a tornado-producing cloud mass."},
            { type: "textMessage", text: "There is the midwest storm of April 1, 1960."},
            { type: "textMessage", text: "There are some problems locating each picture's elements geographically."},
            { type: "textMessage", text: "There are forces at work."},
            { type: "textMessage", text: "There are positions in space."},
            { type: "textMessage", text: "There are points in time."},
            { type: "textMessage", text: "There are 23,000 pictures!"},
            { type: "textMessage", text: "There are clouds in the way."},
            { type: "textMessage", text: "There is what looks like snow."},
            { type: "textMessage", text: "There is a planet looking at itself."},

            // { type: "changeMap", map: "C10_Bar_Pt1" },
            { type: "changeMap",
              map: "C10_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C10_Bar_Pt1: {
    id: "C10_Bar_Pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      fruitEnjoyer1: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(12),
        src: "/images/characters/people/hero_gray.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "I love fruit and my wife!", faceHero: "fruitEnjoyer1" },
            ]
          }
        ]
      }),
     fruitEnjoyer2: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(11),
        src: "/images/characters/people/npc1_gray.png",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 300 },
        //   { type: "stand",  direction: "down", time: 5000 }
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I love fruit and my husband!", faceHero: "fruitEnjoyer2" },
              // { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "characterL", type: "stand",  direction: "right", time: 50 },
            { who: "fruitEnjoyer2", type: "stand",  direction: "up", time: 10 },
            { who: "hero", type: "stand",  direction: "down", time: 1800 },
            { who: "fruitEnjoyer2", type: "walk",  direction: "up" },
            { who: "fruitEnjoyer2", type: "walk",  direction: "up" },
            { who: "fruitEnjoyer2", type: "walk",  direction: "right" },
            { who: "fruitEnjoyer2", type: "walk",  direction: "up" },
            { who: "fruitEnjoyer2", type: "stand",  direction: "up", time: 10 },
            { who: "fruitEnjoyer1", type: "walk",  direction: "up" },
            { who: "fruitEnjoyer1", type: "walk",  direction: "up" },
            { who: "fruitEnjoyer1", type: "walk",  direction: "up" },
            { who: "fruitEnjoyer1", type: "walk",  direction: "up" },
            { type: "textMessage", text: "Customer: Two beers please! And is it okay if we eat this in here?"},
            { type: "textMessage", text: "It's cut up fruit that we bought at the grocery store across the street."},
            { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            { type: "textMessage", text: "J: Of course. Enjoy."},
            { type: "changeMapNoTransition", map: "C10_Bar_Pt2" },
          ],
        },
      ],
    },
    // overrideCheckForFootstepCutscene: false,
  },
  C10_Bar_Pt2: {
    id: "C10_Bar_Pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      fruitEnjoyer1: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/l_sitting.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "I love fruit and my wife!", faceHero: "fruitEnjoyer1" },
            ]
          }
        ]
      }),
     fruitEnjoyer2: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/characters/people/o_sitting.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "I love fruit and my husband!", faceHero: "fruitEnjoyer2" },
            ]
          }
        ]
      }),
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "fruitEnjoyer2", type: "stand",  direction: "up", time: 10 },
            { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "stand",  direction: "down", time: 1800 },
            { who: "characterL", type: "stand",  direction: "down", time: 2000 },
            { who: "characterL", type: "stand",  direction: "right", time: 2000 },
            { who: "characterL", type: "stand",  direction: "down", time: 2000 },
            { who: "characterL", type: "stand",  direction: "right", time: 2000 },
            { type: "textMessage", text: "L: Hey, how come you don't sell fruit at the bar?"},
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "J: Here?"},
            { type: "textMessage", text: "L: Yeah. It looks like it'd go really well with beer."},
            { type: "textMessage", text: "J: Why should I sell fruit here? If the grocery store sells fruit?"},
            { type: "textMessage", text: "L: That's a good point. I guess there's no need to sell what the grocery store sells."},
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "hero", type: "walk",  direction: "down", time: 1000 },
            { who: "hero", type: "stand",  direction: "down", time: 100 },
            { type: "textMessage", text: "J: Excuse me, the grocery store across the road-- it doesn't happen to sell beer does it?"},
            { who: "fruitEnjoyer1", type: "stand",  direction: "right", time: 1000 },
            { who: "fruitEnjoyer2", type: "stand",  direction: "left", time: 1000 },
            { who: "fruitEnjoyer1", type: "stand",  direction: "up", time: 500 },
            { who: "fruitEnjoyer2", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text: "Customer: No, no it doesn't. No beer or wine at all."},
            { type: "textMessage", text: "J: I see. Thank you."},
            { type: "changeMapNoTransition", map: "C10_Bar_Pt3" },
          ],
        },
      ],
    },
  },
  C10_Bar_Pt3: {
    id: "C10_Bar_Pt3",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      fruitEnjoyer1: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/l_sitting.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "I love fruit and my wife!", faceHero: "fruitEnjoyer1" },
            ]
          }
        ]
      }),
     fruitEnjoyer2: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/characters/people/o_sitting.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "I love fruit and my husband!", faceHero: "fruitEnjoyer2" },
            ]
          }
        ]
      }),
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C11_Bar_Pt1" },
            { type: "changeMap",
              map: "C11_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ]
        }
      ]
    },
  },
  C11_Bar_Pt1: {
    id: "C11_Bar_Pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
          // { type: "textMessage", text: "L: Does it seem dirty in here?"},
          // { type: "textMessage", text: "M: Dirtier than usual?"},
          // { type: "textMessage", text: "J: How dirty is it in here, usually?"},
          // { type: "textMessage", text: "L: No, not dirtier than usual, I don't think."},
          // { type: "textMessage", text: "Or, I suppose, maybe. I don't think it's usually dirty in here."},
          // { type: "textMessage", text: "J: I cleaned everything the same as I always do."},
          // { type: "textMessage", text: "M: Thing's could always be cleaner."},
          // { type: "textMessage", text: "L: That's true."},
          // { type: "textMessage", text: "M: But they could always be dirtier."},
          // { type: "textMessage", text: "L: That's also true."},
          { type: "textMessage", text: "J: Maybe it's the lighting?"},
          { type: "textMessage", text: "L: The lighting?"},
          { type: "textMessage", text: "J: Maybe it's too dim in here."},
          // TODO: "I'll turn up the lights" is not in the book. In the book, M opens the blinds.
          // It'd be nice in the game to also show what's happening visually, but for MVP
          // I'm just having him say this, then walk over to a wall, and then changing the hue in the
          // the bar.
          { type: "textMessage", text: "M: That's easy enough to prove. I'll turn up the lights."},
          { who: "characterM", type: "stand",  direction: "down", time: 1000 },
          { who: "characterM", type: "stand",  direction: "left", time: 1000 },
          { type: "changeMapNoTransition", map: "C11_Bar_Pt2" }
          ],
        },
      ],
    }
  },
  C11_Bar_Pt2: {
    id: "C11_Bar_Pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      characterM: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(4),
        src: "/images/characters/people/hero_gray.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 1800 },
          // { type: "stand",  direction: "down", time: 4000 }
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
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            { who: "characterM", type: "walk",  direction: "down" },
            { who: "characterM", type: "walk",  direction: "down" },
            { who: "characterM", type: "walk",  direction: "down" },
            { who: "characterM", type: "walk",  direction: "down" },
            { who: "characterM", type: "walk",  direction: "down" },
            { who: "characterM", type: "walk",  direction: "right" },
            { who: "characterM", type: "stand",  direction: "right", time: 2000 },
            { who: "characterM", type: "stand",  direction: "down", time: 2000 },
            {type: "changeMapNoTransition", map: "C11_Bar_Pt3"}
          ],
        },
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", map: "C06_Bar_Pt1" },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C11_Bar_Pt3: {
    id: "C11_Bar_Pt3",
    // TODO: Need to also lighten the sprites in this chapter
    // with the same shade (people and stools)
    // this could also be one of two brightenings (hence, half bright, implying full bright.)
    lowerSrc: "/images/maps/C11_BarLowerHalfBright.png",
    upperSrc: "/images/maps/C11_BarUpperHalfBright.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(9),
        src: "/images/characters/people/hero_gray.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 1800 },
          // { type: "stand",  direction: "down", time: 4000 }
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
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            { type: "textMessage", text: "J: Does it seem cleaner in here?" },
            { type: "textMessage", text: "L: It seems different." },
            { type: "textMessage", text: "M: Different in a way that seems more clean or less clean?" },
            { type: "textMessage", text: "L: I don't know." },
            { type: "textMessage", text: "It's too different to tell." },
            {type: "changeMapNoTransition", map: "C11_Bar_Pt4"},


            // { type: "textMessage", text: "We're in part 3" },
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "right" },
            // { who: "characterM", type: "stand",  direction: "right", time: 2000 },
            // { who: "characterM", type: "stand",  direction: "down", time: 2000 },
            // {type: "changeMapNoTransition", map: "C11_Bar_Pt3"}
          ],
        },
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C11_Bar_Pt4: {
    id: "C11_Bar_Pt4",
    // TODO: Need to also lighten the sprites in this chapter
    // with the same shade (people and stools)
    // this could also be one of two brightenings (hence, half bright, implying full bright.)
    lowerSrc: "/images/maps/C11_BarLowerHalfBright.png",
    upperSrc: "/images/maps/C11_BarUpperHalfBright.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(9),
        src: "/images/characters/people/hero_gray.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 1800 },
          // { type: "stand",  direction: "down", time: 4000 }
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
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C12_Bar_Pt1" },
            { type: "changeMap",
              map: "C12_Bar_Pt1",
              x: utils.withGrid(11),
              y: utils.withGrid(11),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C12_Bar_Pt1: {
    id: "C12_Bar_Pt1",
    // lowerSrc: "/images/maps/parking_lot_wip.png",
    lowerSrc: "/images/maps/testtest.png",
    // upperSrc: "/images/maps/parkinglot_upper.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(11),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
      // edges of level
      // [utils.asGridCoord(0,3)] : true,
      // [utils.asGridCoord(0,4)] : true,
      // [utils.asGridCoord(0,5)] : true,
      // [utils.asGridCoord(0,6)] : true,
      // [utils.asGridCoord(0,7)] : true,
      // [utils.asGridCoord(0,8)] : true,
      // [utils.asGridCoord(0,9)] : true,
      // [utils.asGridCoord(1,10)] : true,
      // [utils.asGridCoord(2,10)] : true,
      // [utils.asGridCoord(3,10)] : true,
      // [utils.asGridCoord(4,10)] : true,
      // [utils.asGridCoord(6,10)] : true,
      // [utils.asGridCoord(7,10)] : true,
      // [utils.asGridCoord(8,10)] : true,
      // [utils.asGridCoord(9,10)] : true,
      // [utils.asGridCoord(10,10)] : true,
      // [utils.asGridCoord(11,9)] : true,
      // [utils.asGridCoord(11,8)] : true,
      // [utils.asGridCoord(11,7)] : true,
      // [utils.asGridCoord(11,6)] : true,
      // [utils.asGridCoord(11,5)] : true,
      // [utils.asGridCoord(11,4)] : true,
      // // back wall
      // [utils.asGridCoord(1,3)] : true,
      // [utils.asGridCoord(2,3)] : true,
      // [utils.asGridCoord(3,3)] : true,
      // [utils.asGridCoord(4,3)] : true,
      // [utils.asGridCoord(5,3)] : true,
      // //     door is at 6, 3
      // [utils.asGridCoord(7,3)] : true,
      // [utils.asGridCoord(8,3)] : true,
      // [utils.asGridCoord(9,3)] : true,
      // [utils.asGridCoord(10,3)] : true,

      // // bar
      // [utils.asGridCoord(4,4)] : true,
      // [utils.asGridCoord(4,5)] : true,
      // [utils.asGridCoord(4,6)] : true,
      // [utils.asGridCoord(5,6)] : true,
      // [utils.asGridCoord(6,6)] : true,
      // [utils.asGridCoord(7,6)] : true,
      // [utils.asGridCoord(8,6)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,11)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "test test" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { who: "hero", type: "walk",  direction: "left" },
            // { who: "hero", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "left" },
            // { who: "hero", type: "walk",  direction: "left" },
            // { who: "hero", type: "walk",  direction: "up" },
            // { who: "hero", type: "walk",  direction: "up" },
            // { who: "hero", type: "stand",  direction: "down", time: 1000 },
            // 11, 7
            // { type: "textMessage", text: "test test" },
            // { type: "textMessage", text: "M: Different in a way that seems more clean or less clean?" },
            // { type: "textMessage", text: "L: I don't know." },
            // { type: "textMessage", text: "It's too different to tell." },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt2"},


            // { type: "textMessage", text: "We're in part 3" },
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "right" },
            // { who: "characterM", type: "stand",  direction: "right", time: 2000 },
            // { who: "characterM", type: "stand",  direction: "down", time: 2000 },
            // {type: "changeMapNoTransition", map: "C12_Bar_Pt1"}
          ],
        },
      ],
      // [utils.asGridCoord(11,10)]: [
      //   {
      //     events: [
      //       // { type: "changeMap", map: "C07_Bar_Pt1" },
      //       // Link to next map (not chapter 7)
      //       { type: "changeMap",
      //         map: "C07_Bar_Pt1",
      //         x: utils.withGrid(12),
      //         y: utils.withGrid(6),
      //         direction: "down"
      //       },
      //       // { type: "textMessage", text: "this should be chapter 6..."},
      //     ]
      //   }
      // ]
    }
    // overrideCheckForFootstepCutscene: false,
  },
  C12_Bar_Pt2: {
    id: "C12_Bar_Pt2",
    lowerSrc: "/images/maps/parking_lot_lower_thought_animation_1.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "test test" },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt3"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt3: {
    id: "C12_Bar_Pt3",
    lowerSrc: "/images/maps/parking_lot_lower_thought_animation_2.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "test test" },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt4"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt4: {
    id: "C12_Bar_Pt4",
    lowerSrc: "/images/maps/parking_lot_lower_thought_animation_3.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "test test" },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt5"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt5: {
    id: "C12_Bar_Pt5",
    lowerSrc: "/images/maps/parking_lot_lower_thought_animation_4.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "test test" },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt6"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt6: {
    id: "C12_Bar_Pt6",
    lowerSrc: "/images/maps/parking_lot_lower_thought_animation_5.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "test test" },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt7"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt7: {
    id: "C12_Bar_Pt7",
    lowerSrc: "/images/maps/parking_lot_lower_thought_animation_4.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "test test" },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt8"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt8: {
    id: "C12_Bar_Pt8",
    lowerSrc: "/images/maps/parking_lot_lower_thought_animation_2.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt9"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt9: {
    id: "C12_Bar_Pt9",
    lowerSrc: "/images/maps/parking_lot_lower_thought_animation_1.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt10"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt10: {
    id: "C12_Bar_Pt10",
    // lowerSrc: "/images/maps/parking_lot_wip.png",
    lowerSrc: "/images/maps/testtest.png",
    // upperSrc: "/images/maps/parkinglot_upper.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
      // edges of level
      // [utils.asGridCoord(0,3)] : true,
      // [utils.asGridCoord(0,4)] : true,
      // [utils.asGridCoord(0,5)] : true,
      // [utils.asGridCoord(0,6)] : true,
      // [utils.asGridCoord(0,7)] : true,
      // [utils.asGridCoord(0,8)] : true,
      // [utils.asGridCoord(0,9)] : true,
      // [utils.asGridCoord(1,10)] : true,
      // [utils.asGridCoord(2,10)] : true,
      // [utils.asGridCoord(3,10)] : true,
      // [utils.asGridCoord(4,10)] : true,
      // [utils.asGridCoord(6,10)] : true,
      // [utils.asGridCoord(7,10)] : true,
      // [utils.asGridCoord(8,10)] : true,
      // [utils.asGridCoord(9,10)] : true,
      // [utils.asGridCoord(10,10)] : true,
      // [utils.asGridCoord(11,9)] : true,
      // [utils.asGridCoord(11,8)] : true,
      // [utils.asGridCoord(11,7)] : true,
      // [utils.asGridCoord(11,6)] : true,
      // [utils.asGridCoord(11,5)] : true,
      // [utils.asGridCoord(11,4)] : true,
      // // back wall
      // [utils.asGridCoord(1,3)] : true,
      // [utils.asGridCoord(2,3)] : true,
      // [utils.asGridCoord(3,3)] : true,
      // [utils.asGridCoord(4,3)] : true,
      // [utils.asGridCoord(5,3)] : true,
      // //     door is at 6, 3
      // [utils.asGridCoord(7,3)] : true,
      // [utils.asGridCoord(8,3)] : true,
      // [utils.asGridCoord(9,3)] : true,
      // [utils.asGridCoord(10,3)] : true,

      // // bar
      // [utils.asGridCoord(4,4)] : true,
      // [utils.asGridCoord(4,5)] : true,
      // [utils.asGridCoord(4,6)] : true,
      // [utils.asGridCoord(5,6)] : true,
      // [utils.asGridCoord(6,6)] : true,
      // [utils.asGridCoord(7,6)] : true,
      // [utils.asGridCoord(8,6)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "test test" },
            // { who: "hero", type: "walk",  direction: "up" },
            // { who: "hero", type: "walk",  direction: "up" },
            // { who: "hero", type: "walk",  direction: "up" },
            // { who: "hero", type: "walk",  direction: "up" },
            // { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { who: "hero", type: "stand",  direction: "right", time: 1000 },
            // { who: "hero", type: "stand",  direction: "up", time: 1000 },
            // { who: "hero", type: "walk",  direction: "left" },
            // { who: "hero", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "right" },
            // { who: "hero", type: "walk",  direction: "left" },
            // { who: "hero", type: "walk",  direction: "left" },
            // { who: "hero", type: "walk",  direction: "up" },
            // { who: "hero", type: "walk",  direction: "up" },
            // { who: "hero", type: "stand",  direction: "down", time: 1000 },
            // 11, 7
            // { type: "textMessage", text: "test test" },
            // { type: "textMessage", text: "M: Different in a way that seems more clean or less clean?" },
            // { type: "textMessage", text: "L: I don't know." },
            // { type: "textMessage", text: "It's too different to tell." },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt11"},


            // { type: "textMessage", text: "We're in part 3" },
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "down" },
            // { who: "characterM", type: "walk",  direction: "right" },
            // { who: "characterM", type: "stand",  direction: "right", time: 2000 },
            // { who: "characterM", type: "stand",  direction: "down", time: 2000 },
            // {type: "changeMapNoTransition", map: "C12_Bar_Pt1"}
          ],
        },
      ],
      // [utils.asGridCoord(11,10)]: [
      //   {
      //     events: [
      //       // { type: "changeMap", map: "C07_Bar_Pt1" },
      //       // Link to next map (not chapter 7)
      //       { type: "changeMap",
      //         map: "C07_Bar_Pt1",
      //         x: utils.withGrid(12),
      //         y: utils.withGrid(6),
      //         direction: "down"
      //       },
      //       // { type: "textMessage", text: "this should be chapter 6..."},
      //     ]
      //   }
      // ]
    }
    // overrideCheckForFootstepCutscene: false,
  },
  C12_Bar_Pt11: {
    id: "C12_Bar_Pt11",
    lowerSrc: "/images/maps/parking_lot_lower_bread_animation_1.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt12"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt12: {
    id: "C12_Bar_Pt12",
    lowerSrc: "/images/maps/parking_lot_lower_bread_animation_2.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            // { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt13"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt13: {
    id: "C12_Bar_Pt13",
    lowerSrc: "/images/maps/parking_lot_lower_bread_animation_3.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            // { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt14"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt14: {
    id: "C12_Bar_Pt14",
    lowerSrc: "/images/maps/parking_lot_lower_bread_animation_4.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            // { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt15"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt15: {
    id: "C12_Bar_Pt15",
    lowerSrc: "/images/maps/parking_lot_lower_bread_animation_5.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            // { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            {type: "changeMapNoTransition", map: "C12_Bar_Pt16"},
          ],
        },
      ],
    }
  },
  C12_Bar_Pt16: {
    id: "C12_Bar_Pt16",
    lowerSrc: "/images/maps/parking_lot_lower_bread_animation_5.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
        direction: "left",
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    walls: {
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,10)]: [
        {
          events: [
            // { who: "hero", type: "stand",  direction: "right", time: 1000 },
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // {type: "changeMapNoTransition", map: "C12_Bar_Pt15"},
            // { type: "textMessage", text: "transition to chapter 13"},
            { type: "changeMap",
              map: "C13_Bar",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ],
        },
      ],
    }
  },
  C13_Bar: {
    id: "C13_Bar",
    lowerSrc: "/images/maps/BarFrontLowerShadow.png",
    upperSrc: "/images/maps/BarFrontLowerShadow.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 4000 },
            { type: "textMessage", text: "Notice: The bar is closed as its bathroom has disappeared."},
            { type: "textMessage", text: "We apologize for the inconvenience."},
            { type: "changeMap",
              map: "C14_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "changeMapNoTransition", map: "sattelite_animated_background_frame_2_test" },
          ],
        },
      ]
    }
  },
  C14_Bar_pt1: {
    id: "C14_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        direction: "up",
        src: "/images/characters/people/hero_gray.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      emptyStool6: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "L: Hey, I got two waters."},
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "J: Extra thirsty today?"},
            { type: "textMessage", text: "L: No."},
            { type: "textMessage", text: "J: Then why the two waters?"},
            { type: "textMessage", text: "L: I didn't mean to get two."},
            { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "M: What does that mean?"},
            { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "L: I paid for one water and two came out."},
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "L: Can you put this water back in for me, J.?"},
            { type: "textMessage", text: "J: I can't open the vending machine."},
            { type: "textMessage", text: "L: But I didn't pay for this......... or maybe I didn't pay for *this* ......."},
            { type: "textMessage", text: "J: It's fine."},
            { type: "textMessage", text: "L: Hm,"},
            { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "M: If you're really upset about it, just put another water's worth of change in the machine."},
            { type: "textMessage", text: "L: !!!"},
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "L: M.! You're a genius."},
            { type: "textMessage", text: "M: Hmm, ha, well, you know, mm, hmm..."},
            { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "L: Oh no."},
            { type: "textMessage", text: "J: What?"},
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "L: It wants me to pick something."},
            { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            { type: "changeMapNoTransition", map: "C14_Bar_pt2"},
            // { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C14_Bar_pt2: {
    id: "C14_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        direction: "up",
        src: "/images/characters/people/hero_gray.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      emptyStool6: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      // [utils.asGridCoord(5,5)]: [
      //   {
      //     events: [
      //       { who: "characterL", type: "stand",  direction: "up", time: 1000 },
      //       { who: "characterL", type: "stand",  direction: "right", time: 1000 },
      //       { who: "characterL", type: "stand",  direction: "up", time: 1000 },
      //       { who: "characterL", type: "stand",  direction: "right", time: 1000 },
      //       { type: "textMessage", text: "L: Hey, I got two waters."},
      //       { who: "hero", type: "stand",  direction: "left", time: 1000 },
      //       { type: "textMessage", text: "J: Extra thirsty today?"},
      //       { type: "textMessage", text: "L: No."},
      //       { type: "textMessage", text: "J: Then why the two waters?"},
      //       { type: "textMessage", text: "L: I didn't mean to get two."},
      //       { who: "characterM", type: "stand",  direction: "left", time: 1000 },
      //       { type: "textMessage", text: "M: What does that mean?"},
      //       { who: "characterL", type: "stand",  direction: "up", time: 1000 },
      //       { type: "textMessage", text: "L: I paid for one water and two came out."},
      //       { who: "characterL", type: "stand",  direction: "right", time: 1000 },
      //       { type: "textMessage", text: "L: Can you put this water back in for me, J.?"},
      //       { type: "textMessage", text: "J: I can't open the fending machine."},
      //       { type: "textMessage", text: "L: But I didn't pay for this......... or maybe I didn't pay for *this* ......."},
      //       { type: "textMessage", text: "J: It's fine."},
      //       { type: "textMessage", text: "L: Hm,"},
      //       { who: "characterL", type: "stand",  direction: "up", time: 1000 },
      //       { who: "characterL", type: "stand",  direction: "right", time: 1000 },
      //       { who: "characterL", type: "stand",  direction: "up", time: 1000 },
      //       { type: "textMessage", text: "M: If you're really upset about it, just put another water's worth of change in the machine."},
      //       { type: "textMessage", text: "L: !!!"},
      //       { who: "characterL", type: "stand",  direction: "right", time: 1000 },
      //       { type: "textMessage", text: "L: M.! You're a genius."},
      //       { type: "textMessage", text: "M: Hmm, ha, well, you know, mm, hmm..."},
      //       { who: "characterL", type: "stand",  direction: "up", time: 1000 },
      //       { type: "textMessage", text: "L: Oh no."},
      //       { type: "textMessage", text: "J: What?."},
      //       { who: "characterL", type: "stand",  direction: "right", time: 1000 },
      //       { type: "textMessage", text: "L: It wants me to pick something."},
      //       { who: "characterL", type: "stand",  direction: "up", time: 1000 },
      //       // { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
      //     ]
      //   }
      // ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C15_Grocery_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(7),
              direction: "up"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C15_Grocery_pt1: {
    id: "C15_Grocery_pt1",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_store_upper.png",
    gameObjects: {
      grocer: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer.png",
      }),
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/hero_gray.png",
      }),
    },
    walls: {
      // edges of level
      //// left wall
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      //// back wall
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,
      [utils.asGridCoord(11,3)] : true,
      [utils.asGridCoord(12,3)] : true,
      [utils.asGridCoord(13,3)] : true,
      ////right wall
      [utils.asGridCoord(14,4)] : true,
      [utils.asGridCoord(14,5)] : true,
      [utils.asGridCoord(14,6)] : true,
      [utils.asGridCoord(14,7)] : true,
      [utils.asGridCoord(14,8)] : true,
      [utils.asGridCoord(14,9)] : true,
      //// bottom wall
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,10)] : true,
      // door is here
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,10)] : true,
      [utils.asGridCoord(12,10)] : true,
      [utils.asGridCoord(13,10)] : true,
      // grocery shelf
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(2,5)] : true,
      [utils.asGridCoord(3,5)] : true,
      [utils.asGridCoord(4,5)] : true,
      [utils.asGridCoord(5,5)] : true,
      [utils.asGridCoord(6,5)] : true,
      [utils.asGridCoord(7,5)] : true,
      [utils.asGridCoord(8,5)] : true,
      [utils.asGridCoord(9,5)] : true,
      [utils.asGridCoord(10,5)] : true,
      // cash register
      [utils.asGridCoord(9,8)] : true,
      [utils.asGridCoord(10,8)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(12,8)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(1,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "it just seems to go on forever..."},
          ]
        }
      ],
      [utils.asGridCoord(5,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "grocer", type: "stand",  direction: "left", time: 1000},
            { type: "textMessage", text: "Grocer: Yes, in the first aisle."},
            // { who: "grocer", type: "stand",  direction: "down", time: 1000},
            // { who: "hero", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "Customer: And bananas?"},
            // { who: "grocer", type: "stand",  direction: "left", time: 1000},
            // { type: "textMessage", text: "Grocer: Yes, aisle one."},
            // { type: "textMessage", text: "Customer: Toothpicks?"},
            // { type: "textMessage", text: "Grocer: We've got them! Last aisle."},
            // { type: "textMessage", text: "Customer: What about--"},
            // { type: "textMessage", text: "Grocer: Aisle one."},
            // { type: "textMessage", text: "Customer: --olives?"},
            // { type: "textMessage", text: "Grocer: Aisle one."},
            // { type: "textMessage", text: "Customer: How did you know what I was going to say?"},
            // { type: "textMessage", text: "Grocer: I didn't."},
            // { type: "textMessage", text: "Customer: Then how did you know where to direct me?"},
            // { who: "grocer", type: "stand",  direction: "up", time: 1000 },
            // { who: "grocer", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "Grocer: We just have the one aisle, here."},
            { type: "changeMapNoTransition", map: "C15_Grocery_pt2"},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  }, 
  C15_Grocery_pt2: {
    id: "C15_Grocery_pt2",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_store_upper.png",
    gameObjects: {
      grocer: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer.png",
        behaviorLoop: [
          { type: "stand",  direction: "down", time: 1000 }
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Grocer: Let me know if you need help finding anything.", faceHero: "grocer" },
            ]
          }
        ]
      }),
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/hero_gray.png",
      }),
    },
    walls: {
      // edges of level
      //// left wall
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      //// back wall
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,
      [utils.asGridCoord(11,3)] : true,
      [utils.asGridCoord(12,3)] : true,
      [utils.asGridCoord(13,3)] : true,
      ////right wall
      [utils.asGridCoord(14,4)] : true,
      [utils.asGridCoord(14,5)] : true,
      [utils.asGridCoord(14,6)] : true,
      [utils.asGridCoord(14,7)] : true,
      [utils.asGridCoord(14,8)] : true,
      [utils.asGridCoord(14,9)] : true,
      //// bottom wall
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,10)] : true,
      // door is here
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,10)] : true,
      [utils.asGridCoord(12,10)] : true,
      [utils.asGridCoord(13,10)] : true,
      // grocery shelf
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(2,5)] : true,
      [utils.asGridCoord(3,5)] : true,
      [utils.asGridCoord(4,5)] : true,
      [utils.asGridCoord(5,5)] : true,
      [utils.asGridCoord(6,5)] : true,
      [utils.asGridCoord(7,5)] : true,
      [utils.asGridCoord(8,5)] : true,
      [utils.asGridCoord(9,5)] : true,
      [utils.asGridCoord(10,5)] : true,
      // cash register
      [utils.asGridCoord(9,8)] : true,
      [utils.asGridCoord(10,8)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(12,8)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(1,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "it just seems to go on forever..."},
          ]
        }
      ],
      [utils.asGridCoord(6,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C16_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C16_Bar_pt1: {
    id: "C16_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { type: "textMessage", text: "L: Has anything appeared?"},
            { type: "textMessage", text: "J: Appeared?"},
            { type: "textMessage", text: "L: Well you keep mentioning things that have disappeared. Has anything appeared? New hallways or doors?"},
            { type: "textMessage", text: "J: I don't think so."},
            { type: "textMessage", text: "L: Have you checked the bathroom?"},
            // { type: "textMessage", text: "J: For what?"},
            // { type: "textMessage", text: "L: Anything that isn't supposed to be there."},
            // { type: "textMessage", text: "J: No."},
            // { type: "textMessage", text: "L: No you haven't checked or no there wasn't anything extra in there?"},
            // { type: "textMessage", text: "J: What would be in there?"},
            // { type: "textMessage", text: "L: Anything that's not supposed to be: a vending machine, or a duck, or a bowl of fruit. Or..."},
            // { type: "textMessage", text: "something that is supposed to be in there but has duplicated like an extra soap dispenser, or urinal, or--"},
            // { type: "textMessage", text: "J: There aren't any urinals in the bathroom."},
            // { type: "textMessage", text: "L: The urinals have gone missing?"},
            // { type: "textMessage", text: "J: We never had any."},
            // { type: "textMessage", text: "L: There were never any urinals in the bar?"},
            // { type: "textMessage", text: "J: No."},
            // { type: "textMessage", text: "L: I mean there weren't any in the bathroom."},
            // { type: "textMessage", text: "J: Right."},
            // { type: "textMessage", text: "L: I mean in the men's bathroom."},
            // { type: "textMessage", text: "J: There is no men's bathroom."},
            // { type: "textMessage", text: "L: The men's bathroom has gone missing?"},
            // { type: "textMessage", text: "J: We never had a men's bathroom."},
            // { type: "textMessage", text: "L: Interesting."},
            // { who: "characterL", type: "stand",  direction: "left", time: 1000},
            // { who: "characterL", type: "stand",  direction: "down", time: 1000},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000},
            // { type: "textMessage", text: "L: What about something small appearing elsewhere,"},
            // { type: "textMessage", text: "maybe something harder to notice, like a bunch of toothpicks?"},
            // { type: "textMessage", text: "J: Toothpicks?"},
            // { type: "textMessage", text: "L: Yeah, toothpicks that you don't remember buying but that suddenly showed up."},
            // { type: "textMessage", text: "J: No, no toothpicks."},
            // { type: "textMessage", text: "L: That's too bad..."},
            // { type: "textMessage", text: "J: How come?"},
            // { type: "textMessage", text: "L: Because I need one."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000},
            // { type: "textMessage", text: "L: Hey, M., have you always been here?"},
            // { type: "textMessage", text: "M: Yes, I've always been here."},
            // { type: "textMessage", text: "L: Since when?"},
            // { who: "characterM", type: "stand",  direction: "right", time: 1000},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000},
            // { type: "textMessage", text: "M: Since I got here."},
            { type: "changeMapNoTransition", map: "C16_Bar_pt2"},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C16_Bar_pt2: {
    id: "C16_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C17_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C17_Bar_pt1: {
    id: "C17_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      characterO: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(10),
        src: "/images/characters/people/npc1_gray.png",
        direction: "up",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hi!", faceHero: "characterO" },
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "characterO", type: "walk",  direction: "up" },
            { who: "characterO", type: "walk",  direction: "up" },
            { type: "textMessage", text: "O: Hello everyone."},
            { who: "characterL", type: "stand",  direction: "down", time: 1000},
            { type: "textMessage", text: "L: O.! It's been a while. How are you?"},
            { type: "changeMapNoTransition", map: "C17_Bar_pt2"},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C17_Bar_pt2: {
    id: "C17_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      characterO: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/o_sitting.png",
        direction: "up",
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "characterO", type: "stand",  direction: "up", time: 1000},
            { who: "characterO", type: "stand",  direction: "left", time: 1000},
            { type: "textMessage", text: "O: I'm great, L., how are you?"},
            { type: "textMessage", text: "L: That's great!"},
            { type: "textMessage", text: "O: You're good then?"},
            { type: "textMessage", text: "L: I'm glad that you're here."},
            { type: "textMessage", text: "O: I mean how are you, independent of that?"},
            { type: "textMessage", text: "L: How am I independent of that?"},
            { who: "characterL", type: "stand",  direction: "right", time: 1000},
            { who: "characterL", type: "stand",  direction: "up", time: 1000},
            { who: "characterL", type: "stand",  direction: "right", time: 1000},
            { who: "characterL", type: "stand",  direction: "down", time: 1000},
            { type: "textMessage", text: "L: I . . . don't know."},
            { type: "textMessage", text: "O: Same old L."},
            { who: "characterL", type: "stand",  direction: "right", time: 1000},
            { who: "characterL", type: "stand",  direction: "down", time: 1000},
            { type: "textMessage", text: "L: Same me."},
            { type: "changeMapNoTransition", map: "C17_Bar_pt3"},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C17_Bar_pt3: {
    id: "C17_Bar_pt3",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      characterO: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/o_sitting.png",
        direction: "up",
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C18_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C18_Bar_pt1: {
    id: "C18_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      vendingMachineGuy: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        src: "/images/characters/people/vending_machine_guy.png",
        direction: "up",
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
      emptyStool6: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool7: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            // { who: "hero", type: "stand",  direction: "left", time: 1000},
            // { type: "textMessage", text: "J: What's strange?"},
            // { type: "textMessage", text: "VENDING MACHINE GUY: Hm?"},
            // { type: "textMessage", text: "J: Did you say something was strange??"},
            // { who: "vendingMachineGuy", type: "stand",  direction: "right", time: 1000},
            // { type: "textMessage", text: "VENDING MACHINE GUY: Hm? Oh. Yes, I guess I did. You're out of bottled water."},
            // { type: "textMessage", text: "J: Is that strange?"},
            // { type: "textMessage", text: "VENDING MACHINE GUY: It's strange for you."},
            // { type: "textMessage", text: "J: For me?"},
            // { type: "textMessage", text: "VENDING MACHINE GUY: You run out of soda pretty regularly..."},
            // { type: "textMessage", text: "In fact, the only reason I really come around here is to refill B4-- B4 is soda."},
            // { who: "vendingMachineGuy", type: "stand",  direction: "up", time: 1000},
            // { who: "vendingMachineGuy", type: "stand",  direction: "right", time: 1000},
            // { type: "textMessage", text: "VENDING MACHINE GUY: But recently you've been running out of water. C1."},
            // { type: "textMessage", text: "J: Ah, I see. One of our regulars has started buying a water bottle from the machine most nights"},
            // { who: "vendingMachineGuy", type: "stand",  direction: "up", time: 1000},
            // { who: "vendingMachineGuy", type: "stand",  direction: "down", time: 1000},
            // { type: "textMessage", text: "VENDING MACHINE GUY: Well I guess that would do it."},
            // { who: "vendingMachineGuy", type: "stand",  direction: "right", time: 1000},
            // { type: "textMessage", text: "VENDING MACHINE GUY: I only brought soda for restocking."},
            // { type: "textMessage", text: "Mind if I leave this open while I grab some water bottles across the street?"},
            // { type: "textMessage", text: "J: Across the street? At the grocery store?"},
            // { who: "vendingMachineGuy", type: "stand",  direction: "down", time: 1000},
            // { type: "textMessage", text: "VENDING MACHINE GUY: Yep."},
            // { type: "textMessage", text: "J: Isn't that weird, though?"},
            // { who: "vendingMachineGuy", type: "stand",  direction: "right", time: 1000},
            // { type: "textMessage", text: "VENDING MACHINE GUY: What do you mean?"},
            // { type: "textMessage", text: "J: Buying water bottles from the grocery store to stock the vending machine?"},
            // { type: "textMessage", text: "VENDING MACHINE GUY: That's where I always buy my stock from."},
            // { type: "textMessage", text: "J: You do?"},
            // { type: "textMessage", text: "VENDING MACHINE GUY: Sure. Where did you think I got it from?"},
            // { type: "textMessage", text: "J: I don't know-- a warehouse."},
            // { type: "textMessage", text: "VENDING MACHINE GUY: What warehouse?"},
            // { type: "textMessage", text: "J: I don't know. Just one that I picture when I think about warehouses."},
            // { type: "textMessage", text: "VENDING MACHINE GUY: No, it's the grocery store for me."},
            // { type: "textMessage", text: "Couldn’t think of a better place to buy stock for your and the grocery store's vending machines"},
            // { type: "textMessage", text: "J: The grocery store has a vending machine, too?"},
            // { type: "textMessage", text: "VENDING MACHINE GUY: Yep."},
            // { type: "textMessage", text: "J: And you stock the grocery store's vending machine *from* the grocery store?"},
            // { type: "textMessage", text: "VENDING MACHINE GUY: Yep."},
            { type: "textMessage", text: "J: Don't you think that's remarkable?"},
            { type: "textMessage", text: "VENDING MACHINE GUY: Not really."},
            { who: "vendingMachineGuy", type: "walk",  direction: "down" },
            { who: "vendingMachineGuy", type: "walk",  direction: "down" },
            { who: "vendingMachineGuy", type: "walk",  direction: "right" },
            { who: "vendingMachineGuy", type: "walk",  direction: "down" },
            { who: "vendingMachineGuy", type: "stand",  direction: "right", time: 1000},
            { type: "textMessage", text: "VENDING MACHINE GUY: Or, I suppose it might be."},
            { who: "vendingMachineGuy", type: "walk",  direction: "down" },
            { who: "vendingMachineGuy", type: "walk",  direction: "right" },
            { who: "vendingMachineGuy", type: "walk",  direction: "right" },
            { who: "vendingMachineGuy", type: "walk",  direction: "right" },
            { who: "vendingMachineGuy", type: "walk",  direction: "down" },
            { who: "vendingMachineGuy", type: "stand",  direction: "down", time: 1000},
            { who: "vendingMachineGuy", type: "stand",  direction: "up", time: 1000},
            { type: "textMessage", text: "VENDING MACHINE GUY: I'm not sure."},
            { who: "vendingMachineGuy", type: "stand",  direction: "down", time: 1000},
            { who: "vendingMachineGuy", type: "walk",  direction: "down" },
            { who: "vendingMachineGuy", type: "walk",  direction: "down" },
            { who: "vendingMachineGuy", type: "walk",  direction: "down" },
            { type: "changeMapNoTransition", map: "C18_Bar_pt2"},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C18_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C18_Bar_pt2: {
    id: "C18_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
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
      emptyStool6: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool7: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C19_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C19_Bar_pt1: {
    id: "C19_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        direction: "up",
        src: "/images/characters/people/hero_gray.png",
        behaviorLoop: [
          // { type: "stand",  direction: "right", time: 300 },
          // { type: "stand",  direction: "down", time: 5000 }
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
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
      emptyStool6: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
    },
    walls: {
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "J: You know I can give you water at the bar. It's free."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: I like getting it from the machine. I don't know if I'd drink it otherwise."},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: Why do you like getting it from the machine?"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: I don't know. It's a whole thing when you get it from the machine."},
            // { type: "textMessage", text: "M: A ritual of sorts?"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: I guess."},
            // { type: "textMessage", text: "J: Does it taste different?"},
            // { type: "textMessage", text: "L: I don't know."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: It says here that it's purified. Is the bar's water purified?"},
            // { type: "textMessage", text: "J: It's filtered."},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { type: "textMessage", text: "M: That's not the same."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: How is it different?"},
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: I don't know."},
            // { who: "characterM", type: "stand",  direction: "down", time: 500 },
            // { who: "characterM", type: "stand",  direction: "right", time: 500 },
            // { type: "textMessage", text: "But it's not the same."},
            // { type: "textMessage", text: "J: Should we do a taste test?"},
            // { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "L: Sure."},
            { who: "characterL", type: "walk",  direction: "down" },
            { who: "characterL", type: "walk",  direction: "right" },
            { type: "changeMapNoTransition", map: "C19_Bar_pt2"},
            // { type: "textMessage", text: "We're in chapter 19"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Hey, I got two waters."},
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "J: Extra thirsty today?"},
            // { type: "textMessage", text: "L: No."},
            // { type: "textMessage", text: "J: Then why the two waters?"},
            // { type: "textMessage", text: "L: I didn't mean to get two."},
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: What does that mean?"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: I paid for one water and two came out."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Can you put this water back in for me, J.?"},
            // { type: "textMessage", text: "J: I can't open the vending machine."},
            // { type: "textMessage", text: "L: But I didn't pay for this......... or maybe I didn't pay for *this* ......."},
            // { type: "textMessage", text: "J: It's fine."},
            // { type: "textMessage", text: "L: Hm,"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "M: If you're really upset about it, just put another water's worth of change in the machine."},
            // { type: "textMessage", text: "L: !!!"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: M.! You're a genius."},
            // { type: "textMessage", text: "M: Hmm, ha, well, you know, mm, hmm..."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: Oh no."},
            // { type: "textMessage", text: "J: What?"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: It wants me to pick something."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "changeMapNoTransition", map: "C14_Bar_pt2"},
            // { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C19_Bar_pt2: {
    id: "C19_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt3"},
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "J: You know I can give you water at the bar. It's free."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: I like getting it from the machine. I don't know if I'd drink it otherwise."},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: Why do you like getting it from the machine?"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: I don't know. It's a whole thing when you get it from the machine."},
            // { type: "textMessage", text: "M: A ritual of sorts?"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: I guess."},
            // { type: "textMessage", text: "J: Does it taste different?"},
            // { type: "textMessage", text: "L: I don't know."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: It says here that it's purified. Is the bar's water purified?"},
            // { type: "textMessage", text: "J: It's filtered."},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { type: "textMessage", text: "M: That's not the same."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: How is it different?"},
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: I don't know."},
            // { who: "characterM", type: "stand",  direction: "down", time: 500 },
            // { who: "characterM", type: "stand",  direction: "right", time: 500 },
            // { type: "textMessage", text: "But it's not the same."},
            // { type: "textMessage", text: "J: Should we do a taste test?"},
            // { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Sure."},
            // { who: "characterL", type: "walk",  direction: "down" },
            // { who: "characterL", type: "walk",  direction: "right" },
            // { type: "changeMapNoTransition", map: "C19_Bar_pt2"},
            // { type: "textMessage", text: "We're in chapter 19"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Hey, I got two waters."},
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "J: Extra thirsty today?"},
            // { type: "textMessage", text: "L: No."},
            // { type: "textMessage", text: "J: Then why the two waters?"},
            // { type: "textMessage", text: "L: I didn't mean to get two."},
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: What does that mean?"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: I paid for one water and two came out."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Can you put this water back in for me, J.?"},
            // { type: "textMessage", text: "J: I can't open the vending machine."},
            // { type: "textMessage", text: "L: But I didn't pay for this......... or maybe I didn't pay for *this* ......."},
            // { type: "textMessage", text: "J: It's fine."},
            // { type: "textMessage", text: "L: Hm,"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "M: If you're really upset about it, just put another water's worth of change in the machine."},
            // { type: "textMessage", text: "L: !!!"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: M.! You're a genius."},
            // { type: "textMessage", text: "M: Hmm, ha, well, you know, mm, hmm..."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: Oh no."},
            // { type: "textMessage", text: "J: What?"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: It wants me to pick something."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "changeMapNoTransition", map: "C14_Bar_pt2"},
            // { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C19_Bar_pt3: {
    id: "C19_Bar_pt3",
    lowerSrc: "/images/maps/C19_BarLowerWithWater.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt4"},
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "J: You know I can give you water at the bar. It's free."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: I like getting it from the machine. I don't know if I'd drink it otherwise."},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: Why do you like getting it from the machine?"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: I don't know. It's a whole thing when you get it from the machine."},
            // { type: "textMessage", text: "M: A ritual of sorts?"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: I guess."},
            // { type: "textMessage", text: "J: Does it taste different?"},
            // { type: "textMessage", text: "L: I don't know."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: It says here that it's purified. Is the bar's water purified?"},
            // { type: "textMessage", text: "J: It's filtered."},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { type: "textMessage", text: "M: That's not the same."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: How is it different?"},
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: I don't know."},
            // { who: "characterM", type: "stand",  direction: "down", time: 500 },
            // { who: "characterM", type: "stand",  direction: "right", time: 500 },
            // { type: "textMessage", text: "But it's not the same."},
            // { type: "textMessage", text: "J: Should we do a taste test?"},
            // { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Sure."},
            // { who: "characterL", type: "walk",  direction: "down" },
            // { who: "characterL", type: "walk",  direction: "right" },
            // { type: "changeMapNoTransition", map: "C19_Bar_pt2"},
            // { type: "textMessage", text: "We're in chapter 19"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Hey, I got two waters."},
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "J: Extra thirsty today?"},
            // { type: "textMessage", text: "L: No."},
            // { type: "textMessage", text: "J: Then why the two waters?"},
            // { type: "textMessage", text: "L: I didn't mean to get two."},
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: What does that mean?"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: I paid for one water and two came out."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Can you put this water back in for me, J.?"},
            // { type: "textMessage", text: "J: I can't open the vending machine."},
            // { type: "textMessage", text: "L: But I didn't pay for this......... or maybe I didn't pay for *this* ......."},
            // { type: "textMessage", text: "J: It's fine."},
            // { type: "textMessage", text: "L: Hm,"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "M: If you're really upset about it, just put another water's worth of change in the machine."},
            // { type: "textMessage", text: "L: !!!"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: M.! You're a genius."},
            // { type: "textMessage", text: "M: Hmm, ha, well, you know, mm, hmm..."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: Oh no."},
            // { type: "textMessage", text: "J: What?"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: It wants me to pick something."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "changeMapNoTransition", map: "C14_Bar_pt2"},
            // { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C19_Bar_pt4: {
    id: "C19_Bar_pt4",
    lowerSrc: "/images/maps/C19_BarLowerWithWater2.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
      // edges of level
      [utils.asGridCoord(0,3)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,4)] : true,
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            { who: "characterL", type: "stand",  direction: "left", time: 1000 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt5"},
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "J: You know I can give you water at the bar. It's free."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: I like getting it from the machine. I don't know if I'd drink it otherwise."},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: Why do you like getting it from the machine?"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: I don't know. It's a whole thing when you get it from the machine."},
            // { type: "textMessage", text: "M: A ritual of sorts?"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: I guess."},
            // { type: "textMessage", text: "J: Does it taste different?"},
            // { type: "textMessage", text: "L: I don't know."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: It says here that it's purified. Is the bar's water purified?"},
            // { type: "textMessage", text: "J: It's filtered."},
            // { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            // { type: "textMessage", text: "M: That's not the same."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: How is it different?"},
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: I don't know."},
            // { who: "characterM", type: "stand",  direction: "down", time: 500 },
            // { who: "characterM", type: "stand",  direction: "right", time: 500 },
            // { type: "textMessage", text: "But it's not the same."},
            // { type: "textMessage", text: "J: Should we do a taste test?"},
            // { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Sure."},
            // { who: "characterL", type: "walk",  direction: "down" },
            // { who: "characterL", type: "walk",  direction: "right" },
            // { type: "changeMapNoTransition", map: "C19_Bar_pt2"},
            // { type: "textMessage", text: "We're in chapter 19"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Hey, I got two waters."},
            // { who: "hero", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "J: Extra thirsty today?"},
            // { type: "textMessage", text: "L: No."},
            // { type: "textMessage", text: "J: Then why the two waters?"},
            // { type: "textMessage", text: "L: I didn't mean to get two."},
            // { who: "characterM", type: "stand",  direction: "left", time: 1000 },
            // { type: "textMessage", text: "M: What does that mean?"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: I paid for one water and two came out."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Can you put this water back in for me, J.?"},
            // { type: "textMessage", text: "J: I can't open the vending machine."},
            // { type: "textMessage", text: "L: But I didn't pay for this......... or maybe I didn't pay for *this* ......."},
            // { type: "textMessage", text: "J: It's fine."},
            // { type: "textMessage", text: "L: Hm,"},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "M: If you're really upset about it, just put another water's worth of change in the machine."},
            // { type: "textMessage", text: "L: !!!"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: M.! You're a genius."},
            // { type: "textMessage", text: "M: Hmm, ha, well, you know, mm, hmm..."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "L: Oh no."},
            // { type: "textMessage", text: "J: What?"},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: It wants me to pick something."},
            // { who: "characterL", type: "stand",  direction: "up", time: 1000 },
            // { type: "changeMapNoTransition", map: "C14_Bar_pt2"},
            // { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C19_Bar_pt5: {
    id: "C19_Bar_pt5",
    lowerSrc: "/images/maps/C19_BarLowerWithWater2.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt6"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt6: {
    id: "C19_Bar_pt6",
    lowerSrc: "/images/maps/WaterTasteTestFrame1.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt7"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt7: {
    id: "C19_Bar_pt7",
    lowerSrc: "/images/maps/WaterTasteTestFrame2.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt8"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt8: {
    id: "C19_Bar_pt8",
    lowerSrc: "/images/maps/WaterTasteTestFrame3.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt9"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt9: {
    id: "C19_Bar_pt9",
    lowerSrc: "/images/maps/WaterTasteTestFrame4.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt10"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt10: {
    id: "C19_Bar_pt10",
    lowerSrc: "/images/maps/WaterTasteTestFrame5.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt11"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt11: {
    id: "C19_Bar_pt11",
    lowerSrc: "/images/maps/WaterTasteTestFrame4.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt12"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt12: {
    id: "C19_Bar_pt12",
    lowerSrc: "/images/maps/WaterTasteTestFrame3.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "cIt's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt13"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt13: {
    id: "C19_Bar_pt13",
    lowerSrc: "/images/maps/WaterTasteTestFrame2.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "bIt's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt14"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt14: {
    id: "C19_Bar_pt14",
    lowerSrc: "/images/maps/WaterTasteTestFrame1.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "aIt's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt15"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt15: {
    id: "C19_Bar_pt15",
    lowerSrc: "/images/maps/WaterTasteTestFrame6.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "left",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 2000 },
            { type: "textMessage", text: "J: Ok."},
            { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },

            { type: "changeMapNoTransition", map: "C19_Bar_pt16"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt16: {
    id: "C19_Bar_pt16",
    lowerSrc: "/images/maps/WaterTasteTestFrame7.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "right",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt17"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt17: {
    id: "C19_Bar_pt17",
    lowerSrc: "/images/maps/WaterTasteTestFrame8.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            { type: "textMessage", text: "M: What does it taste like?"},
            { type: "textMessage", text: "L: Water."},
            { type: "textMessage", text: "J: Try the other one."},
            { type: "changeMapNoTransition", map: "C19_Bar_pt18"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt18: {
    id: "C19_Bar_pt18",
    lowerSrc: "/images/maps/WaterTasteTestFrame9.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "right",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
    cutsceneSpaces: {
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "changeMapNoTransition", map: "C19_Bar_pt19"},
          ]
        }
      ],
    }
  },
  C19_Bar_pt19: {
    id: "C19_Bar_pt19",
    lowerSrc: "/images/maps/WaterTasteTestFrame10.png",
    upperSrc: "/images/maps/C19_BarUpperWithWater.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "right",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
              { type: "textMessage", text: "I'm inquisitive and cheerful!"},
            ]
          }
        ]
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
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
      [utils.asGridCoord(6,3)]: [
        {
          events: [
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "characterM", type: "stand",  direction: "down", time: 1000 },
            { type: "textMessage", text: "M: What does that one taste like?"},
            { type: "textMessage", text: "L: Water."},
            { type: "textMessage", text: "M: They taste the same?"},
            { type: "textMessage", text: "L: No."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C20_Grocery_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(7),
              direction: "up"
            },
          ]
        }
      ]
    }
  },
  C20_Grocery_pt1: {
    id: "C20_Grocery_pt1",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_store_upper.png",
    gameObjects: {
      grocer: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer.png",
      }),
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/hero_gray.png",
      }),
    },
    walls: {
      // edges of level
      //// left wall
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      //// back wall
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,
      [utils.asGridCoord(11,3)] : true,
      [utils.asGridCoord(12,3)] : true,
      [utils.asGridCoord(13,3)] : true,
      ////right wall
      [utils.asGridCoord(14,4)] : true,
      [utils.asGridCoord(14,5)] : true,
      [utils.asGridCoord(14,6)] : true,
      [utils.asGridCoord(14,7)] : true,
      [utils.asGridCoord(14,8)] : true,
      [utils.asGridCoord(14,9)] : true,
      //// bottom wall
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,10)] : true,
      // door is here
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,10)] : true,
      [utils.asGridCoord(12,10)] : true,
      [utils.asGridCoord(13,10)] : true,
      // grocery shelf
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(2,5)] : true,
      [utils.asGridCoord(3,5)] : true,
      [utils.asGridCoord(4,5)] : true,
      [utils.asGridCoord(5,5)] : true,
      [utils.asGridCoord(6,5)] : true,
      [utils.asGridCoord(7,5)] : true,
      [utils.asGridCoord(8,5)] : true,
      [utils.asGridCoord(9,5)] : true,
      [utils.asGridCoord(10,5)] : true,
      // cash register
      [utils.asGridCoord(9,8)] : true,
      [utils.asGridCoord(10,8)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(12,8)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(1,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "it just seems to go on forever..."},
          ]
        }
      ],
      [utils.asGridCoord(5,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "Customer: Potatoes and olives are both in this aisle?"},
            { who: "grocer", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "Grocer: That's right."},
            { type: "textMessage", text: "Customer: As well as everything else?"},
            { type: "textMessage", text: "Grocer: Yes."},
            { type: "textMessage", text: "Customer: How can you have just the one aisle?"},
            { who: "grocer", type: "stand",  direction: "up", time: 1000 },
            { who: "grocer", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "Grocer: It's all I've needed so far."},
            { type: "textMessage", text: "Customer: But you can't have just one aisle. You can have zero, or three, at the least."},
            { type: "textMessage", text: "Grocer: But if I had three aisles I'd have six, and I don't have the space for six aisles, nevermind twelve."},
            { type: "textMessage", text: "Customer: So everything is just *here* then, zero functioning as one?"},
            { type: "textMessage", text: "Grocer: I guess so."},
            { type: "textMessage", text: "Customer: What if you need to stock more things?"},
            { type: "textMessage", text: "Grocer: It's quite long"},
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "Customer: Is it full?"},
            { type: "textMessage", text: "Grocer: Not yet."},
            { type: "textMessage", text: "Customer: What if it was?"},
            { type: "textMessage", text: "Grocer: I'd worry about sales..."},
            { type: "textMessage", text: "Customer: What if you needed to stock more kinds of things? That needed more shelf space?"},
            { type: "textMessage", text: "Grocer: The aisle could twist or turn some I suppose, to avoid the back wall."},
            { type: "textMessage", text: "Customer: I can't see the end of it. How long is the aisle, already?"},
            { type: "textMessage", text: "Grocer: It's quite long."},
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "Customer: What if I get lost?"},
            { type: "textMessage", text: "Grocer: How could you get lost? It's one aisle."},
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "Customer: I don't know, what if I do?"},
            { type: "textMessage", text: "Grocer: Turn around and return."},
            { type: "textMessage", text: "Customer: Ok. I'll be back to checkout soon."},
            { who: "grocer", type: "stand",  direction: "down", time: 1000 },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "walk", direction: "left" },
            { type: "textMessage", text: "Grocer: Wait!"},
            { who: "grocer", type: "stand",  direction: "left", time: 10 },
            { who: "hero", type: "stand",  direction: "right", time: 10 },
            { type: "textMessage", text: "Customer: Yes?"},
            { type: "textMessage", text: "Grocer: What are you making with potatoes and olives?"},
            { who: "hero", type: "stand",  direction: "down", time: 1000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "Customer: They're for different things."},
            { type: "changeMapNoTransition", map: "C20_Grocery_pt2"},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C20_Grocery_pt2",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C20_Grocery_pt2: {
    id: "C20_Grocery_pt2",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_store_upper.png",
    gameObjects: {
      grocer: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer.png",
        behaviorLoop: [
          { type: "stand",  direction: "down", time: 1000 }
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Grocer: Let me know if you need help finding anything.", faceHero: "grocer" },
            ]
          }
        ]
      }),
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        direction: "right",
        src: "/images/characters/people/hero_gray.png",
      }),
    },
    walls: {
      // edges of level
      //// left wall
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      //// back wall
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(6,3)] : true,
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,3)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,
      [utils.asGridCoord(11,3)] : true,
      [utils.asGridCoord(12,3)] : true,
      [utils.asGridCoord(13,3)] : true,
      ////right wall
      [utils.asGridCoord(14,4)] : true,
      [utils.asGridCoord(14,5)] : true,
      [utils.asGridCoord(14,6)] : true,
      [utils.asGridCoord(14,7)] : true,
      [utils.asGridCoord(14,8)] : true,
      [utils.asGridCoord(14,9)] : true,
      //// bottom wall
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,10)] : true,
      // door is here
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,10)] : true,
      [utils.asGridCoord(12,10)] : true,
      [utils.asGridCoord(13,10)] : true,
      // grocery shelf
      [utils.asGridCoord(1,5)] : true,
      [utils.asGridCoord(2,5)] : true,
      [utils.asGridCoord(3,5)] : true,
      [utils.asGridCoord(4,5)] : true,
      [utils.asGridCoord(5,5)] : true,
      [utils.asGridCoord(6,5)] : true,
      [utils.asGridCoord(7,5)] : true,
      [utils.asGridCoord(8,5)] : true,
      [utils.asGridCoord(9,5)] : true,
      [utils.asGridCoord(10,5)] : true,
      // cash register
      [utils.asGridCoord(9,8)] : true,
      [utils.asGridCoord(10,8)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(12,8)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(1,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "it just seems to go on forever..."},
          ]
        }
      ],
      [utils.asGridCoord(6,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C21_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C21_Bar_pt1: {
    id: "C21_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
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
        direction: "up",
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
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "down", time: 1000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "walk", direction: "up" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "characterO", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "O: Ask me a question."},
            { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            { type: "textMessage", text: "L: What question?"},
            // { type: "textMessage", text: "O: I don't know, something better than that."},
            // { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            // { type: "textMessage", text: "L: Hm."},
            // { who: "characterO", type: "stand",  direction: "up", time: 1000 },
            // { type: "textMessage", text: "O: Hm."},
            // { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            // { type: "textMessage", text: "L: Where do birds go when it's windy?"},
            // { who: "characterO", type: "stand", direction: "left", time: 1000 },
            // { type: "textMessage", text: "O: I don't know, where do they go?"},
            // { type: "textMessage", text: "L: I don't know."},
            // { type: "textMessage", text: "O: Oh, I thought you were setting up a joke."},
            // { type: "textMessage", text: "L: No."},
            // { type: "textMessage", text: "O: Then it's a serious question?"},
            // { type: "textMessage", text: "L: It's serious enough."},
            // { type: "textMessage", text: "O: It's a good one."},
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { who: "characterO", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "stand",  direction: "down", time: 1000 },
            { type: "changeMapNoTransition", map: "C21_Bar_pt2"},
          ]
        }
      ]
    }
  },
  C21_Bar_pt2: {
    id: "C21_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(4),
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
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
        direction: "up",
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
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
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
      [utils.asGridCoord(6,4)]: [
        {
          events: [
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "walk", direction: "down" },
            { type: "changeMapNoTransition", map: "C21_Bar_pt3"},
          ]
        }
      ]
    }
  },
  C21_Bar_pt3: {
    id: "C21_Bar_pt3",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
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
        direction: "up",
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
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
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
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C12_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C22_Bar_pt1: {
    id: "C22_Bar_pt1",
    lowerSrc: "/images/maps/BarLowerNoDoor.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      emptyStool0: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool1: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(6),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool2: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool3: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool4: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
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
      // bottom wall
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      // left wall
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      // right wall
      [utils.asGridCoord(11,4)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C17_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
}
