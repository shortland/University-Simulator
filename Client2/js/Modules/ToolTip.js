export class ToolTip {
  constructor({
    game,
    text = 'Default Text', 
    align = 'left', 
    clickDestroy = true,
    backgroundColor = '#FFFFFF',
    textColor = '#000000',
    x = '16',
    y = '16',
    fontSize = '18px',
    fontType = 'monospace',
    depth = 30,
    visible = true,
  } = {}) {
    this.visible = visible;
    this.text = text;
    this.sizeWrap = 400 - 64;

    this.toolTip = game.add.text(x, y, text, {
      font: fontSize + " " + fontType,
      fill: textColor,
      padding: { x: 16, y: 16 },
      backgroundColor: backgroundColor,
      wordWrap: { width: this.sizeWrap, useAdvancedWrap: true },
    })
    .setAlign(align)
    .setScrollFactor(0)
    .setDepth(depth)
    .setInteractive()
    .setVisible(visible)
    .on('pointerdown', () => {
      if (clickDestroy) {
        this.toolTip.destroy();
      }
    });
  }

  setVisible(bool) {
    this.toolTip.setVisible(bool);
    this.visible = bool;
  }
}