class Progress {
	constructor(map, playerPosition) {
		// this.mapId = "DemoRoom";
		this.mapId = "C31_Bar_pt1"
		this.startingHeroX = 0;
		this.startingHeroY = 0;
		this.startingHeroDirection = "down";
		this.saveFileKey = "BarTheGame_Savefile1"
	}

	save() {
		window.localStorage.setItem(this.saveFileKey, JSON.stringify({
			mapId: this.mapId,
			startingHeroX: this.startingHeroX,
			startingHeroY: this.startingHeroY,
			startingHeroDirection: this.startingHeroDirection,
			playerState: {
				// if player state is added to the game, it can be stored for save here
			}
		}))
	}

	getSaveFile() {
		const file = window.localStorage.getItem(this.saveFileKey);
		return file ? JSON.parse(file) : null
	}

	load() {
		const file = this.getSaveFile();
		if (file) {
			this.mapId = file.mapId;
			this.startingHeroX = file.startingHeroX;
			this.startingHeroY = file.startingHeroY;
			this.startingHeroDirection = file.startingHeroDirection;
			Object.keys(file.playerState).forEach(key => {
				playerState[key] = file.playerState[key]
			})
		}
	}
}