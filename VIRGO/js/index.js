var gameRatio = window.innerWidth/window.innerHeight;
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, document.getElementById('game'));
var firstRunLandscape;


game.state.add('Menu',Menu);
game.state.add('Game',Game);
game.state.add('Dead',Dead);

game.state.start('Menu');

function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    //alert('Connection type: ' + states[networkState]);
    if (networkState != Connection.NONE){

      var admobid = {};
       if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon-fireos
         admobid = {
           banner: 'ca-app-pub-3940256099942544/6300978111', // or DFP format "/6253334/dfp_example_ad"
           interstitial: 'ca-app-pub-3940256099942544/1033173712'
         };
      };

      if(AdMob) AdMob.createBanner({
        adId: admobid.banner,
        position: AdMob.AD_POSITION.TOP_CENTER,
        autoShow: true });

        if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:false} );


      document.addEventListener('onAdDismiss', function(e){
          // handle the event
          if(AdMob) AdMob.prepareInterstitial( {adId:admobid.interstitial, autoShow:false} );

      });


    };
};

checkConnection();
