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
          label: "Aknowledgements",
          description: "I'd like to thank...",
          handler: () => {
            this.keyboardMenu.setOptions(this.getOptions("thankyous"))
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

    // case 2: aknowledgement1 menu
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
