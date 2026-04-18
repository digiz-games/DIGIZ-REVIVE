var score = 0;
var record = localStorage.getItem("record");

if(score > record || record == null){
  localStorage.setItem("record",score);
};
var record = localStorage.getItem("record");
var Menu = {
  preload: function(){
    game.stage.backgroundColor = '#000000';
    game.load.image("boton", "assets/sprites/boton.png");
    game.load.image("fondo", "assets/map/fondo.jpg");
    game.load.image("logo", "assets/map/virgo_menu.png");
    game.load.image("fondologo", "assets/map/virgo_enemies.png");


    //game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    //game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    firstRunLandscape = game.scale.isGameLandscape;
    game.scale.forceOrientation(false, true);
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setShowAll();
    window.addEventListener('resize', function () {  this.game.scale.refresh();});

    this.game.scale.refresh();

  },
  create: function(){

    game.add.tileSprite(0, 0, 1000, 1000, 'fondo');


    var boton = this.add.button(game.width/2,game.height/2 +100,'boton',this.iniciarJuego,this);
    boton.anchor.setTo(0.5);
    boton.scale.setTo(0.8, 0.8);


    fondologo = game.add.sprite(game.width/2,game.height/2 -30, 'fondologo');
    fondologo.anchor.setTo(0.5, 0.5);
    logo = game.add.sprite(game.width/2,game.height/2 -30, 'logo');
    logo.anchor.setTo(0.5, 0.5);
    //logo.scale.setTo(0.2, 0.2);

    text = game.add.text(game.width/2, game.height/2 +20 , 'Record: '+ record, { font: "50px Arial", fill: "#ffffff", align: "center" });

      text.anchor.set(0.5);
     text.align = 'center';
     text.font = 'Arial Black';
     text.fontSize = 40;
     text.fontWeight = 'bold';
     text.stroke = '#000000';
     text.strokeThickness = 6;
     text.fill = '#ffffff';

  },


  iniciarJuego: function(){

    game.state.start('Game',true,false);
  }

};
