class Defeat extends Phaser.Scene {
  constructor() {
    super({ key: "Defeat" });
  }
  //preloading image that displays upon losing
  preload() {
    this.load.image("defeat", "js/assets/images/defeat.png");
  }

  create() {
    //creating image that displays upon losing
    const lose = this.add.image(this.cameras.main.centerX, 220, "defeat");
    lose.scale = 0.5;
    //displays text upon losing the match
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 160,
        "YOU LOSE.",
        {
          fill: "#0f0",
          fontSize: "32px",
          backgroundColor: "#000",
        }
      )
      .setOrigin(0.5, 0);
  }
}
export default Defeat;
