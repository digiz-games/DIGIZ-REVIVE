var VirgoStorage = {
  key: 'virgo_high_score',
  get: function () {
    try { return Math.max(0, parseInt(localStorage.getItem(this.key) || localStorage.getItem('record') || '0', 10) || 0); }
    catch (e) { return 0; }
  },
  save: function (value) {
    var best = Math.max(this.get(), Math.floor(value || 0));
    try { localStorage.setItem(this.key, String(best)); localStorage.setItem('record', String(best)); } catch (e) {}
    return best;
  }
};
var VirgoResults = { score: 0, seconds: 0, record: 0 };
var Menu = {
  preload: function () {
    game.stage.backgroundColor = '#000000';
    game.load.image('virgoDesktop', 'Virgo_nav.png');
    game.load.image('virgoMobile', 'Virgo_ cel.png');
  },
  create: function () {
    this.bg = game.add.sprite(0, 0, this.isPortrait() ? 'virgoMobile' : 'virgoDesktop');
    this.bg.inputEnabled = false;
    this.recordText = game.add.text(0, 0, '', {font:'bold 25px Arial',fill:'#ffffff',stroke:'#000000',strokeThickness:5,align:'center'});
    this.recordText.anchor.set(0.5);
    this.playButton = game.add.text(0, 0, '▶ JUGAR', {font:'bold 32px Arial',fill:'#ffffff',stroke:'#001b29',strokeThickness:6,align:'center'});
    this.playButton.anchor.set(0.5);
    this.playButton.inputEnabled = true;
    this.playButton.input.useHandCursor = true;
    this.playButton.events.onInputDown.add(this.startGame, this);
    this.layout();
    this.resizeHandler = this.layout.bind(this);
    window.addEventListener('resize', this.resizeHandler);
  },
  isPortrait: function () { return game.width < game.height; },
  layout: function () {
    if (!this.bg || !this.bg.exists) return;
    var portrait = this.isPortrait(), key = portrait ? 'virgoMobile' : 'virgoDesktop';
    if (this.bg.key !== key) this.bg.loadTexture(key);
    // Cover the canvas without distorting the artwork; edges may crop.
    var scale = Math.max(game.width / this.bg.texture.width, game.height / this.bg.texture.height);
    this.bg.scale.set(scale);
    this.bg.x = (game.width - this.bg.width) / 2;
    this.bg.y = (game.height - this.bg.height) / 2;
    this.recordText.text = 'RÉCORD: ' + VirgoStorage.get();
    this.recordText.x = game.width / 2;
    this.recordText.y = game.height * (portrait ? 0.75 : 0.77);
    this.playButton.x = game.width / 2;
    this.playButton.y = game.height * (portrait ? 0.85 : 0.87);
    var fontScale = Math.min(1.2, Math.max(0.6, game.width / 700));
    this.recordText.scale.set(fontScale);
    this.playButton.scale.set(fontScale);
  },
  startGame: function () { game.state.start('Game', true, false); },
  shutdown: function () { if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler); }
};
