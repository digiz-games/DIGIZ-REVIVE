var Dead = {
  create: function () {
    game.stage.backgroundColor = '#050b1d';
    var result = VirgoResults;
    var portrait = game.width < game.height;
    var size = Math.max(19, Math.min(38, game.width / 15));
    var message = 'GAME OVER\n\nNaves destruidas: ' + result.score + '\nTiempo: ' + result.seconds + ' s\nRécord: ' + result.record;
    var txt = game.add.text(game.width / 2, game.height * 0.42, message,
      {font:'bold ' + size + 'px Arial',fill:'#ffffff',align:'center',stroke:'#000000',strokeThickness:4});
    txt.anchor.set(0.5);
    txt.wordWrap = true;
    txt.wordWrapWidth = game.width * 0.92;
    var btn = game.add.text(game.width / 2, game.height * 0.79, 'VOLVER AL MENÚ',
      {font:'bold ' + Math.max(20, size * 0.85) + 'px Arial',fill:'#72fff1',align:'center'});
    btn.anchor.set(0.5);
    btn.inputEnabled = true;
    btn.input.useHandCursor = true;
    btn.events.onInputDown.add(this.goMenu, this);
    // Automatic return; button allows an earlier return.
    this.returnEvent = game.time.events.add(6000, this.goMenu, this);
  },
  goMenu: function () {
    if (this.returnEvent) { game.time.events.remove(this.returnEvent); this.returnEvent = null; }
    game.state.start('Menu', true, false);
  },
  shutdown: function () { if (this.returnEvent) game.time.events.remove(this.returnEvent); this.returnEvent = null; }
};
