/*
 * Youtube Chromeless Video Plugin
 * http://www.viget.com/
 *
 * Copyright (c) 2010 Trevor Davis
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://jquery.org/license
 *
 * @version 0.4
 */
 
(function($) {
  $.fn.ytchromeless = function(options){
    
    //Initial configuration
    var config = {
      videoWidth  : '640',
      videoHeight : '360',
      videoIdBase : 'ytplayer',
      params : { 
		    allowScriptAccess: 'always',
		    wmode: 'transparent'
		  }
    };
        
    return this.each(function(i) {
      
      
      // initial var setup
      
        var o    = $.extend(config, options),
      
            // set jQuery objects
            $link      = $(this),

            // set variables          
            url        = $link.attr('href'),
            videoId    = $link.attr('id') || o.videoIdBase + i,
            ytVideoId  = url.substr(31),

            // new DOM elements
            $video     = $link.wrap( '<div class="video-player"></div>' ).parent(),
            $controls  = $('<div class="video-controls"></div>' ).appendTo( $video ),
            $toReplace = $('<div class="video"></div>').prependTo( $video ).attr('id', videoId),
            $bar,
            $indicator,
            $loaded,
            $mute,
            $play,
            $seek,

            // set up the special player object
            player;
           
        // bind public methods upfront 
        $video.bind({

          // playing, pausing, muting, 
          'togglePlay' : function(){ $video.togglePlay(); },
          'play'       : function(){ $video.play(); },
          'pause'      : function(){ $video.pause(); },
          'toggleMute' : function(){ $video.toggleMute(); },
          'mute'       : function(){ $video.mute(); },
          'unMute'     : function(){ $video.unMute(); },
          'seek'       : function(){ $video.seek(); },

          // initializing and revising the player
          'update'     : function(){ $video.update(); },
          'cue'        : function(){ player.cueVideoById( ytVideoId ); }

        });


      // control methods
        
        // function fired when the play/pause button is hit
        $video.togglePlay = function() {
          if( $play.hasClass('playing') ) {
            $video.trigger('pause');
          } else {
            $video.trigger('play');
          }
          return false;
        };
      
        // play the video
        $video.play = function() {
          player.playVideo();
          $play.removeClass('paused').addClass('playing').attr('title','Pause');        
        };  
      
        // pause
        $video.pause = function() {
          player.pauseVideo();
          $play.removeClass('playing').addClass('paused').attr('title','Play');
        };
        
        // function fired when the mute/unmute button is hit
        $video.toggleMute = function() {
          if( $mute.hasClass('muted') ) {
            $video.trigger('unMute');
          } else {
            $video.trigger('mute');
          }
          return false;
        };
      
        // mute the video
        $video.mute = function() {
          player.mute();
          $mute.addClass('muted').attr('title','Un-Mute');        
        };   
      
        // unmute
        $video.unMute = function() {
          player.unMute();
          $mute.removeClass('muted').attr('title','Mute');
        };
        
        //Seek to a position in the video
    		$video.seek = function(seekPosition) {
          var seekToPosition = Math.round(player.getDuration() * seekPosition);
          player.seekTo(seekToPosition, false);
        };
        
        
        
      // player init and update methods
      
        //Update the video status
    		$video.update = function() {
    		  
    		  if( player && player.getDuration ) {

            if( player.getPlayerState() === 1 ) {
              $video.play();
            } else if ( player.getPlayerState() === 0 ) {
              $video.pause();
            }

            if( player.getVideoLoadedFraction() > 0) {
              var loadedAmount = Math.round(Math.min(player.getVideoLoadedFraction(), 1) * 100);
              $loaded.css( 'width', loadedAmount + '%' );
            }
            
            if( player.getCurrentTime() > 0 ) {
              var videoPosition = ( player.getCurrentTime() / player.getDuration() ) * 100;
              $indicator.css( 'left', videoPosition + '%' );
            }

    		  }

    		};
    		
  		
  			// the youtube movie calls this method when it loads
  			// DO NOT CHANGE THIS METHOD'S NAME
    		onYouTubePlayerReady = function( videoId ) {

    		  var $videoRef = $( document.getElementById( videoId ) ).parent();

    		  setInterval(function(){
    		    $videoRef.trigger('update');
    		  }, 250);
    		  
          $videoRef.trigger('cue');

        };
    	
  		
  		
      // init methods
      
        // the embed!
    		$video.init = function() {
  		  
    		  swfobject.embedSWF(
            'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=' + videoId,
            videoId, 
            o.videoWidth, 
            o.videoHeight, 
            '8', 
            null, 
            null, 
            o.params, 
            { id: videoId },
            function(){
              player = document.getElementById( videoId );
            }
          );
          
          $video.addControls();

    		};

        // add controls
    		$video.addControls = function() {

    		  //Play and pause button
    		  $play = $('<a/>', {
    		            href: '#',
            		    'class': 'play-pause',
            		    text: 'Play/Pause',
            		    title: 'Play',
            		    click: function() {
            		      $video.trigger('togglePlay');
            		      return false;
            		    }
            		  }).appendTo( $controls );
  		    		    	
    		  //Play and pause button
    		  $mute = $('<a/>', {
    		            href: '#',
            		    'class': 'volume',
            		    text: 'Volume',
            		    title: 'Mute',
            		    click: function() {
            		      $video.trigger('toggleMute');
            		      return false;
            		    }
            		  }).appendTo( $controls );
            		  
          //View on YouTube
    		  $link
    		    .addClass('view-youtube')
    		    .attr('title', 'View on YouTube')
    		    .html('Play/View on YouTube')
    		    .appendTo( $controls );
    		    
  		    //Play and pause button
          $seek = $('<div/>', {
            		    'class': 'status',
            		    click: function(e) {
                      var skipTo      = e.pageX - $seek.offset().left,
                          statusWidth = $seek.width();
                      $video.seek( skipTo / statusWidth );
            		    }
            		  }).appendTo( $controls );

          $bar       = $('<div class="bar"></div>').appendTo($seek);
          $loaded    = $('<div class="loaded"></div>').appendTo($bar);
          $indicator = $('<span class="indicator"></span>').appendTo($bar);
          		  
        };
  			
        $video.init();

    });

  };
  
})(jQuery);