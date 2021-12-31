class PauseMenu {
  constructor({progress, onComplete}) {
    this.progress = progress;
    this.onComplete = onComplete;
  }

  getOptions(pageKey) {
    return [
      {
        label: "This pause menu is not blank",
        description: "it's quietly meditating",
        handler: () => {
          //We'll come back to this...
        }
      },
      {
        label: "Save",
        description: "Save your progress",
        handler: () => {
          this.progress.save();
          this.close();
          //We'll come back to this...
        }
      },
      {
        label: "Close",
        description: "Close the pause menu",
        handler: () => {
          this.close();
        }
      }
    ]
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
