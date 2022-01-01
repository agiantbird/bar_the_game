class TitleScreen {
	constructor({progress}) {
		// progress is for load game option
		this.progress = progress;
	}

	getOptions(resolve) {
		const saveFile = this.progress.getSaveFile();
		return [
			{
				label: "Start reading",
				description: ".. .. .. .. Where are we ? . . . .",
				handler: () => {
					this.close();
					resolve();
				}	
			},
			saveFile ? {
				label: "Continue book",
				description: ".. .. .. . Where were we ? . . . .",
				handler: () => {
					this.close();
					resolve(saveFile);
					//.....
				}
			} : null
		].filter(v => v)
		// ^ filter out anything not truthy
	}

	createElement() {
		this.element = document.createElement("div");
		this.element.classList.add("TitleScreen");
		this.element.innerHTML = (`
			<img class="TitleScreen_logo" src="/images/logo.png" alt="Bar the game" />
		`)
	}

	close() {
		this.keyboardMenu.end();
		this.element.remove();
	}

	init(container) {
		return new Promise(resolve => {
			this.createElement();
			container.appendChild(this.element);
			this.keyboardMenu = new KeyboardMenu();
			this.keyboardMenu.init(this.element);
			this.keyboardMenu.setOptions(this.getOptions(resolve))
		})
	}
}
