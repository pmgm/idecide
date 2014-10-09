// JavaScript Document

$(document).ready(function() {
 
   // INITIALIZATION
   // ---------------------------------------------------------------------------

   var isTouch = false;
   if(typeof intel != "undefined"){
		  
		  if(intel.xdk.isnative==true){ 
		  	var isTouch= true;
			alterCSS();
		  }
		  
   }
	var idecideObj = {};


    detectBrowserPrivate();
	

	// CHECK FOR APP OBJECT
	// ------------------------
	// YES, APP DATA OBJECT - RETRIEVE FROM LOCAL STORAGE
	if( checkForDataObject(appProps.appName) == true ){
			idecideObj = jQuery.parseJSON(window.localStorage.getItem(appProps.appName));
			window.idecideObj = idecideObj;
			if(window.idecideObj.id != ''){
				 updateMenuPage();
			 	console.log('data exists');
			}
			else{
				idecideObj = participant;
				idecideObj.date_started = getDateNow();
				window.idecideObj = idecideObj;
			}
	}
	// NO APP DATA OBJECT
	else {
			// RETRIEVE FROM SERVER - EITHER NEW PARTICIPANT OR NEW DEVICE INSTALLATION
			// --- cached data in data.js
			idecideObj = participant;
			idecideObj.date_started = getDateNow();
			window.idecideObj = idecideObj;
		
	
	}

	
	
	
	
	
	
	console.log(window.idecideObj);
	






  // GENERAL NAVIGATION
  // ---------------------------------------------------------------------------
   // NAVIGATION TOUCH
   if(isTouch==true){
		   $("a.button-question, a.button-section, a.nav-home-button").live('touchstart',function(e){
				
				 $(this).addClass('nav-over');
			  
			});
		
		   $("a.button-question, a.button-section, a.nav-home-button").live('touchend',function(e){
			  
				 
				   $(this).removeClass('nav-over');
			 
			});

   }
   	
  // PAGE BACK BUTTON
  $(".nav-back").live('click',function(){
		
		//addSpinner('nav-spinner'); 
		 
		navAction( $(this),'back' );
		navBack( $(this) );
	});
  
  
  
   // PAGE FORWARD BUTTON
   $(".nav-forward").live('click',function(e){

		//addSpinner('nav-spinner'); 
		if( navAction( $(this),'forward' ) == true){
			navForward( $(this) );	
		}
		
	});
	// PAGE FORWARD BUTTON
   $('.nav-inactive').live('click',function(e){
	   e.stopPropagation();
	   e.preventDefault();
	   inform('Please complete the Safety and Priorities modules before going on');
	
	});
	
	
	
	
	 // HOVER
    $(".nav-button, .action-item-start, .button-logout,.button-guide,.button-escape").live('mouseover',function(e){

		$(this).addClass('nav-button-over');
		
	});
	 $(".nav-button, .action-item-start, .button-logout,.button-guide,.button-escape").live('mouseout',function(e){

		$(this).removeClass('nav-button-over');
		
	});
   
    $(".index-reset-tab").live('mouseover',function(e){
		
		$('#index-reset-button').slideDown();
		
	});
	$("#index-reset-button").live('mouseout',function(e){
		
		$('#index-reset-button').slideUp();
		
	});
   
    
  
    // EXIT
   $(".button-logout").live('click',function(){
	 	  	var thisPage = $(this).parents('div:jqmData(role="page")').attr('id');
			var formData = $("#form-" + thisPage + "").serializeArray();
			saveData(formData);
			setTimeout(function () {
					window.location.href = 'index-2.html';
				}, 1000);
				
			
	
	}); 
   

	
   // LOGIN
   //------------------------------------------------------------------------------------
   $('#login-button').click(function(){
	   addSpinner('load-pages');
	   navPreStart(this,appProps.appName);
		//$.mobile.changePage( $('#new') );	
	});
	
	
	// HELP ME DECIDE MENU
	// ----------------------------------------------------------------------------------
	// RELATIONSHIP
	$('#menu-module-relationship').live('click',function(){	
		$.mobile.changePage( $('#HEALTHY_LABEL_page') );
	});
	
	// PRIORITIES
	$('#menu-module-priorities').live('click',function(){	
		if(window.idecideObj.children == 1){
			$.mobile.changePage( $('#priorities_page') );
		}
		else{
			$.mobile.changePage( $('#priorities_nc_page') );
		}
	});
	// SAFETY
	$('#menu-module-safety').live('click',function(){
		// IF NOT HIDDEN FROM ANSWERING THE QUESTIONS IN THE RELATIONSHIP SECTION
		if( $('#SAFETY_LABEL_page').hasClass('active-page')){
			$.mobile.changePage( $('#SAFETY_LABEL_page') );
		}
		else{
			$.mobile.changePage( $('#CASLABEL_page') );
		}	
		
	});
	
	$('.menu-module').live('mouseover',function(){
		if( $(this).hasClass('menu-module-done')) {
			
		}
		else{
			$(this).children('.menu-module-inner').hide();
			$(this).children('.menu-module-description').show();
		}
	});
	$('.menu-module').live('mouseout',function(){	
			$(this).children('.menu-module-inner').show();
			$(this).children('.menu-module-description').hide()
	});
	
	 //------------------------------------------------------------------------------------
  
	// AUDIENCE OPTION
	/*$('.menu-button-item').live('click',function(){	
		addSpinner('nav-spinner'); 
		// CHECK FOR PREVIOUS PROGRESS
		navPreStart(this,appProps.appName);
	});
	// MENU NAVIGATION BUTTONS
	// Since the menu is repeated on each jqm page, when a user clicks on the menu, it needs to be updated in the target page
	$("a.nav-bar-button-small").live('click',function(){
		var currentMod = $(this).attr('id');
		var navObj = {};
		navObj.currentMod = currentMod.replace('mod-','');
		
		// allow progression via nav bar if already on that module
		if(window.idecideObj.NAVIGATION.moduleProgress == navObj.currentMod){
			navObj.goToPage = $('body').find('div.active-page[name="' + navObj.currentMod + '"]:first').attr('id');
			$.mobile.changePage( $('#' + navObj.goToPage + '') );
			setNavBarPosition(navObj);
		}
		// don't allow progression
		else{
			inform('Please complete the previous sections first');
		}
		//$('' + pageId + '').find('#' + currentMod + '').addClass('ui-btn-active');
		
	
	});
	
	$("div.mod-done,div.mod-active").live('click',function(){
		var currentMod = $(this).prevAll('a:first').attr('id');
		var navObj = {};
		navObj.currentMod = currentMod.replace('mod-','');
		navObj.goToPage = $('body').find('div.active-page[name="' + navObj.currentMod + '"]:first').attr('id');
		$.mobile.changePage( $('#' + navObj.goToPage + '') );
		setNavBarPosition(navObj);
		//$('' + pageId + '').find('#' + currentMod + '').addClass('ui-btn-active');
		
	
	});*/
   
	
	$('.button-popup-close').live('click',function(e){
		$(this).parent().parent().popup('close');
		
	});

	
	// HEADER AREA
	//----------------------------------------------------------------------------------
	
	// HOVER ON EXIT
	$('.menu-top').live('mouseover',function(){	
		$(this).addClass('menu-top-over');
	});
	$('.menu-top').live('mouseout',function(){	
		$(this).removeClass('menu-top-over');
	});
	// RESET OPTION - for testing only - replace with emergency exit below
	$('#new-button-reset, #index-reset-button, .menu-top-exit,.menu-top').click(function(){
		window.localStorage.removeItem(appProps.appName);
		inform('Data reset');
		setTimeout(function () {
					window.location.href = 'index-2.html';
				}, 1000);
		
	});
	
	
	// FOOTER AREA
	//----------------------------------------------------------------------------------
	$('.menu-footer').click(function(){	
		$('html, body').animate({
					scrollTop: $('#menu-bottom').offset().top
				}, 2000);
	});
	
	
	// RESET DATA
	/*$('a.button-reset-confirm').click(function(){
		addSpinner('nav-spinner');
		console.log('reset');
		idecideObj = participant;
	
		window.idecideObj.date_started = getDateNow();
		window.idecideObj = idecideObj;
	
		
		updateStorage();
		navStart(this);
	 });
	 
	$('a.close-reset-button').click(function(){
		$('#reset-survey-now').remove();
	 });
	
	
	$('a.button-return').click(function(){
		navStart(this);
	 });*/
	// EMERGENCY EXIT
	/*$(".menu-top").live('click',function(){
	 	  	var thisPage = $(this).parents('div:jqmData(role="page")').attr('id');
			var formData = $("#form-" + thisPage + "").serializeArray();
			
			
			saveData(formData);
			window.location.href = 'http://www.weather.com';
			window.open('http://www.google.com','_blank');
			
	
	}); */

	$(".nav-button-leave-menu").click(function(){
	 	  	window.location.href = 'index-2.html';
	});
 	
	
	
	
	
	
	
	
	
	
	// TO CHANGE THE CHECKBOX VALUE WHEN CHECKED
   $("input[type='checkbox']").live('change',function(e){
		var target = e.currentTarget;
		var targetId = e.currentTarget.id;
			
		if( $(target).attr('type') == 'checkbox'){
			if($(target).val() == 0){
				$(target).val(1);
			}
			else{
				$(target).val(0);
			}
		}
   });
   
 
	 $("select").live('change',function(e){
		$(this).parent().addClass('select-done');
   });
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
// PAGE SPECIFIC EVENTS 
//------------------------------------------------------------- 
	   

   //-----------------------------------------
	// ACTION PLAN
	// show more strategies
	$('#button-more-strategies').live('click',function(e){
			$('#plan-list-container,#button-less-strategies').show();
			$('#plan-list-container').parent('.section-content').css('width','100%');
			$('#plan-top-five').prev('p').hide();
			$('#plan-top-five').hide();
	});
	$('#button-less-strategies').live('click',function(e){
			$('#plan-list-container,#button-less-strategies').hide();
			$('#plan-top-five, #button-more-strategies').show();
			$('#plan-top-five').parent('.section-content').css('width','600px');
			$('#plan-top-five').prev('p').show();
	});
	
	$('a.button-plan-filter').live('click',function(e){
		e.preventDefault();
		var filterTarget = $(this).attr('data-filter-name') + '-section';
				$('html, body').animate({
					scrollTop: $('#' + filterTarget + '').offset().top
				}, 2000);
			
			

		
		// GET FILTER
		
		var filter_query = 'plan-'+filterTarget;
		console.log(filter_query);

		

 
	});
   
   
   
   // ACTION PLAN LIST ITEM SELECT
	$('a.button-plan-item').live('click',function(e){
		e.preventDefault();
		e.stopPropagation();
		var apItem = $(this).attr('id');
		var apItemPopup = $(this).attr('href');
		$(this).find('.ui-li-heading').css('font-weight','normal');
		$(this).parents('li').css('background','#EEEEEE');
		$(this).addClass('no-bold-heading');
		$(this).toggleClass('list-item-active');
		console.log( $('' + apItemPopup + '-popup') );
		var ypos = $(document).scrollTop();
		$( apItemPopup ).popup( "open", {"y":ypos} );
		

		
	});

	
	
	$('.button-strategy-close').live('click',function(e){
		$(this).parents('div.strategy-block').popup('close');
		
	});
	

	
	// PRIORITIES 
	//SLIDER ITEMS ---------------------------------------------------------
	
		$("input.ui-slider-input").live("change",function(event, ui) { 
				var slider_value = $(this).slider().val(); 
				var sliderId = $(this).attr('id');
				
				
				$('#' + sliderId + '_val').val(slider_value);
				$(this).parents('div.slider-container').find("div.slider-label-left-message").show();
				$(this).parents('div.slider-container').find("div.slider-label-right-message").show();
				$(this).parents('div.slider-container').find("div.slider-label-left-message").html( "<span class='percent-weight'>" + Math.abs(slider_value- 100)  + "%</span>" );
				$(this).parents('div.slider-container').find("div.slider-label-right-message").html( "<span class='percent-weight'>" +  slider_value + "%</span>" );
				
				
		
				
		});
		
		
		$('a.priority-definition').live('click',function(){
			inform( $(this).attr('title') );
		});
			



		
   
});









// SPECIFIC PAGE CREATE/PAGE SHOW EVENTS
//-----------------------------------------------------

// ATTACH FASTCLICK LAYER	
$(document).on("load",function(){
	FastClick.attach(document.body);
});
	



// PAGE CREATE
// --------------------------------
$(document).on("pagecreate","#SAFETY_LABEL_page, #HEALTHY_LABEL_page",function(){
	var messagePopup = '<div id="message1" Class="strategy-block" data-role="popup" data-corners="false" data-transition="pop" data-position-to="window" data-history="false"><div class="nav-button float-r"><a href="#" class="button-popup-close btn-blue">Close</a></div><div class="stragety-display-container"><h4>Please Check</h4><div class="strategy-display body-text">It seems like you don\'t have concerns about the health and safety of your relationship. Please double-check that you have answered the question correctly before proceeding.</div></div></div> ';
	$(this).append(messagePopup);
	
});

$(document).on("pagecreate","#PROB_OPTIONS_page",function(){
	$(this).find('div.section-narrative-top').empty().append('<p>' + window.idecideObj.prob_choose + '</p>');
	$(this).find('div.question-set').addClass('q-inline');
	$('#PROB_OPTIONS_container').parent().removeClass('q-inline');
	
	
});
$(document).on("pagecreate","#PROB_BEST_page",function(){
	$(this).find('div.section-narrative-top').empty().append('<p>Identify the best option to deal with the problem</p>');
	$(this).find('div.question-set').addClass('q-inline');
	$('#PROB_BEST_outer').remove();
	$('#form-PROB_BEST_page').append('<input type="radio" id="PROB_BEST_OPTION_1" name="PROB_BEST_OPTION" value="1"><label class="question-label" for="PROB_BEST_OPTION_1">' + window.idecideObj.prob_option_1 + '</label>');
	$('#form-PROB_BEST_page').append('<input type="radio" id="PROB_BEST_OPTION_2" name="PROB_BEST_OPTION" value="2"><label class="question-label" for="PROB_BEST_OPTION_2">' + window.idecideObj.prob_option_2 + '</label>');
	
	
});
$(document).on("pageshow","#PROB_STEPS_page",function(){
	$(this).find('div.section-narrative-top').empty().append('<p>' +window.idecideObj.prob_best_option +'</p>');
	
	$('#PROB_STEPS_outer').removeClass('q-inline');
	
});

$(document).on("pagecreate","#plan_page, #priorities_results_page, #danger_results_page",function(){
	$(this).find('div.menu-middle-center').css('max-width','940px');
});
 
// PAGE SHOW
// --------------------------------
// HIDE SPINNER	
$(document).on("pageshow",function(){
 removeSpinner('nav-spinner');
});


// CHECK FOR DECIDE MENU COMPLETION
$(document).on("pageshow",'#new',function(){
	
	//check for HELP ME DECIDE PROGRESS
	isDecideDone();
			
}); 
 // CHECK FOR SAFETY AND AFRAID QUESTION COMPLETION
$(document).on("pageshow",'#SAFETY_LABEL_page',function(){
	
	//HIDE INITIAL PAGES IF ALREADY ANSWERED IN THE RELATIONSHIP DECIDE MODULE
	if(window.idecideObj.QUESTIONS.HOW_SAFE_RELATIONSHIP > 0){
		$('#HOW_SAFE_SAFETY_container').hide();
	}
	if(window.idecideObj.QUESTIONS.HOW_AFRAID_RELATIONSHIP > 0){
		$('#HOW_AFRAID_SAFETY_container').hide();
	}
	
			
});
  // CHECK FOR DECIDE MENU COMPLETION
$(document).on("pageshow",'#HEALTHY_LABEL_page',function(){
	
	//HIDE INITIAL PAGES IF ALREADY ANSWERED IN THE RELATIONSHIP DECIDE MODULE
	if(window.idecideObj.QUESTIONS.HOW_SAFE_SAFETY > 0){
		$('#HOW_SAFE_RELATIONSHIP_container').hide();
	}
	if(window.idecideObj.QUESTIONS.HOW_AFRAID_SAFETY > 0){
		$('#HOW_AFRAID_RELATIONSHIP_container').hide();
	}
			
});
  // ADD SLIDER VALUES
 $(document).on("pageshow",'#SAFETY_LABEL_page, #HEALTHY_LABEL_page, #PARTNER_FEAR_page, #MOT_LIKE_page,#MOT_HEALTHY_page, #HOW_SUPPORTED_page,#CURRENT_RELSHIP_page',function(){
	 $('#form-HEALTHY_LABEL_page, #form-SAFETY_LABEL_page, #form-PARTNER_FEAR_page, #form-MOT_LIKE_page ,#form-MOT_HEALTHY_page, #form-HOW_SUPPORTED_page, #form-CURRENT_RELSHIP_page').find('div.ui-slider-labels').remove();
	 
	 $('#form-HEALTHY_LABEL_page, #form-SAFETY_LABEL_page, #form-PARTNER_FEAR_page,#form-MOT_LIKE_page,#form-MOT_HEALTHY_page, #form-HOW_SUPPORTED_page,#form-CURRENT_RELSHIP_page').find('div.ui-slider').prepend('<div class="ui-slider-labels"><div class="ui-slider-label-left">0</div><div class="ui-slider-label-right">10</div><div class="break"></div></div>');	
 
 	
 });
 
$(document).on("pageshow",'#da_cal_page',function(){
	// SHOW THE GUIDE AUTOMATICALLY FOR NEW USERS
		//if(window.idecideObj.ACTION_PLAN === undefined){
		
		//}
		$(this).find('div.menu-middle-center').css('max-width','none');
		 if( $('#calendar').length >0 ){
			}
			else{
			$("<div id='da_cal_container'><div id='calendar'></div><div id='external-events'><div class='level1'>1</div><div class='level-description level1-desc'><div class='level-description-header'>Slapping, pushing</div> No injuries or lasting pain.</div><div class='break'></div><div class='level2'>2</div><div class='level-description level2-desc'><div class='level-description-header'>Punching, kicking</div>Bruises, cuts, and/or continuing pain.</div><div class='break'></div><div class='level3'>3</div><div class='level-description level3-desc'><div class='level-description-header'>\'Beating up\'</div>Severe scrapes, burns, broken bones.</div><div class='break'></div><div class='level4'>4</div><div class='level-description level4-desc'><div class='level-description-header'>Threat to use weapon</div>Head injury, internal injury, permanent injury, miscarriage, choking.</div><div class='break'></div><div class='level5'>5</div><div class='level-description level5-desc'><div class='level-description-header'>Use of weapon</div>Wounds from weapon.</div><div class='break'></div></div><div style='clear:both'></div></div>").appendTo('#da_cal_page div.menu-middle div.section-container div.section-content');
			 renderDACalendar();
				if(renderDACalendar()){
					$('#calendar').fullCalendar('render');
					$('#calendar').fullCalendar( 'changeView', 'month' )
				}
			}
	
	
 }); 

 // CHECK FOR SAFETY AND AFRAID QUESTION COMPLETION
$(document).on("pageshow",'#plan_page',function(){
	
	$(this).find('div.res-link').hide();
	$(this).find('div.res-' + window.idecideObj.location_display + '').show();
	
			
});