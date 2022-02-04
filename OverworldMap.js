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
        y: utils.withGrid(12),
        direction: 'up',
        src: "/images/characters/people/l_standing.png",
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
        src: "/images/assets/stool_sprite_sheet.png",
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
        direction: 'right',
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
        src: "/images/characters/people/l_standing.png",
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
            { type: "changeMapNoTransition", map: "C14_Bar_pt2"},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C06_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
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
        src: "/images/characters/people/l_standing.png",
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
            // { type: "textMessage", text: "Grocer: Yes, in the first aisle."},
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
            { type: "textMessage", text: "Customer: Then how did you know where to direct me?"},
            { who: "grocer", type: "stand",  direction: "up", time: 1000 },
            { who: "grocer", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "Grocer: We just have the one aisle, here."},
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
        src: "/images/characters/people/l_standing.png",
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
            { type: "textMessage", text: "Grocer: It's quite long."},
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
            { type: "textMessage", text: "O: I don't know, something better than that."},
            { who: "characterL", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "L: Hm."},
            { who: "characterO", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "O: Hm."},
            { who: "characterL", type: "stand",  direction: "down", time: 1000 },
            { type: "textMessage", text: "L: Where do birds go when it's windy?"},
            { who: "characterO", type: "stand", direction: "left", time: 1000 },
            { type: "textMessage", text: "O: I don't know, where do they go?"},
            { type: "textMessage", text: "L: I don't know."},
            { type: "textMessage", text: "O: Oh, I thought you were setting up a joke."},
            { type: "textMessage", text: "L: No."},
            { type: "textMessage", text: "O: Then it's a serious question?"},
            { type: "textMessage", text: "L: It's serious enough."},
            { type: "textMessage", text: "O: It's a good one."},
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
            { type: "changeMap",
              map: "C22_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
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
      [utils.asGridCoord(6,3)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C22_Bar_pt2",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "right"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C22_Bar_pt2: {
    id: "C22_Bar_pt2",
    lowerSrc: "/images/maps/moveable_background_test.png",
    upperSrc: "/images/maps/rooftopupper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        direction: "right",
        dontUseShadow: true,
      }),
      characterN: new Person({
        x: utils.withGrid(31),
        y: utils.withGrid(6),
        src: "/images/characters/people/hero_gray.png",
        direction: "right",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 1000 },
        //   { type: "walk", direction: "right" },
        //   { type: "walk", direction: "right" },
        //   { type: "stand",  direction: "up", time: 1000 },
        //   { type: "walk", direction: "right" },
        //   { type: "stand",  direction: "left", time: 1200 },
        //   { type: "walk", direction: "left" },
        //   { type: "walk", direction: "left" },
        //   { type: "walk", direction: "left" },
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "...lots to do.", faceHero: "characterN" },
            ]
          }
        ]
      }),
    },
    walls: {
      // top of roof
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(12,7)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(14,7)] : true,
      [utils.asGridCoord(15,7)] : true,
      [utils.asGridCoord(16,7)] : true,
      [utils.asGridCoord(17,7)] : true,
      [utils.asGridCoord(18,7)] : true,
      [utils.asGridCoord(19,7)] : true,
      [utils.asGridCoord(20,7)] : true,
      [utils.asGridCoord(21,7)] : true,
      [utils.asGridCoord(22,7)] : true,
      [utils.asGridCoord(23,7)] : true,
      [utils.asGridCoord(24,7)] : true,
      [utils.asGridCoord(25,7)] : true,
      [utils.asGridCoord(26,7)] : true,
      [utils.asGridCoord(27,7)] : true,
      [utils.asGridCoord(28,7)] : true,
      [utils.asGridCoord(29,7)] : true,
      [utils.asGridCoord(30,7)] : true,
      [utils.asGridCoord(31,7)] : true,
      [utils.asGridCoord(32,7)] : true,
      [utils.asGridCoord(33,7)] : true,
      [utils.asGridCoord(34,7)] : true,
      [utils.asGridCoord(35,7)] : true,
      // sky ('top' wall)
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(12,5)] : true,
      [utils.asGridCoord(13,5)] : true,
      [utils.asGridCoord(14,5)] : true,
      [utils.asGridCoord(15,5)] : true,
      [utils.asGridCoord(16,5)] : true,
      [utils.asGridCoord(17,5)] : true,
      [utils.asGridCoord(18,5)] : true,
      [utils.asGridCoord(19,5)] : true,
      [utils.asGridCoord(20,5)] : true,
      [utils.asGridCoord(21,5)] : true,
      [utils.asGridCoord(22,5)] : true,
      [utils.asGridCoord(23,5)] : true,
      [utils.asGridCoord(24,5)] : true,
      [utils.asGridCoord(25,5)] : true,
      [utils.asGridCoord(26,5)] : true,
      [utils.asGridCoord(27,5)] : true,
      [utils.asGridCoord(28,5)] : true,
      [utils.asGridCoord(29,5)] : true,
      [utils.asGridCoord(30,5)] : true,
      [utils.asGridCoord(31,5)] : true,
      [utils.asGridCoord(32,5)] : true,
      [utils.asGridCoord(33,5)] : true,
      [utils.asGridCoord(34,5)] : true,
      [utils.asGridCoord(35,5)] : true,
      // left 'wall'
      [utils.asGridCoord(10,6)] : true,
      // right 'wall'
      [utils.asGridCoord(35,6)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(21, 6)]: [
        {
          events: [
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "right" },
            { type: "textMessage", text: "J: I thought I heard you up here."},
            { who: "characterN", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "N: Yes."},
            // { type: "textMessage", text: "J: How are today's readings?"},
            // { type: "textMessage", text: "N: Unremarkable. Humidity is at forty-three percent."},
            // { type: "textMessage", text: "J: Ah."},
            // { type: "textMessage", text: "N: Thanks for letting me put this up here, by the way."},
            // { type: "textMessage", text: "J: Sure, it's just roof space."},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "It's nice to have an excuse to come up here, anyway."},
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "N: Mm."},
            { who: "hero", type: "stand",  direction: "down", time: 1000 },
            { type: "textMessage", text: "J: Do you have any other stations set up?"},
            // { type: "textMessage", text: "N: Two others. One on top of the grocery store and one on my own roof."},
            // { type: "textMessage", text: "J: And you check on each regularly?"},
            // { type: "textMessage", text: "N: Consistently."},
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "J: Find anything?"},
            // { type: "textMessage", text: "N: Not yet."},
            // { type: "textMessage", text: "J: Well if you ever need a break, there's a bar nearby. First drink is on the house."},
            { who: "characterN", type: "stand",  direction: "up", time: 1000 },
            { who: "characterN", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "N: Not yet."},
            { type: "changeMapNoTransition", map: "C22_Bar_pt3"},
          ]
        }
      ],
    }
  },
  C22_Bar_pt3: {
    id: "C22_Bar_pt3",
    lowerSrc: "/images/maps/moveable_background_test.png",
    upperSrc: "/images/maps/rooftopupper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(29),
        y: utils.withGrid(6),
        direction: "right",
        dontUseShadow: true,
      }),
      characterN: new Person({
        x: utils.withGrid(31),
        y: utils.withGrid(6),
        src: "/images/characters/people/hero_gray.png",
        direction: "right",
        behaviorLoop: [
          { type: "stand",  direction: "right", time: 1000 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "stand",  direction: "up", time: 1000 },
          { type: "walk", direction: "right" },
          { type: "stand",  direction: "left", time: 1200 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "...lots to do.", faceHero: "characterN" },
            ]
          }
        ]
      }),
    },
    walls: {
      // top of roof
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(12,7)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(14,7)] : true,
      [utils.asGridCoord(15,7)] : true,
      [utils.asGridCoord(16,7)] : true,
      [utils.asGridCoord(17,7)] : true,
      [utils.asGridCoord(18,7)] : true,
      [utils.asGridCoord(19,7)] : true,
      [utils.asGridCoord(20,7)] : true,
      [utils.asGridCoord(21,7)] : true,
      [utils.asGridCoord(22,7)] : true,
      [utils.asGridCoord(23,7)] : true,
      [utils.asGridCoord(24,7)] : true,
      [utils.asGridCoord(25,7)] : true,
      [utils.asGridCoord(26,7)] : true,
      [utils.asGridCoord(27,7)] : true,
      [utils.asGridCoord(28,7)] : true,
      [utils.asGridCoord(29,7)] : true,
      [utils.asGridCoord(30,7)] : true,
      [utils.asGridCoord(31,7)] : true,
      [utils.asGridCoord(32,7)] : true,
      [utils.asGridCoord(33,7)] : true,
      [utils.asGridCoord(34,7)] : true,
      [utils.asGridCoord(35,7)] : true,
      // sky ('top' wall)
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(12,5)] : true,
      [utils.asGridCoord(13,5)] : true,
      [utils.asGridCoord(14,5)] : true,
      [utils.asGridCoord(15,5)] : true,
      [utils.asGridCoord(16,5)] : true,
      [utils.asGridCoord(17,5)] : true,
      [utils.asGridCoord(18,5)] : true,
      [utils.asGridCoord(19,5)] : true,
      [utils.asGridCoord(20,5)] : true,
      [utils.asGridCoord(21,5)] : true,
      [utils.asGridCoord(22,5)] : true,
      [utils.asGridCoord(23,5)] : true,
      [utils.asGridCoord(24,5)] : true,
      [utils.asGridCoord(25,5)] : true,
      [utils.asGridCoord(26,5)] : true,
      [utils.asGridCoord(27,5)] : true,
      [utils.asGridCoord(28,5)] : true,
      [utils.asGridCoord(29,5)] : true,
      [utils.asGridCoord(30,5)] : true,
      [utils.asGridCoord(31,5)] : true,
      [utils.asGridCoord(32,5)] : true,
      [utils.asGridCoord(33,5)] : true,
      [utils.asGridCoord(34,5)] : true,
      [utils.asGridCoord(35,5)] : true,
      // left 'wall'
      [utils.asGridCoord(10,6)] : true,
      // right 'wall'
      [utils.asGridCoord(35,6)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { type: "changeMap",
              map: "C23_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "left"
            },
          ]
        }
      ]
    }
  },
  C23_Bar_pt1: {
    id: "C23_Bar_pt1",
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
            { type: "textMessage", text: "L: I don't remember."},
            { type: "textMessage", text: "J: How do you know you were dreaming, then?"},
            { type: "textMessage", text: "L: I felt different when I woke up."},
            { type: "textMessage", text: "Different from what? \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0  \u00A0  \u00A0  \u00A0 \u00A0 \u00A0 \u00A0 Different how?"},
            { who: "characterM", type: "stand",  direction: "right", time: 1000},
            { who: "hero", type: "stand", direction: "up", time: 1000},
            { who: "characterL", type: "stand", direction: "up", time: 1000},
            { who: "hero", type: "stand", direction: "left", time: 1000},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { who: "characterM", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "M: Different how?"},
            { type: "textMessage", text: "L: I don't know. When I woke up, I felt like I had gone somewhere."},
            { type: "textMessage", text: "J: Maybe you sleepwalked."},
            { type: "textMessage", text: "L: What?"},
            { type: "textMessage", text: "M: It means you walked in your sleep."},
            { who: "characterL", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "L: I know what it means. I don't think I walked in my sleep."},
            { type: "textMessage", text: "J: How would you know?"},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "M: You might do it every night."},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "L: But. . . can you sleepwalk without dreaming?"},
            { type: "changeMapNoTransition", map: "C23_Bar_pt2"},
          ]
        }
      ],
    }
  },
  C23_Bar_pt2: {
    id: "C23_Bar_pt2",
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
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C24_Bar_Parking_Lot_Pt1",
              x: utils.withGrid(15),
              y: utils.withGrid(3),
              direction: "right"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C24_Bar_Parking_Lot_Pt1: {
    id: "C24_Bar_Parking_Lot_Pt1",
    // lowerSrc: "/images/maps/parking_lot_wip.png",
    lowerSrc: "/images/maps/parking_lot_lower_bread_animation_5.png",
    // upperSrc: "/images/maps/parkinglot_upper.png",
    upperSrc: "/images/maps/rat_upper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(15),
        y: utils.withGrid(3),
        direction: "right",
        src: "/images/characters/people/rat.png",
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
      [utils.asGridCoord(15,3)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: ".....!" },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "stand",  direction: "up", time: 500 },
            { who: "hero", type: "stand",  direction: "left", time: 500 },
            { who: "hero", type: "stand",  direction: "up", time: 500 },
            { who: "hero", type: "stand",  direction: "left", time: 500 },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "stand",  direction: "left", time: 50 },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { type: "changeMap",
              map: "C25_Grocery_Pt1",
              x: utils.withGrid(13),
              y: utils.withGrid(8),
              direction: "up"
            },
          ],
        },
      ],
    }
  },
  C25_Grocery_Pt1: {
    id: "C25_Grocery_Pt1",
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
        x: utils.withGrid(13),
        y: utils.withGrid(8),
        direction: "up",
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
      [utils.asGridCoord(13,8)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "grocer", type: "stand",  direction: "right", time: 1000},
            { type: "textMessage", text: "Grocer: It's a vending machine."},
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "J: What?"},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "Grocer: The thing you're staring at. It's a vending machine."},
            { type: "textMessage", text: "J: I know."},
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "hero", type: "walk",  direction: "left" },
            { who: "grocer", type: "stand",  direction: "down", time: 1000},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "J: Do you know the person that fills it up buys the soda and water from your store?"},
            { type: "textMessage", text: "Grocer: Sure."},
            // TODO: 'Olives' are being rung up in the novella at this point, so it's like a visual joke
            // might be hard to represent olives in pixel art at this scale, so maybe have lemons/limes
            // being rung up and change line to "Is what strange? Lemons?" for example
            { type: "textMessage", text: "J: You do? Is that strange?"},
            { type: "textMessage", text: "Grocer: Is what strange? Olives?"},
            { type: "textMessage", text: "J: That he sells your product in your store?"},
            { who: "grocer", type: "stand",  direction: "right", time: 1000},
            { who: "grocer", type: "stand",  direction: "down", time: 1000},
            { type: "textMessage", text: "Grocer: He paid for it."},
            { type: "textMessage", text: "And it's a pretty big purchase to fill that vending machine up..."},
            { type: "textMessage", text: "And he  owns another machine or two beyond that... I'm happy for the sale."},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "J: Hm."},
            { type: "textMessage", text: "Grocer: Is it any more odd than you buying your bar ingredients from me?"},
            { who: "hero", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "J: What do you mean?"},
            { type: "textMessage", text: "Grocer: Well, I'm sure you could have these shipped directly to the bar"},
            { type: "textMessage", text: "from the same place you order your alcohol and napkins and everything else, couldn't you?"},
            { type: "textMessage", text: "J: I guess so."},
            { type: "textMessage", text: "But, it's mostly beer and wine drinkers at the bar."},
            { type: "textMessage", text: "I don't think I'd go through ingredients and garnishes like these fast enough"}, 
            { type: "textMessage", text: "for the amount I'd have to order directly."},
            { type: "textMessage", text: "Grocer: I see. Well, why don't you just buy these with your regular groceries for the week?"},
            { type: "textMessage", text: "J: My regular groceries?"},
            { type: "textMessage", text: "Grocer: Yeah, your own food."},
            { type: "textMessage", text: "J: I don't know. I think I try to keep those things separate."},
            { type: "textMessage", text: "Grocer: Why?"},
            { type: "textMessage", text: "J: I don't know. To avoid having to unmix them, maybe."},
            { type: "textMessage", text: "Grocer: I see. Do you live nearby?"},
            { type: "textMessage", text: "J: I live in the bar."},
            { who: "grocer", type: "stand",  direction: "down", time: 1000},
            { type: "textMessage", text: "Grocer: I see."},
            { type: "textMessage", text: "J: In the same building, anyway."},
            { type: "textMessage", text: "Grocer: Of course."},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "J: Do you live in this store?"},
            { type: "textMessage", text: "Grocer: No, but near enough."},
            { who: "hero", type: "stand",  direction: "down", time: 1000 },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "J: Has that logo always been there?"},
            { type: "textMessage", text: "Grocer: More or less."},
            { type: "textMessage", text: "J: Meaning it comes and goes?"},
            { type: "textMessage", text: "Grocer: No, I mean it went up after the window did."},
            { type: "textMessage", text: "J: Does anything ever go missing? A window?"},
            { type: "textMessage", text: "Grocer: Oh sure, windows, toilets. It's no big deal. Things seem to work out."},
            { type: "textMessage", text: "J: Hm. One last thing..."},
            { type: "textMessage", text: "Grocer: Yes?"},
            { type: "textMessage", text: "J: Your logo-- has it always been a duck?"},
            { who: "grocer", type: "stand",  direction: "up", time: 1000 },
            { who: "grocer", type: "stand",  direction: "down", time: 1000 },
            { type: "textMessage", text: "Grocer: More or less."},
            { type: "textMessage", text: "J: I see..."},
            { type: "changeMapNoTransition", map: "C25_Grocery_Pt2"},
          ]
        }
      ],
    }
  }, 
  C25_Grocery_Pt2: {
    id: "C25_Grocery_Pt2",
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
        x: utils.withGrid(11),
        y: utils.withGrid(9),
        direction: "up",
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
              map: "C26_Bar_pt1",
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
  C26_Bar_pt1: {
    id: "C26_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 1800 },
        //   { type: "stand",  direction: "down", time: 4000 }
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
            ]
          }
        ]
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
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { who: "hero", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "J: You know, I don't really think about K. anymore."},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { type: "changeMap",
              map: "C27_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "left"
            },

            // { type: "changeMapNoTransition", map: "C23_Bar_pt2"},
          ]
        }
      ],
    }
  },
  C27_Bar_Pt1: {
    id: "C27_Bar_Pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 1800 },
        //   { type: "stand",  direction: "down", time: 4000 }
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
            ]
          }
        ]
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
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { who: "characterM", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "M: Me neither."},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { type: "textMessage", text: ". . . ."},
            { type: "changeMapNoTransition", map: "C27_Bar_Pt2"},
          ]
        }
      ],
    }
  },
  C27_Bar_Pt2: {
    id: "C27_Bar_Pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "left",
      }),
      characterM: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/characters/people/m_sitting.png",
        direction: "right",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 1800 },
        //   { type: "stand",  direction: "down", time: 4000 }
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
            ]
          }
        ]
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
            { type: "changeMap",
              map: "C28_Bar",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ]
        }
      ],
    }
  },
  C28_Bar: {
    id: "C28_Bar",
    lowerSrc: "/images/maps/BarFrontLowerShadowNoDoor.png",
    upperSrc: "/images/maps/BarFrontLowerShadowNoDoor.png",
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
            { type: "textMessage", text: "Notice: The bar is closed as its door has disappeared."},
            { type: "textMessage", text: "We apologize for the inconvenience."},
            { type: "changeMap",
              map: "C29_Rooftop_pt1",
              x: utils.withGrid(29),
              y: utils.withGrid(6),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C29_Rooftop_pt1: {
    id: "C29_Rooftop_pt1",
    lowerSrc: "/images/maps/rooftopblueskylower.png",
    upperSrc: "/images/maps/rooftopupper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(29),
        y: utils.withGrid(6),
        direction: "down",
        dontUseShadow: true,
      }),
      characterN: new Person({
        x: utils.withGrid(31),
        y: utils.withGrid(6),
        src: "/images/characters/people/hero_gray.png",
        direction: "right",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 1000 },
        //   { type: "walk", direction: "right" },
        //   { type: "walk", direction: "right" },
        //   { type: "stand",  direction: "up", time: 1000 },
        //   { type: "walk", direction: "right" },
        //   { type: "stand",  direction: "left", time: 1200 },
        //   { type: "walk", direction: "left" },
        //   { type: "walk", direction: "left" },
        //   { type: "walk", direction: "left" },
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "...lots to do.", faceHero: "characterN" },
            ]
          }
        ]
      }),
    },
    walls: {
      // top of roof
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(12,7)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(14,7)] : true,
      [utils.asGridCoord(15,7)] : true,
      [utils.asGridCoord(16,7)] : true,
      [utils.asGridCoord(17,7)] : true,
      [utils.asGridCoord(18,7)] : true,
      [utils.asGridCoord(19,7)] : true,
      [utils.asGridCoord(20,7)] : true,
      [utils.asGridCoord(21,7)] : true,
      [utils.asGridCoord(22,7)] : true,
      [utils.asGridCoord(23,7)] : true,
      [utils.asGridCoord(24,7)] : true,
      [utils.asGridCoord(25,7)] : true,
      [utils.asGridCoord(26,7)] : true,
      [utils.asGridCoord(27,7)] : true,
      [utils.asGridCoord(28,7)] : true,
      [utils.asGridCoord(29,7)] : true,
      [utils.asGridCoord(30,7)] : true,
      [utils.asGridCoord(31,7)] : true,
      [utils.asGridCoord(32,7)] : true,
      [utils.asGridCoord(33,7)] : true,
      [utils.asGridCoord(34,7)] : true,
      [utils.asGridCoord(35,7)] : true,
      // sky ('top' wall)
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(12,5)] : true,
      [utils.asGridCoord(13,5)] : true,
      [utils.asGridCoord(14,5)] : true,
      [utils.asGridCoord(15,5)] : true,
      [utils.asGridCoord(16,5)] : true,
      [utils.asGridCoord(17,5)] : true,
      [utils.asGridCoord(18,5)] : true,
      [utils.asGridCoord(19,5)] : true,
      [utils.asGridCoord(20,5)] : true,
      [utils.asGridCoord(21,5)] : true,
      [utils.asGridCoord(22,5)] : true,
      [utils.asGridCoord(23,5)] : true,
      [utils.asGridCoord(24,5)] : true,
      [utils.asGridCoord(25,5)] : true,
      [utils.asGridCoord(26,5)] : true,
      [utils.asGridCoord(27,5)] : true,
      [utils.asGridCoord(28,5)] : true,
      [utils.asGridCoord(29,5)] : true,
      [utils.asGridCoord(30,5)] : true,
      [utils.asGridCoord(31,5)] : true,
      [utils.asGridCoord(32,5)] : true,
      [utils.asGridCoord(33,5)] : true,
      [utils.asGridCoord(34,5)] : true,
      [utils.asGridCoord(35,5)] : true,
      // left 'wall'
      [utils.asGridCoord(10,6)] : true,
      // right 'wall'
      [utils.asGridCoord(35,6)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(29, 6)]: [
        {
          events: [
            // { who: "hero", type: "walk", direction: "right" },
            { type: "textMessage", text: "J: It's hard to look at the sky for too long, even with the sun at your back."},
            { type: "textMessage", text: "N: People forget how bright the sun is. You can stand in the shadow of a building and still see just fine."},
            { type: "textMessage", text: "J: I saw bits of white floating like little sattelites or snow."},
            { type: "textMessage", text: "N: Entoptic phenomenon."},
            { type: "textMessage", text: "J: What?"},
            { type: "textMessage", text: "N: Your eye is rendering visible some objects within the eye itself."},
            { type: "textMessage", text: "J: My eye is seeing itself?"},
            { type: "textMessage", text: "N: In a sense."},
            { type: "textMessage", text: "J: Hm."},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "J: Have those buildings always been there?"},
            { type: "textMessage", text: "N: No, not always."},
            { who: "hero", type: "stand",  direction: "down", time: 1000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "J: How's the air pressure today?"},
            { type: "textMessage", text: "N: Nominal."},
            { type: "textMessage", text: "J: Has it always been? Today?"},
            { type: "textMessage", text: "N: Yes."},
            { type: "textMessage", text: "J: Hm."},
            { type: "changeMapNoTransition", map: "C29_Rooftop_pt2"},
          ]
        }
      ],
    }
  },
  C29_Rooftop_pt2: {
    id: "C29_Rooftop_pt2",
    lowerSrc: "/images/maps/rooftopblueskylower.png",
    upperSrc: "/images/maps/rooftopupper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(29),
        y: utils.withGrid(6),
        direction: "right",
        dontUseShadow: true,
      }),
      characterN: new Person({
        x: utils.withGrid(31),
        y: utils.withGrid(6),
        src: "/images/characters/people/hero_gray.png",
        direction: "right",
        behaviorLoop: [
          { type: "stand",  direction: "right", time: 1000 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "stand",  direction: "up", time: 1000 },
          { type: "walk", direction: "right" },
          { type: "stand",  direction: "left", time: 1200 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "...lots to do.", faceHero: "characterN" },
            ]
          }
        ]
      }),
    },
    walls: {
      // top of roof
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(12,7)] : true,
      [utils.asGridCoord(13,7)] : true,
      [utils.asGridCoord(14,7)] : true,
      [utils.asGridCoord(15,7)] : true,
      [utils.asGridCoord(16,7)] : true,
      [utils.asGridCoord(17,7)] : true,
      [utils.asGridCoord(18,7)] : true,
      [utils.asGridCoord(19,7)] : true,
      [utils.asGridCoord(20,7)] : true,
      [utils.asGridCoord(21,7)] : true,
      [utils.asGridCoord(22,7)] : true,
      [utils.asGridCoord(23,7)] : true,
      [utils.asGridCoord(24,7)] : true,
      [utils.asGridCoord(25,7)] : true,
      [utils.asGridCoord(26,7)] : true,
      [utils.asGridCoord(27,7)] : true,
      [utils.asGridCoord(28,7)] : true,
      [utils.asGridCoord(29,7)] : true,
      [utils.asGridCoord(30,7)] : true,
      [utils.asGridCoord(31,7)] : true,
      [utils.asGridCoord(32,7)] : true,
      [utils.asGridCoord(33,7)] : true,
      [utils.asGridCoord(34,7)] : true,
      [utils.asGridCoord(35,7)] : true,
      // sky ('top' wall)
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(12,5)] : true,
      [utils.asGridCoord(13,5)] : true,
      [utils.asGridCoord(14,5)] : true,
      [utils.asGridCoord(15,5)] : true,
      [utils.asGridCoord(16,5)] : true,
      [utils.asGridCoord(17,5)] : true,
      [utils.asGridCoord(18,5)] : true,
      [utils.asGridCoord(19,5)] : true,
      [utils.asGridCoord(20,5)] : true,
      [utils.asGridCoord(21,5)] : true,
      [utils.asGridCoord(22,5)] : true,
      [utils.asGridCoord(23,5)] : true,
      [utils.asGridCoord(24,5)] : true,
      [utils.asGridCoord(25,5)] : true,
      [utils.asGridCoord(26,5)] : true,
      [utils.asGridCoord(27,5)] : true,
      [utils.asGridCoord(28,5)] : true,
      [utils.asGridCoord(29,5)] : true,
      [utils.asGridCoord(30,5)] : true,
      [utils.asGridCoord(31,5)] : true,
      [utils.asGridCoord(32,5)] : true,
      [utils.asGridCoord(33,5)] : true,
      [utils.asGridCoord(34,5)] : true,
      [utils.asGridCoord(35,5)] : true,
      // left 'wall'
      [utils.asGridCoord(10,6)] : true,
      // right 'wall'
      [utils.asGridCoord(35,6)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11, 6)]: [
        {
          events: [
            { type: "changeMap",
              map: "C30_Parking_lot_pt1",
              x: utils.withGrid(11),
              y: utils.withGrid(11),
              direction: "up"
            },
          ]
        }
      ],
    }
  },
  C30_Parking_lot_pt1: {
    id: "C30_Parking_lot_pt1",
    lowerSrc: "/images/maps/testtest.png",
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
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "up", time: 3000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "changeMapNoTransition", map: "C30_Parking_lot_pt2" },
          ],
        },
      ],
    }
  },
  C30_Parking_lot_pt2: {
    id: "C30_Parking_lot_pt2",
    lowerSrc: "/images/maps/parking_lot_lower_bread_animation_1.png",
    upperSrc: "/images/maps/uppertesttest.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(7),
        direction: "right",
      }),
      cameraOverrider: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(6),
        src: "/images/characters/people/no_sprite_placeholder_for_text_scenes.png",
        removeWall: true,
        dontUseShadow: true,
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(11,7)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: ". . . . . . . . *rustle* . . . . . *rustle* . . . . ."},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "??"},
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "walk",  direction: "up" },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "!!"},
            { type: "changeMap",
              map: "C31_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ],
        },
      ],
    }
  },
  C31_Bar_pt1: {
    id: "C31_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 300 },
        //   { type: "stand",  direction: "down", time: 5000 }
        // ],
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
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 1800 },
        //   { type: "stand",  direction: "down", time: 4000 }
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
            ]
          }
        ]
      }),
      characterN: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(2),
        src: "/images/characters/people/characterNStanding.png",
        direction: "down",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 300 },
        //   { type: "stand",  direction: "down", time: 5000 }
        // ],
        // talking: [
        //   {
        //     events: [
        //       { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
        //       { type: "textMessage", text: "I'm inquisitive and cheerful!"},
        //     ]
        //   }
        // ]
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
            { who: "characterN", type: "stand", direction: "down", time: 2000},
            { who: "characterN", type: "walk", direction: "down"},
            { who: "characterN", type: "walk", direction: "down"},
            { who: "characterN", type: "walk", direction: "down"},
            { who: "characterN", type: "walk", direction: "right"},
            { who: "characterN", type: "walk", direction: "right"},
            { who: "characterN", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "N: Beer, please."},
            { who: "characterN", type: "walk", direction: "right"},
            { who: "characterN", type: "walk", direction: "down"},
            { who: "characterN", type: "walk", direction: "down"},
            { who: "characterN", type: "walk", direction: "left"},
            { type: "changeMapNoTransition", map: "C31_Bar_pt2"},
          ]
        }
      ],
    }
  },
  C31_Bar_pt2: {
    id: "C31_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 300 },
        //   { type: "stand",  direction: "down", time: 5000 }
        // ],
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
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 1800 },
        //   { type: "stand",  direction: "down", time: 4000 }
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
            ]
          }
        ]
      }),
      characterN: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/n_sitting.png",
        direction: "left",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 300 },
        //   { type: "stand",  direction: "down", time: 5000 }
        // ],
        // talking: [
        //   {
        //     events: [
        //       { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
        //       { type: "textMessage", text: "I'm inquisitive and cheerful!"},
        //     ]
        //   }
        // ]
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
            { who: "characterN", type: "stand", direction: "left", time: 1000},
            { who: "characterN", type: "stand", direction: "up", time: 2000},
            { who: "hero", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "J: So, you've figured something out."},
            { type: "textMessage", text: "N: Mm."},
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "M: Hello, N."},
            { who: "characterN", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "N: Hi."},
            { who: "characterN", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "L: Hi, N."},
            { who: "characterN", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "N: Hello."},
            { type: "textMessage", text: "L: What did you figure out?"},
            { type: "textMessage", text: "N: I'm not sure."},
            { type: "textMessage", text: "M: You've been up there a while."},
            { type: "textMessage", text: "N: Two months."},
            { type: "textMessage", text: "Thirty days each up on the roof of the bar or the grocery store, alternating between the two every other day."},
            { type: "textMessage", text: "L: What do you think is coming?"},
            { type: "textMessage", text: "N: Hm?"},
            { type: "textMessage", text: "M: What are you forecasting?"},
            { type: "textMessage", text: "N: Oh. Nothing."},
            { type: "textMessage", text: "M: Nothing?"},
            { type: "textMessage", text: "N: I'm studying readings from each day and comparing them to reports from days before."},
            { type: "textMessage", text: "I'm not guessing at what might happen tomorrow."},
            { type: "textMessage", text: "L: You're looking back in time?"},
            { type: "textMessage", text: "N: Only as a reference."},
            { type: "textMessage", text: "M: But yesterday already happened."},
            { who: "characterN", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "N: I suppose so."},
            { type: "textMessage", text: "L: So did most of today."},
            { type: "textMessage", text: "M: What difference does that make?"},
            { type: "textMessage", text: "L: I don't know. About a day's worth, I guess."},
            { who: "hero", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "J: What are you trying to figure out, N.?"},
            { type: "textMessage", text: "N: Oh, I don't know anymore. I thought maybe this bar and the grocery store were the same place."},
            { who: "hero", type: "stand", direction: "down", time: 750},
            { who: "characterL", type: "stand", direction: "right", time: 750},
            { who: "characterM", type: "stand", direction: "right", time: 750},
            { who: "hero", type: "stand", direction: "left", time: 750},
            { who: "characterM", type: "stand", direction: "down", time: 750},
            { who: "characterL", type: "stand", direction: "up", time: 750},
            { who: "characterM", type: "stand", direction: "down", time: 750},
            { type: "textMessage", text: "M: What do you mean? Geographically?"},
            { who: "characterL", type: "stand", direction: "right", time: 750},
            { type: "textMessage", text: "L: Geometrically?"},
            { who: "characterN", type: "stand", direction: "left", time: 750},
            { type: "textMessage", text: "N: Neither, and, both."},
            { type: "textMessage", text: "L: I see..."},
            { type: "textMessage", text: "M: I don't."},
            { who: "characterN", type: "stand", direction: "up", time: 750},
            { type: "textMessage", text: "N: Yes."},
            { type: "textMessage", text: "J: You thought my bar was the grocery store, and that it was my bar?"},
            { type: "textMessage", text: "N: More or less."},
            { type: "textMessage", text: "M: But you've been to both."},
            { who: "characterN", type: "stand", direction: "left", time: 750},
            { type: "textMessage", text: "N: Consistently, for months."},
            { type: "textMessage", text: "J: What were you measuring?"},
            { who: "characterN", type: "stand", direction: "up", time: 750},
            { type: "textMessage", text: "N: Everything."},
            { type: "textMessage", text: "J: And?"},
            { type: "textMessage", text: "N: It was all different."},
            { type: "textMessage", text: "L: The bar and the grocery store aren't that far apart."},
            { type: "textMessage", text: "I would have thought some measurements would be the same."},
            { type: "textMessage", text: "N: Some were, sometimes."},
            { type: "textMessage", text: "L: Then maybe the two places are the same place sometimes."},
            { who: "characterM", type: "stand", direction: "down", time: 750},
            { type: "textMessage", text: "M: They're two different places."},
            { type: "textMessage", text: "J: They do seem different."},
            { who: "characterL", type: "stand", direction: "right", time: 750},
            { type: "textMessage", text: "L: Very different?"},
            { type: "textMessage", text: "J: Not very different, I guess. Different enough, though."},
            { type: "textMessage", text: "L: How different is that?"},
            { who: "hero", type: "stand", direction: "right", time: 750},
            { type: "textMessage", text: "J: What measurements were you expecting?"},
            { type: "textMessage", text: "N: Correlated ones. But there was no pattern at all."},
            { type: "textMessage", text: "M: Maybe it's because you only checked one building or the other each day."},
            { type: "textMessage", text: "N: Each station was still taking measurements when I wasn't there though."},
            { type: "textMessage", text: "M: Maybe you take down measurements differently when you're looking at them."},
            { type: "textMessage", text: "N: Maybe."},
            { type: "textMessage", text: "L: Maybe what you needed to measure was something happening at too small a scale to measure."},
            { type: "textMessage", text: "N: Maybe. But my instruments are pretty precise."},
            { type: "textMessage", text: "J: Or maybe it's too big to measure."},
            { type: "textMessage", text: "Maybe the bar and the store are part of a much larger collection of the same building."},
            { type: "textMessage", text: "N: Many more points in arrangement. It's possible."},
            { type: "textMessage", text: "L: That's surely it."},
            { who: "characterM", type: "stand", direction: "right", time: 750},
            { who: "characterM", type: "stand", direction: "down", time: 750},
            { who: "hero", type: "stand", direction: "down", time: 750},
            { who: "hero", type: "stand", direction: "right", time: 750},
            { type: "textMessage", text: "J: What about the third station?"},
            { type: "textMessage", text: "N: The one on my roof?"},
            { type: "textMessage", text: "J: Yeah. What were its readings like?"},
            { type: "textMessage", text: "N: I only got a few day's worth and those few days of readings were pretty erratic."},
            { type: "textMessage", text: "I removed its measurements from the set as outliers."},
            { type: "textMessage", text: "M: What happened after a few days?"},
            { type: "textMessage", text: "N: It disappeared."},
            { type: "textMessage", text: "J: Disappeared. It was stolen?"},
            { type: "textMessage", text: "N: No. I don't think so, anyway."},
            { type: "textMessage", text: "L: You should have put bars around it."},
            { type: "changeMapNoTransition", map: "C31_Bar_pt3"},
          ]
        }
      ],
    }
  },
  C31_Bar_pt3: {
    id: "C31_Bar_pt3",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      characterL: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/l_sitting.png",
        direction: "right",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 300 },
        //   { type: "stand",  direction: "down", time: 5000 }
        // ],
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
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 1800 },
        //   { type: "stand",  direction: "down", time: 4000 }
        // ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "M. here.", faceHero: "characterM" },
              { type: "textMessage", text: "I'm kind of grumpy."},
            ]
          }
        ]
      }),
      characterN: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/n_sitting.png",
        direction: "left",
        // behaviorLoop: [
        //   { type: "stand",  direction: "right", time: 300 },
        //   { type: "stand",  direction: "down", time: 5000 }
        // ],
        // talking: [
        //   {
        //     events: [
        //       { type: "textMessage", text: "It's me, L!", faceHero: "characterL" },
        //       { type: "textMessage", text: "I'm inquisitive and cheerful!"},
        //     ]
        //   }
        // ]
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
              map: "C32_TextScene",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ]
        }
      ],
    }
  },
  C32_TextScene: {
    id: "C32_TextScene",
    lowerSrc: "/images/maps/all_black_screen.png",
    upperSrc: "/images/maps/all_black_screen.png",
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
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Will I need an umbrella, today? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . Did it rain yesterday? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . The day after? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . Did we go outside? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "changeMap",
              map: "C33_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C33_Bar_Pt1: {
    id: "C33_Bar_Pt1",
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { who: "hero", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "J: Do ducks migrate?"},
            { type: "textMessage", text: "O: Sure."},
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { who: "hero", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "J: Where do they go?"},
            { type: "textMessage", text: "L: South."},
            { who: "hero", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "J: South where?"},
            { type: "textMessage", text: "M: South of here."},
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "J: Why?"},
            { type: "textMessage", text: "M: Cold."},
            { type: "textMessage", text: "L: Food."},
            { type: "textMessage", text: "O: Warmth."},
            { who: "characterL", type: "stand", direction: "right", time: 750},
            { who: "characterL", type: "stand", direction: "up", time: 750},
            { who: "characterL", type: "stand", direction: "right", time: 750},
            { type: "textMessage", text: "L: They would freeze."},
            { type: "textMessage", text: "J: They would freeze?"},
            { type: "textMessage", text: "M: Their eggs might."},
            { type: "textMessage", text: "L: That's sad to think about."},
            { who: "characterO", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "O: Which one is sad to think about?"},
            { type: "textMessage", text: "M: Either."},
            { type: "textMessage", text: "L: Both."},
            { who: "characterO", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "O: Either or both."},
            { type: "changeMapNoTransition", map: "C33_Bar_Pt2"},
          ]
        }
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
            { type: "changeMap",
              map: "C02_Bar",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C33_Bar_Pt2: {
    id: "C33_Bar_Pt2",
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C34_Grocery_pt1",
              x: utils.withGrid(13),
              y: utils.withGrid(5),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C34_Grocery_pt1: {
    id: "C34_Grocery_pt1",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_store_upper.png",
    gameObjects: {
      grocer: new Person({
        x: utils.withGrid(12),
        y: utils.withGrid(5),
        src: "/images/characters/people/grocer.png",
        direction: "right",
      }),
      hero: new Person({
        x: utils.withGrid(13),
        y: utils.withGrid(5),
        src: "/images/characters/people/vending_machine_guy.png",
        direction: "up",
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
      [utils.asGridCoord(13,5)]: [
        {
          events: [
            { who: "hero", type: "stand", direction: "up", time: 1000 },
            { who: "hero", type: "stand", direction: "left", time: 1000 },
            { type: "textMessage", text: "VENDING MACHINE GUY: What do you mean inside?"},
            { type: "textMessage", text: "GROCER: I don't know, inside the machine."},
            { type: "textMessage", text: "VENDING MACHINE GUY: There's no room for a person in there. It's full of bottles and cans and machine parts."},
            { who: "grocer", type: "stand", direction: "up", time: 1000 },
            { who: "grocer", type: "stand", direction: "right", time: 1000 },
            { type: "textMessage", text: "GROCER: It just seems like there's more to it than that."},
            { type: "textMessage", text: "VENDING MACHINE GUY: Maybe."},
            { who: "hero", type: "stand", direction: "up", time: 1000 },
            { type: "textMessage", text: "The vending machine game doesn't really attract people with much in the way of imagination."},
            { who: "grocer", type: "stand", direction: "up", time: 1000 },
            { type: "textMessage", text: "GROCER: Listen to that thing hum. What else do you think that thing could be?"},
            { who: "hero", type: "stand", direction: "left", time: 1000 },
            { type: "textMessage", text: "VENDING MACHINE GUY: It's a vending machine."},
            { type: "textMessage", text: "GROCER: It's a sound repeating itself."},
            { who: "hero", type: "stand", direction: "down", time: 1000 },
            { type: "textMessage", text: "VENDING MACHINE GUY: It vends soda."},
            { type: "changeMapNoTransition", map: "C34_Grocery_pt2"},
          ]
        }
      ],
    }
  },
  C34_Grocery_pt2: {
    id: "C34_Grocery_pt2",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_store_upper.png",
    gameObjects: {
      grocer: new Person({
        x: utils.withGrid(12),
        y: utils.withGrid(5),
        src: "/images/characters/people/grocer.png",
        direction: "right",
      }),
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(13),
        y: utils.withGrid(5),
        src: "/images/characters/people/vending_machine_guy.png",
        direction: "down",
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
              map: "C35_Bar_Pt1",
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
  C35_Bar_Pt1: {
    id: "C35_Bar_Pt1",
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
      [utils.asGridCoord(5,5)]: [
        {
          events: [
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "J: Do you think there could be rats in the walls of the bar?"},
            { type: "textMessage", text: "L: !!!!"},
            { type: "textMessage", text: "O: Rats? In the walls?"},
            { type: "textMessage", text: "J: Mm."},
            { type: "textMessage", text: "O: You shouldn't ask your customers if there are rats in the walls."},
            { type: "textMessage", text: "L: I don't like rats. Why would there be rats in the walls?"},
            { type: "textMessage", text: "J: I don't know. I saw one by the dumpster."},
            { type: "textMessage", text: "O: Well there you go."},
            { type: "textMessage", text: "J: There I go what?"},
            { type: "textMessage", text: "L: *Where*."},
            { type: "textMessage", text: "J: Where what?"},
            { type: "textMessage", text: "L: There I go *where*."},
            { type: "textMessage", text: "O: If the rat was by the dumpster, then it's not in the wall."},
            { type: "textMessage", text: "J: Hm."},
            { type: "textMessage", text: "L: Well, there you are."},
            { type: "changeMapNoTransition", map: "C35_Bar_Pt2"},
          ]
        }
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
            { type: "changeMap",
              map: "C02_Bar",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C35_Bar_Pt2: {
    id: "C35_Bar_Pt2",
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
            { who: "hero", type: "walk",  direction: "down" },
            { type: "textMessage", text: "Probably shouldn't go to the roof right now..."},
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C36_TextScene",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C36_TextScene: {
    id: "C36_TextScene",
    lowerSrc: "/images/maps/all_black_screen.png",
    upperSrc: "/images/maps/all_black_screen.png",
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
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Do you think this place really could be another place? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Or, any of a thousand others? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . All of a thousand others? . . . . . . . . . . . . . . . . . . . . . . . . . . . .  . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . Yes ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . Well... . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "You don't know? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . No."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "changeMap",
              map: "C37_Temple_Scene_Pt1",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C37_Temple_Scene_Pt1: {
    id: "C37_Temple_Scene_Pt1",
    lowerSrc: "/images/maps/temple_lower_with_holy_water_vending_machine.png",
    upperSrc: "/images/maps/temple_lower_with_holy_water_vending_machine.png",
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
            { type: "textMessage", text: "- - - - - - - - - - ROMAN EGYPT, 1 A.D. - - - - - - - - -"},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "There is a box outside of a temple."},
            { type: "textMessage", text: "There is a slot cut into the box."},
            { type: "textMessage", text: "When a coin is deposited into the slot the coin falls onto a lever."},
            { type: "textMessage", text: "The coin acts as a weight, pushing the other side of the lever up, like a seesaw."},
            { type: "textMessage", text: "The lever is connected to a plug."},
            { type: "textMessage", text: "The plug is stopping the flow of liquid in a container."},
            { type: "textMessage", text: "As the lever lifts upward, the plug comes away from the container's opening, allowing its contents to flow."},
            { type: "textMessage", text: "The coin slips downwards until it falls off one end of the lever."},
            { type: "textMessage", text: "This change in weight returns the lever to its original position."},
            { type: "textMessage", text: "This puts the plug back in place."},
            { type: "textMessage", text: "There is a box outside of a temple."},
            { type: "textMessage", text: "There are hands with open palms in front of a box outside of a temple."},
            { type: "textMessage", text: "There is holy water spilling into the hands with open palms in front of a box outside of a temple."},
            { type: "textMessage", text: "There are relative positions of fulcrum, effort, and resistance."},
            { type: "textMessage", text: "There are hands and a coin."},
            { type: "textMessage", text: "There are forces at work."},
            { type: "textMessage", text: "There is a vending machine."},
            { type: "changeMap",
              map: "C38_TextScene",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C38_TextScene: {
    id: "C38_TextScene",
    lowerSrc: "/images/maps/all_black_screen.png",
    upperSrc: "/images/maps/all_black_screen.png",
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
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . What would it mean . . . . . . . to be in . . . . . . . . . another place? . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "changeMap",
              map: "C39_Grocery_pt1",
              x: utils.withGrid(10),
              y: utils.withGrid(9),
              direction: "up"
            },
          ],
        },
      ]
    }
  },
  C39_Grocery_pt1: {
    id: "C39_Grocery_pt1",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_store_upper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(9),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer.png",
      }),
      fruitEnjoyer2: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(9),
        direction: "up",
        src: "/images/characters/people/hero_gray.png",
      }),
      fruitEnjoyer1: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(9),
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
      [utils.asGridCoord(9,7)]: [
        {
          events: [
            { who: "fruitEnjoyer2", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "stand",  direction: "down", time: 1000},
            { who: "hero", type: "walk",  direction: "right" },
            { who: "hero", type: "stand",  direction: "down", time: 1000},
            { type: "textMessage", text: "GROCER: Did you know the circumference of an orange is infinite?"},
            { who: "fruitEnjoyer2", type: "stand",  direction: "right", time: 50 },
            { who: "fruitEnjoyer1", type: "stand",  direction: "left", time: 50 },
            { who: "fruitEnjoyer2", type: "stand",  direction: "right", time: 1000 },
            { who: "fruitEnjoyer1", type: "stand",  direction: "left", time: 1000 },
            { who: "fruitEnjoyer2", type: "stand",  direction: "up", time: 50 },
            { who: "fruitEnjoyer1", type: "stand",  direction: "up", time: 50 },
            { who: "fruitEnjoyer2", type: "stand",  direction: "up", time: 1000 },
            { who: "fruitEnjoyer1", type: "stand",  direction: "up", time: 1000 },
            { type: "textMessage", text: "GROCER: And think about how many oranges I have!"},
            { type: "changeMapNoTransition", map: "C39_Grocery_pt2"},
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
  C39_Grocery_pt2: {
    id: "C39_Grocery_pt2",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_store_upper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer.png",
        // src: "/images/characters/people/new_k_standing.png",
        direction: "down",
      }),
      fruitEnjoyer2: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(9),
        direction: "up",
        src: "/images/characters/people/hero_gray.png",
      }),
      fruitEnjoyer1: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(9),
        src: "/images/characters/people/hero_gray.png",
        direction: "up",
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
  C40_Car_Animation_pt1: {
    id: "C40_Car_Animation_pt1",
    lowerSrc: "/images/maps/car_zoom_k_frame_1.png",
    upperSrc: "/images/maps/car_zoom_k_frame_1.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt2" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt2: {
    id: "C40_Car_Animation_pt1",
    lowerSrc: "/images/maps/car_zoom_k_frame_2.png",
    upperSrc: "/images/maps/car_zoom_k_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt3" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt3: {
    id: "C40_Car_Animation_pt3",
    lowerSrc: "/images/maps/car_zoom_k_frame_1.png",
    upperSrc: "/images/maps/car_zoom_k_frame_1.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt4" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt4: {
    id: "C40_Car_Animation_pt4",
    lowerSrc: "/images/maps/car_zoom_k_frame_2.png",
    upperSrc: "/images/maps/car_zoom_k_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt5" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt5: {
    id: "C40_Car_Animation_pt5",
    lowerSrc: "/images/maps/car_zoom_k_frame_1.png",
    upperSrc: "/images/maps/car_zoom_k_frame_1.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt6" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt6: {
    id: "C40_Car_Animation_pt6",
    lowerSrc: "/images/maps/car_zoom_k_frame_2.png",
    upperSrc: "/images/maps/car_zoom_k_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt7" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt7: {
    id: "C40_Car_Animation_pt7",
    lowerSrc: "/images/maps/car_zoom_k_frame_1.png",
    upperSrc: "/images/maps/car_zoom_k_frame_1.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt8" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt8: {
    id: "C40_Car_Animation_pt8",
    lowerSrc: "/images/maps/car_zoom_weather_machine_frame_1.png",
    upperSrc: "/images/maps/car_zoom_weather_machine_frame_1.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt9" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt9: {
    id: "C40_Car_Animation_pt9",
    lowerSrc: "/images/maps/car_zoom_weather_machine_frame_2.png",
    upperSrc: "/images/maps/car_zoom_weather_machine_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt10" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt10: {
    id: "C40_Car_Animation_pt10",
    lowerSrc: "/images/maps/car_zoom_weather_machine_frame_1.png",
    upperSrc: "/images/maps/car_zoom_weather_machine_frame_1.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt11" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt11: {
    id: "C40_Car_Animation_pt11",
    lowerSrc: "/images/maps/car_zoom_weather_machine_frame_2.png",
    upperSrc: "/images/maps/car_zoom_weather_machine_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt12" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt12: {
    id: "C40_Car_Animation_pt12",
    lowerSrc: "/images/maps/car_zoom_weather_machine_frame_1.png",
    upperSrc: "/images/maps/car_zoom_weather_machine_frame_1.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt13" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt13: {
    id: "C40_Car_Animation_pt13",
    lowerSrc: "/images/maps/car_zoom_weather_machine_frame_2.png",
    upperSrc: "/images/maps/car_zoom_weather_machine_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt14" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt14: {
    id: "C40_Car_Animation_pt14",
    lowerSrc: "/images/maps/car_zoom_weather_machine_frame_1.png",
    upperSrc: "/images/maps/car_zoom_weather_machine_frame_1.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt15" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt15: {
    id: "C40_Car_Animation_pt15",
    lowerSrc: "/images/maps/car_lower_2nd_version.png",
    upperSrc: "/images/maps/car_lower_2nd_version.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt16" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt16: {
    id: "C40_Car_Animation_pt16",
    lowerSrc: "/images/maps/car_lower_frame_2.png",
    upperSrc: "/images/maps/car_lower_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt17" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt17: {
    id: "C40_Car_Animation_pt17",
    lowerSrc: "/images/maps/car_lower_2nd_version.png",
    upperSrc: "/images/maps/car_lower_2nd_version.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt18" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt18: {
    id: "C40_Car_Animation_pt18",
    lowerSrc: "/images/maps/car_lower_frame_2.png",
    upperSrc: "/images/maps/car_lower_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt19" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt19: {
    id: "C40_Car_Animation_pt19",
    lowerSrc: "/images/maps/car_lower_2nd_version.png",
    upperSrc: "/images/maps/car_lower_2nd_version.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt20" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt20: {
    id: "C40_Car_Animation_pt20",
    lowerSrc: "/images/maps/car_lower_frame_2.png",
    upperSrc: "/images/maps/car_lower_frame_2.png",
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
            { type: "changeMapNoTransition", map: "C40_Car_Animation_pt21" },
          ],
        },
      ]
    }
  },
  C40_Car_Animation_pt21: {
    id: "C40_Car_Animation_pt21",
    lowerSrc: "/images/maps/car_lower_2nd_version.png",
    upperSrc: "/images/maps/car_lower_2nd_version.png",
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
            { type: "changeMap",
              map: "C41_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C41_Bar_pt1: {
    id: "C41_Bar_pt1",
    lowerSrc: "/images/maps/C41_BarLowerWithWeatherMachine.png",
    upperSrc: "/images/maps/C41_BarUpperWithWeatherMachine.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(5),
      }),
      characterK: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/k_sitting.png",
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
      emptyStool5: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool7: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
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
      // weather machine
      [utils.asGridCoord(8,7)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(6,5)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { who: "hero", type: "stand",  direction: "down", time: 1500 },
            { type: "textMessage", text: "J: It just appeared?"},
            { who: "characterK", type: "stand",  direction: "right", time: 1500 },
            { who: "characterK", type: "stand",  direction: "up", time: 1500 },
            { type: "textMessage", text: "K: I guess so. It wasn't there before, anyway, and then, it was."},
            { type: "textMessage", text: "J: N. will be glad to know it's back."},
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { who: "hero", type: "stand",  direction: "down", time: 1500 },
            { type: "textMessage", text: "J: Or, maybe not. This is a pretty big outlier. How did you know to bring it here, anyway?"},
            { type: "textMessage", text: "K: An address of somewhere in this town is written on its underside."},
            { type: "textMessage", text: "J: You really looked this thing over."},
            { type: "textMessage", text: "K: Sure. It's not every day a weather station appears in your bedroom."},
            { type: "textMessage", text: "J: I guess not. Will you stay for another drink?"},
            { who: "characterK", type: "stand",  direction: "right", time: 1500 },
            { who: "characterK", type: "stand",  direction: "up", time: 1500 },
            { type: "textMessage", text: "K: Sure. It's not everyday I appear with a weather station."},
            { type: "changeMapNoTransition", map: "C41_Bar_pt2" },
            // { type: "changeMap",
            //   map: "DemoRoom",
            //   x: utils.withGrid(5),
            //   y: utils.withGrid(5),
            //   direction: "down"
            // },
          ],
        },
      ],
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "changeMap",
              map: "DemoRoom",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C41_Bar_pt2: {
    id: "C41_Bar_pt2",
    lowerSrc: "/images/maps/C41_BarLowerWithWeatherMachine.png",
    upperSrc: "/images/maps/C41_BarUpperWithWeatherMachine.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(5),
      }),
      characterK: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/k_sitting.png",
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
      emptyStool5: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool7: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
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
      // weather machine
      [utils.asGridCoord(8,7)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C42_TextScene",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C42_TextScene: {
    id: "C42_TextScene",
    lowerSrc: "/images/maps/all_black_screen.png",
    upperSrc: "/images/maps/all_black_screen.png",
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
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Which . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . froze . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . first . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . the duck . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . or . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: "the egg? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "changeMap",
              map: "C33_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C43_Bar_pt1: {
    id: "C43_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(5),
      }),
      characterK: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/k_sitting.png",
        direction: "up",
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
      [utils.asGridCoord(6,5)]: [
        {
          events: [
            { type: "textMessage", text: "L: K.! You're back." },
            { type: "textMessage", text: "K: Just visiting."},
            { type: "textMessage", text: "L: For how long?"},
            { type: "textMessage", text: "K: For just this visit."},
            { type: "textMessage", text: "M: Where are you living, these days?"},
            { type: "textMessage", text: "K: I didn't move all that far. The town I live in is about the size of this one, more or less."},
            { type: "textMessage", text: "M: What is the town like?"},
            { type: "textMessage", text: "K: It's quiet enough, busy enough. It's right on the coast. It's got a bar and a grocery store."},
            { type: "textMessage", text: "J: Maybe I'll head down there some time." },
            { type: "textMessage", text: "M: Living near the coast sounds nice."},
            { type: "textMessage", text: "L: Sometimes, especially if it's raining, I pretend the rushing pass of cars is the sound of waves breaking." },
            { type: "textMessage", text: "Are you near enough the coast to hear the surf?" },
            { type: "textMessage", text: "K: I am."},
            { type: "textMessage", text: "L: What does it sound like?"},
            { type: "textMessage", text: "K: Like the rushing pass of cars."},
            { type: "changeMapNoTransition", map: "C43_Bar_pt2" },
            // { type: "changeMap",
            //   map: "DemoRoom",
            //   x: utils.withGrid(5),
            //   y: utils.withGrid(5),
            //   direction: "down"
            // },
          ],
        },
      ],
      [utils.asGridCoord(11,6)]: [
        {
          events: [
            { who: "hero", type: "stand",  direction: "right", time: 1500 },
            { type: "changeMap",
              map: "DemoRoom",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
  C43_Bar_pt2: {
    id: "C43_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(5),
      }),
      characterK: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/k_sitting.png",
        direction: "up",
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
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap",
              map: "C44_Grocery_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "up"
            },
          ],
        },
      ]
    }
  },
  C44_Grocery_pt1: {
    id: "C44_Grocery_pt1",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_upper_with_sign.png",
    gameObjects: {
      grocer: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer.png",
      }),
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(7),
        y: utils.withGrid(8),
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
      [utils.asGridCoord(7,8)]: [
        {
          events: [
          // { type: "textMessage", text: "test test test"},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "Customer: You put a sign above the aisle?"},
            { type: "textMessage", text: "Grocer: Yes."},
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "stand",  direction: "right", time: 1000 },
            { type: "textMessage", text: "Customer: Why?"},
            { who: "grocer", type: "stand",  direction: "up", time: 1000 },
            { who: "grocer", type: "stand",  direction: "left", time: 1000 },
            { type: "textMessage", text: "Grocer: For the convenience of my customers."},
            { who: "grocer", type: "stand",  direction: "up", time: 1000 },
            { who: "hero", type: "stand",  direction: "up", time: 1000 },
            { who: "grocer", type: "stand",  direction: "up", time: 1000 },
            { who: "grocer", type: "stand",  direction: "down", time: 1000 },
            { type: "changeMapNoTransition", map: "C44_Grocery_pt2"},
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
  C44_Grocery_pt2: {
    id: "C44_Grocery_pt2",
    lowerSrc: "/images/maps/grocery_store_lower.png",
    upperSrc: "/images/maps/grocery_upper_with_sign.png",
    gameObjects: {
      grocer: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer.png",
        direction: 'down',
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
        x: utils.withGrid(7),
        y: utils.withGrid(8),
        direction: 'up',
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
              map: "C45_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C45_Bar_pt1: {
    id: "C45_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      characterN: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/n_sitting.png",
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
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
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
            { who: "characterN", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "J: Can I ask you a question?"},
            { type: "textMessage", text: "N: Sure."},
            { type: "textMessage", text: "J: Which way is south?"},
            { type: "textMessage", text: "N: That's not an interesting question."},
            { type: "textMessage", text: "J: I guess not."},
            { type: "textMessage", text: "N: South of where?"},
            { type: "textMessage", text: "J: Of here."},
            { who: "characterN", type: "stand", direction: "down", time: 1000},
            { who: "characterN", type: "stand", direction: "right", time: 1000},
            { who: "characterN", type: "stand", direction: "left", time: 1000},
            { who: "characterN", type: "stand", direction: "down", time: 1000},
            { who: "characterN", type: "stand", direction: "left", time: 1500},
            { type: "textMessage", text: "N: There."},
            { who: "hero", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "N: ..."},
            { who: "characterN", type: "stand", direction: "right", time: 1500},
            { type: "textMessage", text: "N: Well, from there to there, I suppose."},
            { who: "hero", type: "stand", direction: "right", time: 1000},
            { who: "characterN", type: "stand", direction: "down", time: 1500},
            { type: "textMessage", text: "N: Well, and also that way, eventually."},
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { who: "characterN", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "J: I see.."},
            { type: "changeMapNoTransition", map: "C45_Bar_pt2"},
          ]
        }
      ],
    }
  },
  C45_Bar_pt2: {
    id: "C45_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      characterN: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/n_sitting.png",
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
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
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
  C46_Bar_pt1: {
    id: "C46_Bar_pt1",
    lowerSrc: "/images/maps/BarLowerWithSliderMenu.png",
    upperSrc: "/images/maps/BarUpperWithSlider.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
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
            { who: "hero", type: "stand", direction: "down", time: 1500},
            { type: "textMessage", text: "J: I'm thinking of going to out where K. is."},
            { type: "textMessage", text: "L: A visit?"},
            { type: "textMessage", text: "M: What for?"},
            { who: "characterL", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "L: To see K."},
            { who: "characterM", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "M: K. Just visited."},
            { type: "textMessage", text: "J: The sea sounds nice."},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "L: It does sound nice."},
            { who: "characterM", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "M: It's all the same."},
            { type: "textMessage", text: "L: How so?"},
            { who: "characterM", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "M: There's a bar, a grocery store, people-- you heard what K. said."},
            { who: "characterL", type: "stand", direction: "up", time: 750},
            { who: "characterL", type: "stand", direction: "down", time: 1500},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "L: There's no sea here."},
            { type: "textMessage", text: "M: We're in a bar."},
            { who: "characterM", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "M: What is a slider?"},
            { type: "textMessage", text: "J: Hamburger."},
            { type: "textMessage", text: "M: Then why not call it a hamburger?"},
            { type: "textMessage", text: "L: It's different."},
            { who: "characterM", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "M: How?"},
            { type: "textMessage", text: "J: Smaller."},
            { who: "characterM", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "M: Smaller isn't different."},
            { who: "characterL", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "L: Isn't it?"},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "L: Is it?"},
            { type: "textMessage", text: "J: Not really; sort of. I think the sea is nice. I'm going to go."},
            { type: "textMessage", text: "M: I don't think you will."},
            { who: "characterL", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "L: You're very, what is the word, contrarian today."},
            { who: "characterM", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "M: No I'm not."},
            { who: "hero", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "J: Why won't I go?"},
            { who: "characterM", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "M: Because you're here."},
            { type: "textMessage", text: "J: Where?"},
            { type: "textMessage", text: "M: This bar, this town, this, well, this."},
            { type: "textMessage", text: "J: I don't know; I choose to be here."},
            { type: "textMessage", text: "M: That's what I said."},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { who: "characterL", type: "stand", direction: "down", time: 1000},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "L: How many sliders do you get in an order?"},
            { type: "textMessage", text: "J: A hamburger's worth."},
            { type: "changeMapNoTransition", map: "C46_Bar_pt2"},
          ]
        }
      ],
    }
  },
  C46_Bar_pt2: {
    id: "C46_Bar_pt2",
    lowerSrc: "/images/maps/BarLowerWithSliderMenu.png",
    upperSrc: "/images/maps/BarUpperWithSlider.png",
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
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            // { type: "changeMap", map: "C06_Bar_Pt1" },
            { type: "changeMap",
              map: "C47_Bar_pt1",
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
  C47_Bar_pt1: {
    id: "C47_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      characterN: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/n_sitting.png",
        direction: "up",
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
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
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
            { who: "characterN", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "L: Nice weather, huh?"},
            { who: "characterN", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "N: What?"},
            { type: "textMessage", text: "L: I said, 'nice weather.'"},
            { who: "characterN", type: "stand", direction: "down", time: 1000},
            { who: "characterN", type: "stand", direction: "right", time: 1000},
            { who: "characterN", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "N: In the bar?"},
            { type: "textMessage", text: "L: What?"},
            { type: "textMessage", text: "N: Nice weather in the bar?"},
            { who: "characterL", type: "stand", direction: "down", time: 1000},
            { who: "characterL", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "L: Outside of it."},
            { who: "characterN", type: "stand", direction: "down", time: 1000},
            { who: "characterN", type: "stand", direction: "up", time: 1000},
            { type: "changeMapNoTransition", map: "C47_Bar_pt2"},
          ]
        }
      ],
    }
  },
  C47_Bar_pt2: {
    id: "C47_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      characterN: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/n_sitting.png",
        direction: "up",
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
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
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
              map: "C48_Bar_pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "right"
            },
            // { type: "textMessage", text: "this should be chapter 6..."},
          ]
        }
      ]
    }
  },
  C48_Bar_pt1: {
    id: "C48_Bar_pt1",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "right",
      }),
      customer: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/customer_sitting.png",
        direction: "up",
      }),
      grocer: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(12),
        src: "/images/characters/people/grocer.png",
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
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
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
            { who: "hero", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "GROCER: A beer please, bartender."},
            { who: "grocer", type: "walk",  direction: "up" },
            { who: "grocer", type: "walk",  direction: "up" },
            { who: "grocer", type: "walk",  direction: "up" },
            { who: "grocer", type: "walk",  direction: "up" },
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "J: Sure thing. We were just talking about you."},
            { type: "textMessage", text: "GROCER: We?"},
            { who: "customer", type: "stand", direction: "left", time: 1000},
            { who: "customer", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "GROCER: Oh-- you! I'll never escape you."},
            { type: "textMessage", text: "CUSTOMER: I've been thinking about the grocery store aisle some more."},
            { type: "changeMapNoTransition", map: "C48_Bar_pt2"},

          ]
        }
      ],
    }
  },
  C48_Bar_pt2: {
    id: "C48_Bar_pt2",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      customer: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/customer_sitting.png",
        direction: "down",
      }),
      grocer: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer_sitting.png",
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
      emptyStool4: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
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
            { who: "grocer", type: "stand", direction: "up", time: 1000},
            { who: "grocer", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "GROCER: I'm sure you have."},
            { who: "customer", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "CUSTOMER: The problem is one of arrangement."},
            { type: "textMessage", text: "GROCER: I just sell groceries."},
            { type: "textMessage", text: "CUSTOMER: Do you want to get rid of the aisles in your store or not?"},
            { type: "textMessage", text: "GROCER: I thought you wanted me to add more aisles?"},
            { type: "textMessage", text: "CUSTOMER: You said that you wouldn't so I thought in the other direction."},
            { type: "textMessage", text: "GROCER: You thought in the other direction?"},
            { type: "textMessage", text: "CUSTOMER: Instead of adding more aisles you could remove them."},
            { type: "textMessage", text: "GROCER: I did do that."},
            { type: "textMessage", text: "CUSTOMER: But you left one."},
            { type: "textMessage", text: "GROCER: But you said I have to have one aisle, as no aisle is still an aisle."},
            { type: "textMessage", text: "CUSTOMER: Right, zero as one."},
            { type: "textMessage", text: "GROCER: One as zero."},
            { type: "textMessage", text: "CUSTOMER: But that's not really zero. That's the problem."},
            { type: "textMessage", text: "GROCER: What's the problem?"},
            { type: "textMessage", text: "CUSTOMER: The problem is you've arranged a set with nothing in it."},
            { who: "grocer", type: "stand", direction: "down", time: 1000},
            { who: "grocer", type: "stand", direction: "right", time: 1000},
            { type: "textMessage", text: "GROCER: I have?"},
            { type: "textMessage", text: "CUSTOMER: You have."},
            { type: "textMessage", text: "GROCER: What do I do?"},
            { type: "textMessage", text: "CUSTOMER: You have to get rid of the set."},
            { type: "textMessage", text: "GROCER: Get rid of the set?"},
            { type: "textMessage", text: "CUSTOMER: True zero."},
            { type: "textMessage", text: "GROCER: What does that mean?"},
            { type: "textMessage", text: "CUSTOMER: What does it mean?"},
            { type: "textMessage", text: "GROCER: Yes, practically."},
            { type: "textMessage", text: "CUSTOMER: Oh what does it practically mean."},
            { type: "textMessage", text: "GROCER: Mm."},
            { who: "customer", type: "stand", direction: "down", time: 1000},
            { who: "customer", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "CUSTOMER: Well, you'll have to get rid of the grocery store."},
            { who: "grocer", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "GROCER: I will?"},
            { who: "customer", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "CUSTOMER: Yep."},
            { type: "textMessage", text: "GROCER: What will I do?"},
            { who: "customer", type: "stand", direction: "left", time: 1000},
            { type: "textMessage", text: "CUSTOMER: Whatever you want. The store will be completely efficient."},
            { who: "customer", type: "stand", direction: "up", time: 1000},
            { type: "textMessage", text: "GROCER: I could go to the sea, I guess."},
            { who: "grocer", type: "stand", direction: "down", time: 1000},
            { who: "hero", type: "stand", direction: "right", time: 1000},
            { who: "hero", type: "stand", direction: "down", time: 1000},
            { type: "textMessage", text: "J: Where will I buy food?"},
            { type: "changeMapNoTransition", map: "C48_Bar_pt3"},
          ]
        }
      ],
    }
  },
  C48_Bar_pt3: {
    id: "C48_Bar_pt3",
    lowerSrc: "/images/maps/C01_BarLowerWithHardwood.png",
    upperSrc: "/images/maps/C01_BarUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "down",
      }),
      customer: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/people/customer_sitting.png",
        direction: "up",
      }),
      grocer: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/people/grocer_sitting.png",
        direction: "down",
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
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/assets/stool_sprite_sheet.png",
      }),
      emptyStool5: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        src: "/images/assets/slightly_raised_stool_sprite_sheet.png",
      }),
      emptyStool6: new Person({
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
            { type: "changeMap",
              map: "C49_TextScene",
              x: utils.withGrid(11),
              y: utils.withGrid(6),
              direction: "down"
            },
          ]
        }
      ]
    }
  },
  C49_TextScene: {
    id: "C49_TextScene",
    lowerSrc: "/images/maps/all_black_screen.png",
    upperSrc: "/images/maps/all_black_screen.png",
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
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "You can't know the future, not really, anyway . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . You can tell the way things are heading . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "How? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . By looking at where they've been,"},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . and where they've been before that . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Looking back, ahead? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . Looking at trajectories of objects in space . . . . . . . . . . . ."},
            { type: "textMessage", text: "Weather patterns . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: "Conversations? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . Sure . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . Thoughts? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Hm... . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . Hm... . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "How can you determine an object's heading? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "How fast is it moving? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "When? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Thoughts? . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Hm . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: "Hm . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . "},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "textMessage", text: ". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."},
            { type: "changeMap",
              map: "C33_Bar_Pt1",
              x: utils.withGrid(5),
              y: utils.withGrid(5),
              direction: "down"
            },
          ],
        },
      ]
    }
  },
}
