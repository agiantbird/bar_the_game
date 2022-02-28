class PauseMenu {
  constructor({progress, onComplete}) {
    this.progress = progress;
    this.onComplete = onComplete;
  }

  getOptions(pageKey) {
    //Case 1: Show the first page of options
    if (pageKey === "root") {
      return [
        {
          label: "Save",
          description: "Save your progress. Choose 'Continue Book' when you come back to resume.",
          handler: () => {
            this.progress.save();
            this.close();
          }
        },
        {
          label: "Controls",
          description: "Remind yourself of the game's controls",
          handler: () => {
            this.keyboardMenu.setOptions(this.getOptions("controls"))
          }
        },
        {
          label: "Acknowledgment: Drew Conley",
          description: "I'd like to thank...",
          handler: () => {
            this.keyboardMenu.setOptions(this.getOptions("thankyou1"))
          }
        },
        {
          label: "Acknowledgment: Eric Torrey",
          description: "I'd also like to thank...",
          handler: () => {
            this.keyboardMenu.setOptions(this.getOptions("thankyou2"))
          }
        },
        {
          label: "Acknowledgment: Stephanie Boyer",
          description: "I'd also like to thank...",
          handler: () => {
            this.keyboardMenu.setOptions(this.getOptions("thankyou3"))
          }
        },
        {
          label: "Close",
          description: "Close the pause menu",
          handler: () => {
            this.close();
          }
        },
      ]
    }
    // case 2: controls menu
    if (pageKey === "controls") {
      return[
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "Movement: WASD or arrow buttons",
          description: "",
          handler: () => {
            
          }
        },
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "Press ENTER to intereact with objects and people, as well as to advance dialogue.",
          description: "",
          handler: () => {
            
          }
        },
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: '',
          handler: () => {
          }
        },
        {
          label: "[Back]",
          description: "Back to root menu",
          handler: () => {
            this.keyboardMenu.setOptions( this.getOptions("root") );
          }
        }
      ];
    }
    // case 3: Acknowledgment1 menu
    if (pageKey === "thankyou1") {
      return[
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "This game owes everything to Drew Conley's 'Pizza Legends RPG' series.",
          description: "",
          handler: () => {
            
          }
        },
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "Click the link below to check out that series of video tutorials and start on your own game.",
          description: "",
          handler: () => {
            
          }
        },
        {
          label: (`<a href="https://youtu.be/fyi4vfbKEeo" target="_blank">Pizza Legends RPG</a>`),
          description: '',
          handler: () => {
          }
        },
        {
          label: "[Back]",
          description: "Back to root menu",
          handler: () => {
            this.keyboardMenu.setOptions( this.getOptions("root") );
          }
        }
      ];
    }
    // case 4: Acknowledgment2 menu
    if(pageKey == "thankyou2") {
      return[
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "When I was considering how to adapt my novella, BAR, into a game, ",
          description: "",
          handler: () => {
            
          }
        },
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "it was my friend Eric Torrey who suggested an HTML + JavaScript approach.",
          description: "",
          handler: () => {
          }
        },
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "Thank you, Eric, for your help and encouragement!",
          description: '',
          handler: () => {
          }
        },
        {
          label: "[Back]",
          description: "Back to root menu",
          handler: () => {
            this.keyboardMenu.setOptions( this.getOptions("root") );
          }
        }
      ];
    }
    // case 5: Acknowledgment2 menu
    if(pageKey == "thankyou3") {
      return[
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "Thank you, finally, to my heartbeat, Stephanie Boyer.",
          description: "",
          handler: () => {
            
          }
        },
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: "To fill your heart and mind with real art, go look at Stephanie's paintings:",
          description: "",
          handler: () => {
          }
        },
        {
          label: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
          description: "",
          handler: () => {
          }
        },
        {
          label: (`<a href="https://www.stephanielboyer.com/" target="_blank">Stephanie Boyer Art</a>`),
          description: '',
          handler: () => {
          }
        },
        {
          label: "[Back]",
          description: "Back to root menu",
          handler: () => {
            this.keyboardMenu.setOptions( this.getOptions("root") );
          }
        }
      ];
    }
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("PauseMenu")
    this.element.innerHTML = (`
      <h2>Taking a breather</h2>
    `)
  }

  close() {
    this.esc?.unbind();
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }

  async init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions("root"));

    container.appendChild(this.element);

    utils.wait(200);
    this.esc = new KeyPressListener("Escape", () => {
      this.close();
    })
  }
}
