// JavaScript Document

$(document).ready(function(){

	// Local copy of jQuery selectors, for performance.
	var	my_jPlayer = $("#jquery_jplayer"),
		my_trackName = $("div.audioLink .track-name"),
		my_playState = $("div.audioLink .play-state"),
		my_extraPlayInfo = $("div.audioLink .extra-play-info");

	// Some options
	var	opt_play_first = false, // If true, will attempt to auto-play the default track on page loads. No effect on mobile devices, like iOS.
		opt_auto_play = true, // If true, when a track is selected, it will auto-play.
		opt_text_playing = "Now playing", // Text when playing
		opt_text_selected = "Track selected"; // Text when not playing

	// A flag to capture the first track
	//var first_track = true;

	// Change the time format
	$.jPlayer.timeFormat.padMin = false;
	$.jPlayer.timeFormat.padSec = false;
	$.jPlayer.timeFormat.sepMin = " min ";
	$.jPlayer.timeFormat.sepSec = " sec";

	// Initialize the play state text
	my_playState.text(opt_text_selected);

	// Instance jPlayer
	my_jPlayer.jPlayer({
		ready: function () {
			$("div.audioLink .track-default").click();
		},
		timeupdate: function(event) {
			my_extraPlayInfo.text(parseInt(event.jPlayer.status.currentPercentAbsolute, 10) + "%");
		},
		play: function(event) {
			my_playState.text(opt_text_playing);
		},
		pause: function(event) {
			$('#spinner-container').remove();
			$('body').find('div.audioLink a').show();
		},
		ended: function(event) {
			$('#spinner-container').remove();
			$('body').find('div.audioLink a').show();
			
		},
		
		swfPath: "javascript/plugins/jPlayer",
		cssSelectorAncestor: "div.audioLink",
		supplied: "mp3",
		wmode: "window"
	});

	// Create click handlers for the different tracks
	$("div.audioLink .track").live('click',function(e) {
		$(this).parent().append('<div id="spinner-container" class="spinner-inner"></div>');
		$('#spinner-container').live().spin( {lines:17,length: 15, width:1,radius:20,trail:80,speed:1.0,color:'#FFF'} );
		$(this).hide();
		//my_trackName.text($(this).text());
		my_jPlayer.jPlayer("setMedia", {
			mp3: $(this).attr("href")
		});
		//if((opt_play_first && first_track) || (opt_auto_play && !first_track)) {
			my_jPlayer.jPlayer("play");
			
		//}
		//first_track = false;
		$(this).blur();
		
		return false;
	});


	
});
