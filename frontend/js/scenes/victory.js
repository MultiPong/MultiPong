class Victory extends Phaser.Scene {
  constructor() {
    super({ key: "Victory" });
  }
  //preloading image that displays upon winning
  preload() {
    this.load.image("victory", "js/assets/images/victory.jpeg");
  }

  create() {
    //creating image that displays upon winning
    const win = this.add.image(this.cameras.main.centerX, 220, "victory");
    win.scale = 0.2;
    //displays text upon winning the match
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 160,
        "YOU WIN.",
        {
          fill: "#0f0",
          fontSize: "32px",
          backgroundColor: "#000",
        }
      )
      .setOrigin(0.5, 0);
  }
}
export default Victory;
