// JavaScript Document
// RENDERING BEHAVIORS


// ----------------------------------------------------------------------------------------------
// GENERATE THE MENU OF MODULES
function renderMenuNavBar(responseObj,apiObj){
	
	var menu = '';
	var menuList = '';
	var output = '';
	var menuObj = new Object();
	var navigationObj = new Object;
	var navOrderModule = new Array();
	var navOrderSection = new Array();
	var navCompletedModules = new Object();
	var navCompletedSections = new Object();
	var navCompletedTriggers = new Object();
	
	// if new user, create navigation object
	if(window.idecideObj.userStatus == 'new'){
		var i = 0;
		for (var module in responseObj) {
			var modProp = responseObj[module];
			navOrderModule[i] = module;
			navCompletedModules[module] = 0;
			
	  		i++;
			
			// create nav object for section
			for (secCounter=0;secCounter<modProp.sections.length;secCounter++) {
					navOrderSection[secCounter] = modProp.sections[secCounter].sectionShortName;
					navCompletedSections[modProp.sections[secCounter].sectionShortName] = 0;
			}
		}
		
		// record trigger pages
		navCompletedTriggers.safety_message = 0;
		navCompletedTriggers.questions = 0;
		navCompletedTriggers.decide_relationship= 0;
		navCompletedTriggers.decide_safety = 0;
		navCompletedTriggers.decide_priorities = 0;
		navCompletedTriggers.motivational= 0;
		navCompletedTriggers.my_situation= 0;
		navCompletedTriggers.action_plan= 0;
		
		navCompletedTriggers.danger= 0;
		navCompletedTriggers.decide= 0;
		
		navigationObj.orderModules = navOrderModule;
		navigationObj.orderSections = navOrderSection;
		navigationObj.completedModules = navCompletedModules;
		navigationObj.completedSections = navCompletedSections;
		navigationObj.completedTriggers = navCompletedTriggers;
		navigationObj.pageProgress= '';
		navigationObj.moduleProgress= '';
		
		window.idecideObj.NAVIGATION = navigationObj;
		
	}
	console.log(window.idecideObj.NAVIGATION);
	
	
	
	
	// get number of modules
	var i = 0;
	for (var module in responseObj) {
		i++;
	}
	
	
	// loop through each module 
	var k = 1;
	for (var module in responseObj) {
		 var moduleObj = responseObj[module];
		 var modWidth = Math.round(100/i);
		 var modName = moduleObj.modDescription;
		 menu = '';
		 menuList = '';
		 if(i > k){
			 var lastCell = '';
		 }
		 else {
			 var lastCell = 'td-last';
		 }
		 
		 // CHECK TO SEE WHAT'S BEEN DONE
		 if(window.idecideObj.NAVIGATION.completedModules[module] == 1){
			 	var doneClass = '<div class="mod-done"></div>';
		 }
		 else{
			 	var doneClass = '';
		 }
		// menuList = menuList + ' <td width="' + modWidth + '%" class="oll-button ' + lastCell + '"><a href="#" id="mod-' + module + '"  class="nav-bar-button-small mod-' + module + '" data-role="button" data-theme="c" data-corners="false"></a>' + doneClass + '</td>';
		 //' + modName.substring(0,6) + '
		 k++;
		 
		 
		 
		 // CREATE PROGRESS BAR FOR EACH MODULE
		var z = 1;
		var numModSections = moduleObj.sections.length;
		
		
		
		
		
		var modWidth = Math.round(100/numModSections);
		
		// loop through each section in a module
		for (secCounter=0;secCounter<numModSections;secCounter++) {
			 
			 
			 // check for completed
			 if(window.idecideObj.NAVIGATION.completedSections[moduleObj.sections[secCounter].sectionShortName] == 1){
					var doneClass = '<div class="mod-done"></div>';
			 }
			 else{
					var doneClass = '';
			 }
			 
			 
			 // check for active
			 if(window.idecideObj.NAVIGATION.sectionProgress == moduleObj.sections[secCounter].sectionShortName){
					var activeClass = '<div class="mod-active"></div>';
			 }
			 else{
					var activeClass = '';
			 }
			 
 
			// handle last cell
			if(z < moduleObj.sections.length){
				 var lastCell = '';
				 
				 // add start label to beginning
				 if(z == 1) {
						var cellWord = 'start';
				 }
				 else{
						var cellWord = '';
				 }
			 }
			 else {
				 var lastCell = 'td-last';
				 var cellWord = 'finish';
			 }
			 
			 // skip danger_f and priorities_nc sections
			 if(  moduleObj.sections[secCounter].sectionShortName == 'web_f' ||
				  moduleObj.sections[secCounter].sectionShortName == 'danger_f' ||
				  moduleObj.sections[secCounter].sectionShortName == 'priorities_nc'){
			}
			else{
			 menuList = menuList + ' <td width="' + modWidth + '%" class="' + lastCell + '"><div class="schedule-cell section-progress mod-section-' + moduleObj.sections[secCounter].sectionShortName + '">' + cellWord + '</div>' + doneClass + activeClass + '</td>';
			}
			z++;
		} 
		
		
		menu = menu + '<table class="menu-nav-bar-' + module + ' assessment-progress" width="100%" cellpadding="0" cellspacing="0" border="0">';
		menu = menu + '<tr>' + menuList + '</tr>';      
		menu = menu + '</table>';
		menuObj[module] = menu;
		 
		
	} // END LOOP OVER MODULES



	
	// add to DOM
	return menuObj;
	
	
}
// ----------------------------------------------------------------------------------------------
// GENERATE A STATIC TYPE MENU
function renderContent(responseObj,apiObj){
	
	var menu = renderMenuNavBar(responseObj,apiObj);

	// add a page for each section
	var app = renderSections(responseObj,apiObj,menu);
	
	// remove an already loaded survey if there
	$('div:jqmData(role="page").active-page').remove();
	
	// insert the survey into the DOM
	$(app).insertAfter( $('#new') );
	window.idecideObj.appLoaded = 1;
	
	window.responseObj = responseObj;

	
}
// ----------------------------------------------------------------------------------------------
// GENERATE EACH SECTION
function renderSections(responseObj,apiObj,menuNav){
	
	var output = '';
	var outputType = 'section';
	var modSecCounter = 0;


	// count the total number of pages we'll be making
	var totalItems = 1;
	for (var module in responseObj) {
	   var obj = responseObj[module];
	   	  
		  
		  for (secCounter=0;secCounter<obj.sections.length;secCounter++) {
		 		
				totalItems++;
				
				// count all questions
				if(responseObj.pageType != 'multiple'){
					 for (quesCounter=0;quesCounter<obj.sections[secCounter].questions.length;quesCounter++) {
						 if(obj.sections[secCounter].questions[quesCounter].isChild == 1 || 
							   obj.sections[secCounter].questions[quesCounter].fieldType == 'checkbox' ||
							   obj.sections[secCounter].questions[quesCounter].subType == 'grouped'){
						 }
						 else{
							totalItems++;
						 }
					 }
				}
		  }
	}
	
	
	// loop through the modules to get their sections
	for (var module in responseObj) {
	   var obj = responseObj[module];
	   	  

		  // loop through the sections of the module and create a page for it
		  for (secCounter=0;secCounter<obj.sections.length;secCounter++) {
			  
			    console.log(obj);
			  	console.log(obj.sections[secCounter].sectionShortName );
			  
			  	menu = '';
			   
				menu = menu + '<div class="questionheader ' + window.idecideObj.surveyTypeKeyword + '"><div class="close-container nav-button"><a href="#" class="button-logout">Exit</a></div><div class="break"></div>';
				
				// progress
				//menu = menu + '<div class="progress-indicator rounded-corners-5""><div class="rounded-corners-5" style="width:0%; height: 100%;background-image: url(images/progress-indicator-2.jpg);background-repeat:none; background-size: 100% 100%;"></div></div>';  
				
				
				// menu nav
				//menu = menu + menuNav;
				
				menu = menu + '</div>';
						  
			  
				output = output + '<div data-role="page" id="' + obj.sections[secCounter].sectionShortName + '_page"  data-section="' + obj.sections[secCounter].sectionShortName + '" name="' + module+ '" data-url="' + obj.sections[secCounter].sectionShortName + '_page" class="page-section active-page ' + obj.sections[secCounter].sectionShortName + '">';
				output = output + '<div data-role="header" data-position="fixed" data-tap-toggle="false" class="menu-top"><div class="menu-top-exit">QUICK ESCAPE</div></div>';
				
				output = output + '<div data-role="content" class="section-background menu-middle">';
				output = output + '<div class="menu-middle-left"></div><div class="menu-middle-right"><a href="" class="btn-blue">Resources</a><a href="" class="btn-blue">Safety</a><a href="" class="btn-blue">Contact Us</a> <a href="#login" class="btn-blue btn-outline-purple">Logout</a></div>';
				//output = output + '<div class="module-header"><div class="button-logout">Log Out</div><div class="module-header-title image-left-' + module + '">' + obj.modDescription + '</div></div>' + menuNav[module];
				//output = output + '<div class="section-header">' + obj.sections[secCounter].longName + '</div>';
				
				output = output + '<div class="menu-middle-center break section-container color-' +module + '"><h2 class="section-heading">' + obj.sections[secCounter].longName +'</h1><div class="section-image"></div><div class="section-content body-heading">' + obj.sections[secCounter].narrative + '</div>';
				output = output + '<div class="break"></div>';
				output = output + '</div></div>';
				output = output + renderEscape();
				output = output + renderFooter(outputType, obj.sections[secCounter].sectionShortName,obj.sections[secCounter].audioText) + '</div>';
				
				//create pages for any questions
				// if no questions in the section, then don't bother creating any pages
				if( typeof obj.sections[secCounter].questions[0].questionShortName  === "undefined") {
					//modSecCounter = modSecCounter + 1;
				}
				// create pages for each question in the section
				else{
					//modSecCounter = modSecCounter + 1;
					if(obj.pageType != 'multiple'){
						questionReturn = renderQuestions(obj.sections[secCounter].questions, obj.sections[secCounter], secCounter, totalItems,menuNav[module]);
					}
					else{
						
						questionReturn = renderQuestions(obj.sections[secCounter].questions, obj.sections[secCounter], secCounter, obj.sections.length,menuNav[module]);
					}
				
					output = output + questionReturn.questions;
					modSecCounter = questionReturn.counter;
					
				}
				
				 
		  } // end for section
		
	} // end for module
	
	
	return output;
	
	
	
}

// ----------------------------------------------------------------------------------------------
// GENERATE EACH SECTION
function renderQuestions(questionObj,module,counter,totalItems,menuNav){
	
  
   var questionsOutput = '';
   var outputType = 'question';
   var menu = '';
   var pageCounter = 1;
   var sectionNameCounter = '';
   var sequenceNumber = 1;
   var quesCounterDisplay = 0;
	//alert(questionObj.length);
  // loop through the questions and create a page for each one
  
  

  for (quesCounter=0;quesCounter<questionObj.length;quesCounter++) {
	  
	
	    // add to question object if this is a new user
		if(window.idecideObj.userStatus == 'new'){
			if(questionObj[quesCounter].fieldType != 'label'){
				 console.log(questionObj[quesCounter].questionShortName);
				 window.idecideObj.QUESTIONS[questionObj[quesCounter].questionShortName] = "";
			}
		}



		// look to close a page for a multiple page system within the same section
		if(module.pageType == 'multiple'){
			
				// close if a new section
				// close if a new page within same section
				if( (module.sectionType != sectionNameCounter && sectionNameCounter != "") || 
				    (module.sectionType == sectionNameCounter && questionObj[quesCounter].pageNum != pageCounter ) ){
						questionsOutput = questionsOutput + '</form>';
						questionsOutput = questionsOutput + '</div></div>' +renderEscape() + renderFooter(outputType, questionObj[quesCounter].questionShortName) + '</div>';
						
				}
		}
		




	   // page start
	   // -----------------------------------------
	    // don't start a new page for checkbox or hidden questions since series
		if(questionObj[quesCounter].isChild == 1 || 
		   questionObj[quesCounter].fieldType == 'checkbox' ||
		   questionObj[quesCounter].subType == 'grouped'
		   ){
		}
		else{
			
			var pageOpen = 'yes';
			//look to open a new page for multiple systems
			if(module.pageType == 'multiple'){
			
				// close if a new section
				// close if a new page within same section
				if( (sectionNameCounter == "") || 
					(module.sectionType != sectionNameCounter) ||
				    (module.sectionType == sectionNameCounter && questionObj[quesCounter].pageNum != pageCounter ) ){
						pageOpen = 'yes';
						
				}
				else{
						pageOpen = 'no';
				}
			}
			
			if(pageOpen == 'yes'){
			
			
					questionsOutput = questionsOutput + '<div data-role="page" id="' + questionObj[quesCounter].questionShortName + '_page" data-section="' + questionObj[quesCounter].sectionShortName + '" name="' + module.modName + '" data-url="' + questionObj[quesCounter].questionShortName + '_page" name="' + module.sectionType + '" class="active-page ' + questionObj[quesCounter].sectionShortName + '">';
					
					questionsOutput = questionsOutput + '<div data-role="header" data-position="fixed" data-tap-toggle="false" class="menu-top"><div class="menu-top-exit">QUICK ESCAPE</div></div>';
					
					questionsOutput = questionsOutput + '<div data-role="content"  class="section-background menu-middle">';
					//questionsOutput = questionsOutput + '<div class="module-header"><div class="button-logout">Log Out</div><div class="module-header-title image-left-' + module.modName + '">' + module.modDescription + '</div></div>' + menuNav;
					questionsOutput = questionsOutput + '<div class="menu-middle-left"></div><div class="menu-middle-right"><a href="" class="btn-blue">Resources</a><a href="" class="btn-blue">Safety</a><a href="" class="btn-blue">Contact Us</a> <a href="#login" class="btn-blue btn-outline-purple">Logout</a></div>';;
					
					
					//questionsOutput = questionsOutput + '<div class="section-header color-assessment">' + module.longName + '</div>';
					
					counter = counter + 1;
					
					//questionsOutput = questionsOutput + '<div class="ui-bar header_bg oll-theme-1 oll-header-large" data-role="header" data-theme="none">' + menu + '</div>';
					
					
					
					// question
					// -----------------------------------------
					// start the form for the question
					questionsOutput = questionsOutput + '<div class="menu-middle-center break section-header color-assessment"><h2>' + module.longName + '</h2><div class="section-narrative-top body-heading">' + module.narrative + '</div></div><div class="menu-middle-center questions-container color-' +module.modName + '"><form id="form-' + questionObj[quesCounter].questionShortName + '_page" method="post" action="" >';
			}
		}
		
		
		
		
		
		// get the audio for the question
		// GOOGLE API  - this doesn't seem to work as an on-demand API call since it's checking the referrer and denying.  Only works as direct URL call.
		//questionsOutput = questionsOutput + '<a href="http://translate.google.com/translate_tts?tl=en&q=' + encodeURIComponent(questionObj[quesCounter].label) + '" target="_blank" data-role="button">Audio</a>';
		//questionsOutput = questionsOutput + '<audio src="audio/AGE.mp3" controls="controls"></audio>';
		// USE A BUTTON TO PULL IN THE AUDIO ON DEMAND
		//questionsOutput = questionsOutput + '<a href="" class="audio-page"  name="' + questionObj[quesCounter].questionShortName + '" data-role="button" data-inline="true" data-mini="true">Audio</a>';
		
		
		// for multiple systems we want to push the question number each time
		if(module.pageType == 'multiple'){
				
					
					counter = quesCounterDisplay + 1;
					quesCounterDisplay++;
				
				
				
			
		}
		if( (questionObj[quesCounter].fieldType == 'checkbox')){
			quesCounterDisplay--;
		}
		
		// get the question
		if(questionObj[quesCounter].sectionShortName != 'priorities' && questionObj[quesCounter].sectionShortName != 'priorities_nc' ){
			questionsOutput = questionsOutput + getSurveyQuestions(questionObj[quesCounter],counter,window.idecideObj.QUESTIONS);
		}
		
		// page end
	    // -----------------------------------------
		// don't close the page for parent questions that start a checkbox series or hidden question series
		if( (questionObj[quesCounter].isParent == 1 && questionObj[quesCounter].checkboxStart == 1)){
			
		}
		
		// don't close the page for a checkbox series if it's not the end of it
		else if(  (questionObj[quesCounter].fieldType == 'checkbox' && questionObj[quesCounter].checkboxEnd == 0)  ||
				  (questionObj[quesCounter].subType == 'grouped' && questionObj[quesCounter].checkboxEnd == 0)  ){
			
		}
		// close the page for all others
		else{
			
			if(module.pageType != 'multiple'){
				questionsOutput = questionsOutput + '</form>';
				questionsOutput = questionsOutput + '</div></div>' +renderEscape() + renderFooter(outputType, questionObj[quesCounter].questionShortName) + '</div>';
			}
			
		}
		
		
	     pageCounter = questionObj[quesCounter].pageNum;
		 sectionNameCounter = module.sectionType;
				
  } // question loop
  
	// look to close a page for a multiple page system at the end of  section
	if(module.pageType == 'multiple' && questionObj[0].sectionShortName != 'priorities' && questionObj[0].sectionShortName != 'priorities_nc'){
		questionsOutput = questionsOutput + '</form></div></div>' +renderEscape() +  renderFooter(outputType, questionObj[0].questionShortName) + '</div>';
		questionsOutput = questionsOutput + '</div>';			
	}
	
	
	
	// PRIORITIES
	// if this is the 'priorities' section, then we need to render differently
	if(questionObj[0].sectionShortName == 'priorities' || questionObj[0].sectionShortName == 'priorities_nc' ){
		
		// standard priorites with children section
		if(questionObj[0].sectionShortName == 'priorities'){
			questionsOutput = questionsOutput + getPrioritiesQuestions(questionObj,priorities_order_child,counter,window.idecideObj.QUESTIONS);
			
		}
		
		// priorities without children
		if(questionObj[0].sectionShortName == 'priorities_nc'){
			questionsOutput = questionsOutput + getPrioritiesQuestions(questionObj,priorities_order_none,counter,window.idecideObj.QUESTIONS);
		}
		
		
		questionsOutput = questionsOutput + '</form>';
		
		questionsOutput = questionsOutput +  '</div></div>';
		questionsOutput = questionsOutput + renderEscape() +renderFooter(outputType, questionObj[0].questionShortName) + '</div>';
		//questionsOutput = questionsOutput + renderFooter(outputType, questionObj[0].questionShortName) + '</div>';	
	}
	
	
	tquestionReturn = {"questions": questionsOutput, "counter":counter};
	
	return tquestionReturn;
}


// ----------------------------------------------------------------------------------------------
// GENERATE FOOTER WITH NAVIGATION
function renderFooter(type, pageId, audioIn){

	var buttonType = 'button-' + type;
	
	if(type == 'section'){
		var audio = renderAudioButton(type,audioIn);	
	}
	else{
		var audio = '';
	}
	
	footer = '<div data-role="footer" data-position="fixed" data-tap-toggle="false" class="sticky-footer"><div class="button-container progress-bar"><div class="nav-button button-left"><a href="javascript:void(0);"  id="' + pageId + '_back" class="nav nav-back ' + buttonType + '">BACK</a></div><div class="nav-button button-right"><a href="javascript:void(0);" id="' + pageId + '_forward"  class="nav nav-forward ' + buttonType + '">NEXT</a></div><div class="break"></div></div><div class="progress-bar-thumb"></div></div>';	
	
	
	
	
	return footer;
}
function renderEscape(){
	 
	 return '';
}
function renderFixedNavButtons(type, pageId){
	var buttonType = 'button-' + type;
	var fixedNav = '<div class="nav-button nav-button-fixed-left nav-back ' + buttonType + '" id="' + pageId + '_back"></div><div class="nav-button nav-button-fixed-right nav-forward ' + buttonType + '" id="' + pageId + '_forward"></div>';
	
	return fixedNav;	
}
function renderAudioButton(type,audioIn){
	
	if(type == 'section'){
	
		var audio = '<div class="audio-container"><div class="section-audio audioLink"><a href="http://api.voicerss.org/?key=2d7d608c7a3342c7829a6c5e2355eb9b&hl=en-us&r=0&f=44khz_16bit_stereo&src=' + encodeURIComponent(audioIn) + '" class="track"></a></div></div>';
		
	}
	else{
		var audio = '<div class="question-audio audioLink"><a href="http://api.voicerss.org/?key=2d7d608c7a3342c7829a6c5e2355eb9b&hl=en-us&r=0&f=44khz_16bit_stereo&src=' + encodeURIComponent(audioIn) + '" class="track"></a></div>';
	}
	
	
	
	
	return audio;	
}
function renderError(pageIn){
	var errorMessage = $('#' + pageIn + '').find('div.section-container').empty();
	var errorDisplay = '<h3 class="result-format">There is no internet connection.  Please go online and resubmit your answers in order to get your results.</h3>';
	$( errorDisplay ).appendTo(errorMessage);
	
	
}
function renderDAGraph(graph,daresults){
	
	//graph
	var sectionDAGraph = $('#danger_results_page').find('div.section-container .section-content');
	$('#da-results-container').remove();
	var level = addScoreHighlight(daresults.score);
	$('<div id="da-results-container">' + graph + '<div id="da-score-message" class="body-text"><div class="da-level da-' + level + '"></div><div class="score-level da-text-' + level + '">' + daresults.range + '</div>' + daresults.message  + daresults.resources + '</div><div class="break"></div></div>').insertAfter(sectionDAGraph);
	$('#da-results-container li').each(function(index){
		if( $(this).attr('data-location') == window.idecideObj.location){
			$(this).show();
		}
		else{
			$(this).hide();
		}
	});
	
	
	
	// message and resources
	//var sectionDAMessage = $('#danger_results_more').find('div.section-container');
	//sectionDAMessage.find('#da-score-message').remove();
	//$('<div id="da-score-message">' + daresults.message  + daresults.resources + '</div>').appendTo(sectionDAMessage);

}


function renderPrioritiesGraph(graph,priresults){
	
	// graph
	var sectionPrioritiesGraph = $('#priorities-result-output');
	var sectionPrioritiesResults = $('#priorities-result-messages');
	$('#priorities-container').remove();
	$( graph ).insertAfter('#priorities-result-output');
	$( sectionPrioritiesResults ).insertAfter( $("#priorities-top") );
	
	
	// show message
	if(priresults.userSet == 1){
			var priOutput = priresults.criteria[0];
	}
	else{
			var priOutput = 'NONE';
	}
	 
	sectionPrioritiesResults.find('.priorities-result-feedback').hide();
	sectionPrioritiesResults.find('#priorities-result-' + priOutput + '').show();

}
function renderActionPlan(plan, type){
	
	// plan
	var $sectionPlan = $('#plan_page').find('div.section-container div.section-content');
	$('#plan-list-outer').remove();
	$(plan).appendTo( $sectionPlan ); //.trigger('create');

	
	//showDefaultFilters( $('#plan') );

}

// -----------------------------------------------------------------
// DANGER ASSESSMENT FUNCTIONS
//-------------------------------------------------------------------

// CREATE VIEW FOR GRAPH
function getDAGraph(daResults){
	
		var scoreChart = '<div id="da-score-chart"><div id="da-1" class="da-score-bar da-1"><div class="da-score-term"><h3>Extreme</h3></div></div><div class="break"></div><div id="da-2" class="da-score-bar da-2"><div class="da-score-term"><h3>Severe</h3></div></div><div class="break"></div><div id="da-3" class="da-score-bar  da-3"><div class="da-score-term"><h3>Increased</h3></div></div><div class="break"></div><div id="da-4" class="da-score-bar da-4"><div class="da-score-term"><h3>Variable</h3></div></div><div class="break"></div></div>';

	
	return scoreChart;
		
}

// GRAPH BAR CREATOR
function addScoreHighlight(score){
		
		var level = 0;

		if(score >= 18){
			level = 1;
		}
		else if(score >= 14 && score <18){
			level = 2;
		}
		else if(score >= 8 && score <14){
			level = 3;
		}
		else if(score <8 && score >0){
			level = 4;
		}
		
		
		
		return level;
		
	
	
}


// -----------------------------------------------------------------
// PRIORITIES FUNCTIONS
//-------------------------------------------------------------------
function setSliders(sliderId,slider_value){
	
	
	$('#' + sliderId + '').parents('div.slider-container').find("div.slider-label-left-message").show();
	$('#' + sliderId + '').parents('div.slider-container').find("div.slider-label-right-message").show();
	$('#' + sliderId + '').parents('div.slider-container').find("div.slider-label-right-message").css("height", "62px");
	$('#' + sliderId + '').parents('div.slider-container').find("div.slider-label-left-message").css("height", "62px");
	$('#' + sliderId + '').parents('div.slider-container').find("div.slider-label-left-message").html( "is <br /><span class='percent-weight'>" + Math.abs(slider_value- 100)  + "%</span>" );
	$('#' + sliderId + '').parents('div.slider-container').find("div.slider-label-right-message").html( "is <br /><span class='percent-weight'>" +  slider_value + "%</span>" );
	
	
				

}

// callback once results are returned from calculation
function getPrioritiesGraph(results){
	
	var output = '';
	if(results.userSet == 1){
			var priOutput = results.labels[results.criteria[0]];
	}
	else{
			var priOutput = 'All factors are equal';
	}
	var top= '<div id="priorities-top"><p class="body-heading">Your top priority is:</p><h4 class="priority-top-display ' + results.criteria[0] + '_color"> ' + priOutput + '</h4><h4 class="priorities-top-output ' + results.criteria[0] + '_result ' + results.criteria[0] + '_color">' + Math.round(100 * results.weights[results.criteria[0]]) + '%</h4></div>';
	
	
	
	
	output = '<div class="priorities-container" id="priorities-container">' + top + '<div class="priorities-bar">' + getPrioritiesBar(results) + '</div></div>';
	
	return output;
	
}
function getPrioritiesBar(results){
	
	var barOut = '';
	for (var i = 1; i < results.criteria.length; ++i){
      
	    var priorityBar = {};
		priorityBar.weight = Math.round(100 * results.weights[results.criteria[i]]);
		priorityBar.display = results.labels[results.criteria[i]];
		priorityBar.type = results.criteria[i];
		barOut = barOut +  tmpl("tmpl_priorities_bar", priorityBar);
	}
	
	return barOut;
}
// similar function as for DA bars, but limited here
function makeColorGradientPriorities(frequency1, frequency2, frequency3,
                             phase1, phase2, phase3, results, len, center,width)
  {
	var output = '';
	var inputScore = '';
	
	var counter = results.criteria.length;
	if(counter == 5){
		var multiple = 2.5;
	}
	if(counter == 4){
		var multiple = 1.5;
	}
	var k = counter -1;

    if (len == undefined)      len = 100;
    if (center == undefined)   center = 200;
    if (width == undefined)    width = 50;

    for (var i = 0; i < len; ++i)
    {
       var red = Math.sin(frequency1*i + phase1) * width + center;
       var grn = Math.sin(frequency2*i + phase2) * width + center;
       var blu = Math.sin(frequency3*i + phase3) * width + center;
	   
	   if( k >= 0){
		var priorityWeight = Math.round(100 * results.weights[results.criteria[k]]);
		var priorityBar = Math.round((100 * results.weights[results.criteria[k]]) * multiple);
		
		// don't allow to go over 100% on the display
		if(priorityBar > 90){
			priorityBar = 90;
		}
		
		// if this is the first field, then it is the preferred priority, so save it
		if(k == 0){
			inputScore = inputScore  +  '<input name="PREFERENCE" type="hidden" value="' + results.criteria[k] + '" />';
		}
		// throw in a field to save the value of the criteria
	    inputScore = inputScore  +  '<input name="' + results.criteria[k] + '" type="hidden" value="' + results.weights[results.criteria[k]] + '" />';
		
		
		output = '<div class="priority-bar rounded-corners-15" id="priorities-bar-' + k + '" style="width:' + (priorityBar) + '%; background-color:' + RGB2Color(red,grn,blu) + ';"><div class="priority-label ' + results.criteria[k] + '">' + results.labels[results.criteria[k]]+ '<span>' + priorityWeight + '%</span></div></div><div class="break"></div>' + output;	
		--k;
		
		
	
		
	   }
	
    }
	output = output + inputScore;
	return output;
  }



function RGB2Color(r,g,b)
  {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
  }

// convert to hex  
function byte2Hex(n)
  {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
  }



// ----------------------------------------------------------------------------------------------
// ACTION PLAN FUNCTIONS
//------------------------------------------------------------------------------------------------
function getActionPlanList(plan){
	
	var aplan = '';
	var aplanStrategies = '';
	var aplanStrategyBlocks = '';
	var categoryList = '';
	var additionalFilters = '';
	
	
	
	
	
	
	/* TOP 5 ACTION PLAN*/
	/* -------------------------------------------------------------------*/
	var top5 = '<div id="plan-top-five"><ul data-role="listview">';
	var top5Counter = 1;
	
	// EMPTY THE DROPDOWN LIST ON THE PROB_CHOOSE_page
	$('#PROB_CHOOSE').empty();
	$('#PROB_CHOOSE').append('<option value="0">-----CHOOSE FROM YOUR TOP 5 BELOW------</option>');
	
	for (var strategy5 in plan[window.idecideObj.priority]){
		var stratItem = plan[window.idecideObj.priority][strategy5];
		if(top5Counter <= 5){
			if(stratItem.matched == 1){
			top5 = top5 + '<li data-icon="arrow-r" data-plan-category="'+ stratItem.strategyType  +'" class="plan-line-item-' + stratItem.strategyType + '"><a href="#strategy-plan-' + stratItem.strategyShortName + '" id="plan-' + stratItem.strategyShortName + '" class="button-plan-item" data-rel="popup" data-history="false">' + stratItem.declarative + '</a></li>';
			
		
			$('#PROB_CHOOSE').append('<option value="' + top5Counter + '">' + stratItem.declarative + '</option>').trigger('create');
			}
		}
		top5Counter++;
		
	}
	top5 = top5 + '</ul> <a href="#" id="button-more-strategies" class="btn-solid-purple btn-large margin-top-30">CLICK HERE FOR MORE STRATEGIES</a></div>';
	
	
	
	// CONTINUE BUILDING THE DROP DOWN FOR PROB_CHOOSE
	//$('#PROB_CHOOSE').append('<option value="0">-----CHOOSE FROM YOUR TOP 5 BELOW------</option>');
	
	
	
	
	
	
	
	
	/* FULL ACTION PLAN */
	/* -------------------------------------------------------------------*/
	
	
	// PASS 1 - Add the categories to the users plan so we can record favorite categories as we go through each strategy in PASS 2
	//-----------------------------------------------------------------
	// loop through the category object and add the category name to the users ACTION PLAN SELECTED variable for recording favorites later on
	for (var category in plan.categories) {
		
		// ADD CATEGORIES TO DATA OBJECT IF NOT ALREADY THERE
		if(window.idecideObj.ACTION_PLAN_SELECTED[category] == undefined){
			window.idecideObj.ACTION_PLAN_SELECTED[category] = 0;
			
		}
	}
	
	
	
	// PASS 2 - CREATE THE CATEGORY LIST WITH MARKED FAVORITES
	//-------------------------------------------
	// loop through each category - use categories as filters for the action plan
	for (var category in plan.categories) {
		var categoryDisplay = {};
		
		categoryDisplay.category= category;
		categoryDisplay.prevFavorite = '';
		categoryDisplay.displayCategory = plan.categories[category].name;
		categoryDisplay.descriptionCategory = plan.categories[category].description;
		
		// IF FAVORITE STRATEGIES FOR THIS CATEGORY, THEN MARK AS A FAVORITE AT THE CATEGORY LEVEL
		if(window.idecideObj.ACTION_PLAN_SELECTED[category] > 0){
			categoryDisplay.prevFavorite = 'favorite-category';
		}
		else{			
			categoryDisplay.prevFavorite = '';
		}
		
		
		// COUNT STRATEGY NUMBER
		
		for (var category in plan) {
		
			// don't include the metadata on categories
			
			if(category == categoryDisplay.category){
				   var categoryObj = plan[category];
				  
				   // get each strategy in a category
				   for(var strategyItem = 0;strategyItem < categoryObj.length; strategyItem++) {	
						
						// GET THE STRATEGY OBJECT
						var strategyObj = categoryObj[strategyItem];
						
				   }
				   
			}
			categoryDisplay.count = strategyItem;
		}
		
		
	}
	
	
	
	

	
	
	
	
	// PASS 3 - Now go through all the strategies in each category
	// ------------------------------------------------------------
	// loop through the action plan object 
	// categories = {} <- This one can be ignored since it's just a list of the categories themselves.
	// child = {} <- These category objects contain an array of related strategy objects
	// emergency = {}
	// etc	
	for (var category in plan) {
		
		// don't include the metadata on categories
		if(plan[category] != 'categories'){
			   var categoryObj = plan[category];
			  
				// set flag for the parent category
			   var logStrategyType = '';
			   // get each strategy in a category
			   for(var strategyItem = 0;strategyItem < categoryObj.length; strategyItem++) {	
					
					// GET THE STRATEGY OBJECT
					var strategyObj = categoryObj[strategyItem];
					var tailoredItem = '';
					
					// IF THIS IS THE FIRST TIME GENERATING THE PLAN AND THE USER HASN'T ADJUSTED IT YET, THEN SET THE MATCHED FAVORITES
					if(strategyObj.matched == 1 && (window.idecideObj.ACTION_PLAN_SELECTED.userDefined == undefined || window.idecideObj.ACTION_PLAN_SELECTED.userDefined == 0) ){
						console.log('add to all items');
						window.idecideObj.ACTION_PLAN_SELECTED.STRATEGIES[strategyObj.strategyShortName] = 1;
						window.idecideObj.ACTION_PLAN_SELECTED[strategyObj.strategyType] = window.idecideObj.ACTION_PLAN_SELECTED[strategyObj.strategyType] + 1; 
						window.idecideObj.ACTION_PLAN_SELECTED.allItems = window.idecideObj.ACTION_PLAN_SELECTED.allItems + 1; 
						console.log(strategyObj.processing);
						
						
						
					}
					
					
					// BUILD THE RESOURCES
					var resourceItems = '';
					 for(var resourceCounter = 0;resourceCounter < strategyObj.resources.length; resourceCounter++) {
							strategyObj.resources[resourceCounter].resourceCounter = (resourceCounter+1);
							var resourceItem =  tmpl("tmpl_action_plan_resource", strategyObj.resources[resourceCounter]);
							resourceItems = resourceItems + resourceItem;
				
					 }
					 if(resourceItems != ''){
						 resourceItems = '<div class="strategy-resources-container"><div class="resource-header">Resources</div>' + resourceItems + '</div>';
					 }
					
					
					
					
					
					
					
					
					// STRATEGY BODY
					//-------------------------------
					
					var strategyListItem = '';
					strategyListItem = '<div class="stragety-display-container"><h4>' + strategyObj.longName + '</h4><h1>' + strategyObj.declarative + '</h1>';
					// BUILD STRATEGY DISPLAY
					var strategyDisplayItem = '';
					strategyDisplayItem = '<div class="strategy-display body-text">' + strategyObj.strategy +'</div>';
					
					strategyDisplayItem = '<div class="strategy-block" id="strategy-plan-' + strategyObj.strategyShortName + '" data-role="popup" data-corners="false" data-transition="pop" data-position-to="window" data-history="false" data-plan-category="'+ strategyObj.strategyType +'"><div class="nav-button float-r strategy-close-button"><a href="#" class="button-strategy-close btn-blue">Close</a></div>' + strategyListItem + strategyDisplayItem + resourceItems  +'</div></div>';
					
					
					
					
					// STRATEGY LIST ENTRY
					//-------------------------------
					
		
					// DISPLAY THE CATEGORY NAME AND DESCRIPTION
					if(strategyObj.strategyType != logStrategyType){
							var categoryDisplay = '<div id="' + category + '-section" class="category-inline-container"><div class="category-header"><h4>' + strategyObj.longName + '</h4></div><div class="category-description">' + strategyObj.description + '</div></div>';
					}
					else{
						var categoryDisplay = '';	
					}
					logStrategyType = strategyObj.strategyType
					
					//strategyListItem = strategyListItem + '<p class="hidden">plan-' + strategyObj.strategyType + '</p>';
					// STRATEGY LIST ITEM
					//strategyListItem = '<tr><td width="30%" class="plan-category-column"></td><td width="70px" class="plan-strategy-column">' + tailoredItem + favoriteItemList + '</td><td class="plan-strategy-column"><div data-plan-category="'+ strategyObj.strategyType  +'" class="plan-line-item plan-line-item-' + strategyObj.strategyType + '"><a href="#strategy-plan-' + strategyObj.strategyShortName + '" id="plan-' + strategyObj.strategyShortName + '" class="button-plan-item" data-rel="popup" data-history="false">' + strategyListItem + '</a></div></td></tr>';
					
					// STRATEGY LIST ITEM
					strategyListItem =  '<li data-icon="arrow-r" data-plan-category="'+ strategyObj.strategyType  +'" class="plan-line-item-' + strategyObj.strategyType + '">' + tailoredItem + '<a href="#strategy-plan-' + strategyObj.strategyShortName + '" id="plan-' + strategyObj.strategyShortName + '" class="button-plan-item" data-rel="popup" data-history="false"><h1>' + strategyObj.declarative + '</h1></a></li>';

					// APPEND TO LIST
					aplanStrategies = aplanStrategies + categoryDisplay + strategyListItem;
					aplanStrategyBlocks =  aplanStrategyBlocks + strategyDisplayItem;
				}
		}
	 } //end for categories
	
	
	
	// STRATEGIES TAB
	aplan = aplan + '<div id="plan-list-container"><a href="#" id="button-less-strategies" class="hide btn-solid-purple btn-large margin-top-30">BACK TO TOP 5</a><div id="plan-list-list"><ul data-role="listview" data-inset="false" data-filter="true" data-corners="false" id="action-plan-list">' +  aplanStrategies + '</ul>' + aplanStrategyBlocks + '</div><div class="break"></div></div>';
	
	// POST QUESTION
	aplan = top5 + aplan;

	
	
	
	
	// signal end of plan being built for the first time
	window.idecideObj.ACTION_PLAN_SELECTED.userDefined = 1;
	return aplan;

}