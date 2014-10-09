// JavaScript Document
// ----------------------------------------------------------------------------------------------
// NAVIGATION BEHAVIORS
//----------------------------------------------------------------------------------------------

// GET NEXT PAGE
function goToPage(nextPage){

	$.mobile.changePage( $('#' + nextPage + '') );
	
}


// SET THE NAVIGATION BAR ACTIVE STATE
function setNavBarPosition(navObj){
	console.log('set nav bar');
	console.log(navObj);
	if(navObj.currentSection == 'priorities_nc'){
			navObj.currentSection = 'priorities';
			
	}
	
	/* UPDATE THE PROGRESS BAR DISPLAY	
	var navItem = $('#' + navObj.goToPage + '').find('.mod-section-' + navObj.currentSection + '');
	console.log(navItem);
	$('#' + navObj.goToPage + ' .menu-nav-bar-' + navObj.currentMod + '').find('div.mod-active').remove();
	navItem.parents('td').append('<div class="mod-active"></div>');
	*/
}


// SET THE NAVIGATION BAR ACTIVE STATE
function navBack(trigger){

	var navObj = {};
	// get the page id to go to
	navObj.goToPage = $(trigger).parents('div:jqmData(role="page")').prevAll('.active-page:first').attr('id');
	// get the module name
	navObj.currentMod = $('#' + navObj.goToPage + '').attr('name');
	navObj.currentSection = $('#' + navObj.goToPage + '').attr('data-section');
	if( typeof navObj.goToPage == 'undefined' ){
		// try redirecting to a pre-page
		navObj.goToPage = $(trigger).parents('div:jqmData(role="page")').prevAll('.pre-page:first').attr('id');
		// just send back to menu
		if( typeof navObj.goToPage == 'undefined' ){
			navObj.goToPage = window.idecideObj.menuPage;
		}
	}
	// update the navBarPosition
	setNavBarPosition(navObj);
	// go to the page
	$.mobile.changePage( $("#" + navObj.goToPage + "") );
	
	
}
// NAVIGATE TO NEXT PAGE
function navForward(trigger){

	
	var navObj = {};
	// get the page id to go to
	navObj.goToPage = $(trigger).parents('div:jqmData(role="page")').nextAll('.active-page:first').attr('id');
	
	// get the module name
	navObj.currentMod= $('#' + navObj.goToPage + '').attr('name');
	navObj.currentSection = $('#' + navObj.goToPage + '').attr('data-section');
	//get current page module name
	navObj.prevModule = $(trigger).parents('div:jqmData(role="page")').attr('name');
	navObj.prevSection = $(trigger).parents('div:jqmData(role="page")').attr('data-section');
	console.log('next page:' + navObj.goToPage);
	console.log(navObj);
	if( typeof navObj.goToPage == 'undefined' ){
		navObj.goToPage = window.idecideObj.menuPage;
	}
	// update the navBarPosition
	setNavBarPosition(navObj);
	
	// update the user progress by module
	updateModuleProgress(navObj);
	
	// update the user progress
	updateSectionProgress(navObj);
	
	// save to localStorage
	updateStorage();
	
	
	// check the module and determine if we should navigate to the next page or to the HELP ME DECIDE menu
	if(isNewModule(navObj)){
		
		// allow user to exit the HELP ME DECIDE menu now that it's done
		if( $(trigger).attr('id')  == 'new_forward' && 
		   window.idecideObj.NAVIGATION.completedTriggers.decide_safety == 1 &&
		   window.idecideObj.NAVIGATION.completedTriggers.decide_priorities == 1){
			   // set the trigger to be done
				window.idecideObj.NAVIGATION.completedTriggers.decide = 1;
				// exit menu
				$.mobile.changePage( $('#REL_INTENT_page') );
		}
		else{
			// if now past HELP ME DECIDE, ensure that we don't send them back to it.
			if(window.idecideObj.NAVIGATION.completedTriggers.decide == 1){
				$.mobile.changePage( $("#" + navObj.goToPage + "") );
			}
			else{
				// direct to HELP ME DECIDE
				updateMenuPage();
				$.mobile.changePage( $('#' + window.idecideObj.startPage + '') );
			}
		}
		
	}
	// handle module transitions before the HELP ME DECIDE menu
	else{
		// add some delay here to show loading spinner on long pages
		if(navObj.goToPage == 'CASLABEL_page' ){
				addSpinner('nav-spinner'); 
				setTimeout(function () {
					$.mobile.changePage( $("#" + navObj.goToPage + "") );
				}, 100);
		}
		// just go to the page
		else{
			$.mobile.changePage( $("#" + navObj.goToPage + "") );
		}
	
	}
	
	
	
	addTimer(navObj.goToPage);
	
}
function navPreStart(trigger,lsName){
	
	/*if(window.idecideObj.appLoaded == 1){
		$.mobile.changePage( $('#' + window.idecideObj.NAVIGATION.pageProgress + ''));
	}
	else{*/
		console.log(appProps.liveContent);
		survey_content = surveyObj.intervention.baseline;
		console.log(survey_content);
		setTimeout(function () {
					navStart(trigger);	
				}, 1000);
	//}
		

	
}
// START SURVEY
function navStart(trigger){
	
	
	window.idecideObj.surveyType = appProps.appName;
	window.idecideObj.surveyTypeDisplay = appProps.appName;
	window.idecideObj.surveyTypeKeyword = appProps.appName;
	
	// GET APPROPRIATE SURVEY FOR THE VISIT IF NEEDED
	// ------------------------
	var getSectionObj ={"form": "" + appProps.apiDir + "api/sdaAll.php","context":"content-container","async" : "false","attributes":"?sda_app=" + window.idecideObj.surveyType + "&sda_visit=visit1&sda_language=en&sda_glossary=0&sda_audio=1","type":"menu"};
	
	if ($(document).find('#plan').length == 0) { 
			// API CALL
			if(appProps.liveContent == 'yes'){
				getAPIData(getSectionObj);
			}
			else{
			// LOCAL CALL
				handleAPIReturn(survey_content,getSectionObj);	
			}
	}
	
	$('body').find('div.page-section').removeClass('active-page');
	
	// SHOW SECTION PAGES THAT ARE HIDDEN BY DEFAULT
	$('#introduction_page,#cas_results_page,#priorities_page,#priorities_nc_page,#da_cal_page,#priorities_results_page,#danger_results_page,#plan_page,#thank_you_page').addClass('active-page');
	
	// TESTING DEFAULTS
	/*window.idecideObj.QUESTIONS.PARTNER_GENDER = 1;
	window.idecideObj.QUESTIONS.REL_INTENT = 2;
	window.idecideObj.QUESTIONS.CHILDREN = 2;
	window.idecideObj.cas_result = 'sc';*/

	
	//window.idecideObj.NAVIGATION.completedTriggers.decide = 1;
	
	var numPages = $('div:jqmData(role="page").active-page').length;
	
	
	/*$('div:jqmData(role="page").active-page').each(function(index){
			var imgWidth =  100*(index/(numPages-1));
			$(this).find('div.progress-indicator div.progress-width').css('width',imgWidth + '%');
	});*/
	var navObj = {};
	// get the page id to go to
	navObj.goToPage = $(trigger).parents('div:jqmData(role="page")').nextAll('.active-page:first').attr('id');
	navObj.currentMod = $('#' + navObj.goToPage + '').attr('name');
	navObj.currentSection = $('#' + navObj.goToPage + '').attr('data-section');
	
	
	// NEW USERS
	if(window.idecideObj.userStatus == 'new'){
		window.idecideObj.userStatus = 'return';
		console.log( navObj.goToPage );
		
		$.mobile.changePage( $("#" + navObj.goToPage + "") );
		setNavBarPosition(navObj);
		setNavProgress(navObj);
		saveData('');
		
	}
	
	// RETURNING USERS
	// need to check for current progress to see what dynamic elements, like the DA graph, need to be generated if accessing them directly from the start
	else{
		console.log('return visitor');
		rerunLogic();
		navObj.goToPage = window.idecideObj.NAVIGATION.pageProgress;
		navObj.currentSection = window.idecideObj.NAVIGATION.sectionProgress;
		navObj.currentMod = window.idecideObj.NAVIGATION.moduleProgress;
		
		// send completed users back to plan not end page
		if(navObj.goToPage == 'plan_end_page'){
			navObj.goToPage = 'plan_page';
		}

		$.mobile.changePage( $('#' + navObj.goToPage + '') );
		
		setNavBarPosition(navObj);
		
		
	}
	
	
	removeSpinner('load-pages');
	
}

function setNavProgress(navObj){
	
	window.idecideObj.NAVIGATION.pageProgress = navObj.goToPage;
	window.idecideObj.NAVIGATION.moduleProgress = navObj.currentMod;
			
}
function updateSectionProgress(navObj){
	

	
	// check for module progress by comparing the module name of the page just left to the current page
	if(navObj.prevSection != navObj.currentSection){
		console.log('handle done nav bar: ' +  navObj.prevSection);
		if(window.idecideObj.NAVIGATION.completedSections[navObj.prevSection] == 0){
			
			// mark previous module as being done
			window.idecideObj.NAVIGATION.completedSections[navObj.prevSection] = 1;
			
			// for priorities, need to accommodate both types
			if(navObj.prevSection == 'priorities_nc'){
					navObj.prevSection = 'priorities';
					console.log('handle done priorities nav bar: ' + navObj.prevSection);
					
			}
			
			// highligt the module as being done in the UI
			$('body').find('.mod-section-' + navObj.prevSection + '').parents('td').append('<div class="mod-done-flash"></div>').delay(500, function(){
						
						$(this).find('div.mod-done-flash').fadeOut(2000);
						// mark done
					    $(this).append('<div class="mod-done"></div>');
						
			});
			
			
			
		}
	}
	

	window.idecideObj.NAVIGATION.sectionProgress = navObj.currentSection;
	
}
// HANDLE THE TRANSITION TO NEW PAGE
function navAction(trigger,direction){
	
	// current page
	var thisPage = $(trigger).parents('div:jqmData(role="page")').attr('id');
	var goToPage = $(trigger).parents('div:jqmData(role="page")').nextAll('.active-page:first').attr('id');
	
	if( typeof goToPage == 'undefined' ){
		goToPage = window.idecideObj.menuPage;
	}
	var resAction = true;
	// returns true on all pages, unless there is validation that isn't met, which in that case will return false and not allow for progress forward
	if(checkForPreHandling(thisPage) == true){
				
				
				
				// when a question exists on a page, we need to save the data
				if( $(trigger).hasClass('button-question')){
					
					var formData = $("#form-" + thisPage + "").serializeArray();
					var formId = 'form-' + thisPage;
					
					// save the data to the server
					//sendData(formData,formId,'','html');
					// save the data object on the client
					saveData(formData);
					console.log(formData);
					
					if(direction == 'forward'){
						// check for any skip patterns related to this page
						resAction = checkForPostHandling(thisPage,formData);
						if(resAction == true){
							resAction = checkForNextPageHandling(goToPage,formData);
						}
					}
					
				}
				
				else {
					
					}
				
				
			return resAction;
	}
	
	
	
}

	
function updateModuleProgress(navObj){
	
	
	// save page progress if not going back to menu
	if(navObj.goToPage != window.idecideObj.menuPage){
		window.idecideObj.NAVIGATION.pageProgress = navObj.goToPage;
	}
	
	
	// check for module progress by comparing the module name of the page just left to the current page
	if(isNewModule(navObj)){
		if(window.idecideObj.NAVIGATION.completedModules[navObj.prevModule] == 0){
			
			// mark previous module as being done
			window.idecideObj.NAVIGATION.completedModules[navObj.prevModule] = 1;
			
			
			
			
		}
	}
	
	
	
	
	window.idecideObj.NAVIGATION.moduleProgress = navObj.currentMod;
	console.log(window.idecideObj.NAVIGATION);
	console.log(getNextModule());
	
}


// add timers for each page
function addTimer(pageIn){
	

		var pageID =  'meta_timer_' + pageIn;
		
		//check if page timer already added
		if(window.idecideObj.PAGES[pageID] === undefined){
			window.idecideObj.PAGES[pageID] = getDateNow();
			updateStorage();
		
		}
		
}
//-------------------------------------------------------------
/* MODULE DETECTION FUNCTIONS */
//-------------------------------------------------------------
function isNewModule(navObj){
	
	if(navObj.currentMod == navObj.prevModule){
		return false;
	}
	else {
		return true;
	}
}


// GET THE NEXT MODULE BASED ON WHAT IS DONE CURRENTLY - USED FOR SENDING THE USER OFF OF THE HELP ME DECIDE MENU
function getNextModule(){
	for(var i = 0; i < window.idecideObj.NAVIGATION.orderModules.length; i++){
		if(window.idecideObj.NAVIGATION.completedModules[window.idecideObj.NAVIGATION.orderModules[i]] == 0){
			var nextMod = window.idecideObj.NAVIGATION.orderModules[i];
			break;
		}
	}
	
	return nextMod;
}


function isDecideDone(){

	// update the HELP ME DECIDE MENU
	// check for done
	   if(window.idecideObj.NAVIGATION.completedModules['decide_safety'] == 1 &&
	      window.idecideObj.NAVIGATION.completedModules['decide_priorities'] == 1){
				
				// show the next button on the menu page
				$('#new_forward').removeClass('nav-inactive').addClass('nav-forward');
				
				
				
				// check the relationship option as done regardless
				window.idecideObj.NAVIGATION.completedModules['decide_relationship'] = 1;
		}
		
}



//-------------------------------------------------------------
/* DYNAMIC PAGE DISPLAY CHANGE FUNCTIONS */
//-------------------------------------------------------------
// ALTER THE HELP ME DECIDE MENU PAGE BASED ON PROGRESS
function updateMenuPage(){
	
	   if( window.idecideObj.NAVIGATION.completedTriggers.decide_safety == 1){
		   $('#menu-module-safety').addClass('menu-module-done').children('div.menu-module-inner').text('Done!');
		   
	   }
	   
	   if( window.idecideObj.NAVIGATION.completedTriggers.decide_priorities == 1){
		   $('#menu-module-priorities').addClass('menu-module-done').children('div.menu-module-inner').text('Done!');
	   }
	   
	   if( window.idecideObj.NAVIGATION.completedTriggers.decide_relationship == 1){
		   $('#menu-module-relationship').addClass('menu-module-done').children('div.menu-module-inner').text('Done!');
	   }
		  
		
	
}








// ----------------------------------------------------------------------------------------------
// SPECIFIC NAVIGATION EVENTS PRE OR POST DATA SUBMISSION
//----------------------------------------------------------------------------------------------


// POST ------------------------------------------------------
// DO SOMETHING AFTER A PAGE IS POSTED
function checkForPostHandling(pageIn, dataIn){
	
	var postRes = true;
	
	if(pageIn == 'AGECURRENT_page'){
		handleLocation();
	}
	// GNEDER AND CHILD HANDLING
	if(pageIn == 'CURRENT_RELSHIP_page'){		
		handlePartnerGender();
		handleChild();
		window.idecideObj.NAVIGATION.completedTriggers.demographics = 1;
		
	}
	// HEALTHY_RELATIONSHIP
	if(pageIn == 'HEALTHY_LABEL_page'){
		window.idecideObj.NAVIGATION.completedTriggers.decide_relationship = 1;
	}
	// QUESTIONS DONE
	if(pageIn == 'HEALTH_CARD_page' ){
		window.idecideObj.NAVIGATION.completedTriggers.questions = 1;
	}
	
	// DA RESULTS HANDLING
	if(pageIn == 'DA1_page' || pageIn == 'DAf1_page'){
		// ajax to api
		handleDAResults(dataIn);
		handleSuicideRisk();
		
		window.idecideObj.NAVIGATION.completedTriggers.danger = 1;
		window.idecideObj.NAVIGATION.completedTriggers.decide_safety = 1;
		
		
	}
	
	
	// DECISION AID HANDLING
	if(pageIn == 'CASLABEL_page' ){
		handleCASScore();
		handleCASResults();
	}

	// DECISION AID HANDLING
	if(pageIn == 'PRI_RESOURCES_page' ){
		
		// ajax to api
		// doing both here asynchronously since there is no dependency on the two
		handlePrioritiesResults(dataIn);
		window.idecideObj.NAVIGATION.completedTriggers.decide_priorities = 1;
	}
	
	// RELATIONSHIP ACTION
	if(pageIn == 'REL_INTENT_page' ){
		handleRelationshipIntent();
		if(window.idecideObj.NAVIGATION.completedTriggers.action_plan == 0){
			handleActionPlan();
			window.idecideObj.NAVIGATION.completedTriggers.action_plan = 1;
		}
		
	}
	
	// RELATIONSHIP ACTION
	if(pageIn == 'PROB_CHOOSE_page' ){
		window.idecideObj.prob_choose = $('#PROB_CHOOSE option:selected').text();	
	}
	
	if(pageIn == 'PROB_OPTIONS_page' ){
		window.idecideObj.prob_option_1 = $('#PROB_OPTION_1').val();
		window.idecideObj.prob_option_2 = $('#PROB_OPTION_2').val();		
	}
	
	if(pageIn == 'PROB_BEST_page' ){
		window.idecideObj.prob_best_option = $('input[name="PROB_BEST_OPTION"]:checked').next('label').text();	
	}
	
	return postRes;
	
	
}

// PRE ------------------------------------------------------
// DO SOMETHING BEFORE A PAGE IS POSTED
function checkForPreHandling(pageIn, dataIn){
	
	var res = true;
	
	/*if(pageIn == 'DA1' || pageIn == 'DAf1'){
	
		$("#form-" + pageIn + " input[type=radio]").each(function(){
			var rname = $(this).attr('name');
			if( !$("input[name=" + rname + "]:checked").val() && rname != 'DA5a')  {
				  showRequired(rname,1);
					res = false;
			}
		
		});
			
	}*/
	
	// POSTCODE
	if(pageIn == 'AGECURRENT_page'){
		if(  $("input[name=POSTCODE]").val() == '' ) {
			showRequired('POSTCODE',4);
			res = false;
		}
		if(  !$("input[name=POSTCODE]").val() == '' ) {
				if( $("input[name=POSTCODE]").val().length != 4){
					showRequired('POSTCODE',4);
					res = false;
				}
				
		}	
	}
	// SAFETY MESSAGE
	if(pageIn == 'CURRENT_RELSHIP_page'){
		
		if(  !$("input[name=CHILDREN]:checked").val() ) {
			showRequired('CHILDREN',1);
			res = false;
		}	
		
		if(  !$("input[name=PARTNER_GENDER]:checked").val() ) {
			showRequired('PARTNER_GENDER',1);
			res = false;
		}
		
			
	}
	
	// PRIORITIES
	if(pageIn == 'PRI_RESOURCES_page'){
		$("#form-" + pageIn + " input[type=number]").each(function(){
			var rname = $(this).attr('name');
			if( $("#" + rname + "").next('div').find('a.ui-slider-handle').attr('title') == 50)  {
				  showRequired(rname,5);
					res = false;
			}
		
		});
	}
	
	// SAFETY MESSAGE
	if(pageIn == 'HEALTHY_LABEL_page'){
		res = handleSafetyMessage(pageIn);
	}
	
	// SAFETY MESSAGE
	if(pageIn == 'SAFETY_LABEL_page'){
		res = handleSafetyMessage(pageIn);
	}
	
	
	if( res == false ){
			removeSpinner('nav-spinner');
			inform('Please complete all fields');
	}
	
	
	
	return res;
	
}






function checkForNextPageHandling(pageIn, dataIn){
	
	var res = true;
	
	
	
	
	return res;
	
}






// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// SPECIFIC BEHAVIORS FOR APP
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------



function rerunLogic(){
		
		
		
		handleRelationshipIntent();
		
		
		// EVERYTHING DONE
		if(window.idecideObj.NAVIGATION.completedTriggers.action_plan == 1){
			
			  handlePartnerGender();
			  handleChild();
			  handleCASResults();
			  renderDAGraph(getDAGraph(window.idecideObj.DA_RESULTS),window.idecideObj.DA_RESULTS);
			  for(i=1;i<=10;i++){
					setSliders('P'+i,window.idecideObj.QUESTIONS['P'+i]);  
			  }
			  renderPrioritiesGraph(getPrioritiesGraph(window.idecideObj.PRIORITIES_RESULTS),window.idecideObj.PRIORITIES_RESULTS);
			  renderActionPlan(getActionPlanList(window.idecideObj.ACTION_PLAN),'return');
			  console.log('re-ran action plan');
			  
			
		}
		else if(window.idecideObj.NAVIGATION.completedTriggers.decision_aid == 1){
			
			  handlePartnerGender();
			  handleChild();
			   handleCASResults();
			  renderDAGraph(getDAGraph(window.idecideObj.DA_RESULTS),window.idecideObj.DA_RESULTS);
			  for(i=1;i<=10;i++){
					setSliders('P'+i,window.idecideObj.QUESTIONS['P'+i]);  
			  }
			  renderPrioritiesGraph(getPrioritiesGraph(window.idecideObj.PRIORITIES_RESULTS),window.idecideObj.PRIORITIES_RESULTS);
			  
			  console.log('re-ran decision aid');
			  
			
		}
		
		// DECISION AID NOT DONE
		else if(window.idecideObj.NAVIGATION.completedTriggers.danger == 1){
				 
				  handlePartnerGender();
				  handleChild();
				  handleCASResults();
				  renderDAGraph(getDAGraph(window.idecideObj.DA_RESULTS),window.idecideObj.DA_RESULTS);
				  console.log('re-ran danger');
				 
				  
			
		
		}
		// DANGER ASSESSMENT NOT DONE
		else if(window.idecideObj.NAVIGATION.completedTriggers.questions == 1){
	
				  handlePartnerGender();
				  handleChild();
				  console.log('re-ran assessment');
				 
				  
			
		}
		
		else{}
		
		
	
}




//-------------------------------------------------------------
/* ACTION PLAN */
//-------------------------------------------------------------

function showPlanFavorites(){
	
	$('#action-plan-list').find('.action-plan-data-unchecked').parents('li').addClass('favorites-on');
	$('#action-plan-list').find('.favorite-category-unchecked').addClass('favorites-on');
	
}

function showPlanAll(){
	
	$('#action-plan-list').find('.action-plan-data-unchecked').parents('li').removeClass('favorites-on');
	$('#action-plan-list').find('.favorite-category-unchecked').removeClass('favorites-on');
}
	
	


function showDefaultFilters(page){
	
	
		// remove extra filters from jQM bug
		var firstListFilter = $(page).find('.ui-listview-filter:first').addClass('real-list-filter');
		$(firstListFilter).nextAll('.ui-listview-filter').remove();
		
		// make first filter active
		var activeFilter = $(page).find('.button-plan-filter:first').addClass('ui-btn-active');
		activeFilter = $(activeFilter).attr('id');
		var activeFilterText = activeFilter.substr(7);
		

		
		// change the filter
		var filter_el = $(firstListFilter).find('.ui-input-search .ui-input-text');
		var filter_val = filter_el.val();
		filter_val = '';
		var filter_query = filter_val+'plan-'+ activeFilterText;
		filter_el.val(filter_query.trim());
		filter_el.trigger("change");	
	
}




// SHOW / HIDE THE CORRECT DANGER ASSESSMENT WHICH IS GENDER BASED
function handlePartnerGender(){

	// FEMALE
	if(window.idecideObj.QUESTIONS.PARTNER_GENDER == 2 ||
	   window.idecideObj.QUESTIONS.PARTNER_GENDER == 3 ){
		//$('body').find('div.active-page[name="danger"]').remove();
		$('body').find('div.danger').remove();
		window.idecideObj.partner_gender = 0;
	}	
	//MALES	
	else{
		//$('body').find('div.active-page[name="danger_f"]').remove();
		$('body').find('div.danger_f').remove();
		window.idecideObj.partner_gender = 1;
	}
}


function handleRelationshipIntent(valueIn){
	
	
	// STAY
	if(window.idecideObj.QUESTIONS.REL_INTENT == 1 || 
		valueIn == 1){
		$('#CONTEMP_STAY_container, #CONTEMPT_STAY_LABEL_container').show();
		$('#CONTEMP_LEAVE_container, #CONTEMPT_LEAVE_LABEL_container').hide();
		
		window.idecideObj.rel_intent = 'stay';
		
	}
	//LEAVE OR ALREADY LEFT
	else if(window.idecideObj.QUESTIONS.REL_INTENT == 2 ||
			window.idecideObj.QUESTIONS.REL_INTENT == 3 || 
			valueIn == 2 || 
			valueIn == 3){
		$('#CONTEMP_LEAVE_container, #CONTEMPT_LEAVE_LABEL_container').show();
		$('#CONTEMP_STAY_container, #CONTEMPT_STAY_LABEL_container').hide();
	
		
		// LEAVE
		if(	window.idecideObj.QUESTIONS.REL_INTENT == 2 || 
		    valueIn == 2 ){
			window.idecideObj.rel_intent = 'leave';
		}
		// LEAVE
		if(	window.idecideObj.QUESTIONS.REL_INTENT == 3 || 
		    valueIn == 3){
			window.idecideObj.rel_intent = 'left';
		}
		
	}
	
	else{
			
	}
	
	
	// GET THE SCORE
	// IF CONTEMP_LEAVE OR CONTEMP_STAY selected option is greater than 6 (value in the display which corresponds to 5 thru 11) then no need for motivational interviewing
	if( (window.idecideObj.QUESTIONS.CONTEMP_LEAVE != "" && window.idecideObj.QUESTIONS.CONTEMP_LEAVE < 5) || 
	     (window.idecideObj.QUESTIONS.CONTEMP_STAY != "" && window.idecideObj.QUESTIONS.CONTEMP_STAY < 5)  ){
			//window.idecideObj.completedTriggers.motivational = 1;	
			console.log("hiding motivational interviewing");
			$('body').find('div.mot_interview').removeClass('active-page');
	}
	else{
		$('body').find('div.mot_interview').addClass('active-page');
	}
	
}
// SHOW / HIDE THE CORRECT PRIORITIES ASSESSMENT WHICH IS CHILD BASED
function handleChild(){
	
		console.log('handleChild');
		//CHILDREN
		if(window.idecideObj.QUESTIONS.CHILDREN == 1){
			//$('body').find('div.active-page[name="priorities"]').remove();
			$('body').find('div.priorities_nc').remove();
			window.idecideObj.children = 1;
			
			// remove the narrative
			$('body').find('div.priorities').each(function(){
				if($(this).attr('id') == 'PRI_RESOURCES_page'){
					$(this).find('div.section-narrative-top').empty();
				}
			});
			
		}	
		// NO CHILDREN	
		else{
			//$('body').find('div.active-page[name="priorities_nc"]').remove();
			$('body').find('div.priorities').remove();
			window.idecideObj.children = 0;
			
			// remove the narrative
			$('body').find('div.priorities_nc').each(function(){
				if($(this).attr('id') == 'PRI_RESOURCES_page'){
					$(this).find('div.section-narrative-top').empty();
				}
			});
			
		}
		
	
}
function handleLocation(){
	
	
	
		if(window.idecideObj.QUESTIONS.POSTCODE != 0 &&
		   window.idecideObj.QUESTIONS.POSTCODE != '' &&
		   !isNaN(window.idecideObj.QUESTIONS.POSTCODE ) ){
			//$('body').find('div.active-page[name="priorities"]').remove();
			window.idecideObj.location = window.idecideObj.QUESTIONS.POSTCODE;
			window.idecideObj.location_display = getLocation(window.idecideObj.location);
			
		}
		else{
			window.idecideObj.location = 0000;
			getLocation(window.idecideObj.location);
		}
		
	
}

// SHOW THE POPUP MESSAGE AFTER THE RELATIONSHIP OR SAFETY MODULE QUESTIONS IF THEY ANSWERED NONE
function handleSafetyMessage(pageIn){
	
	var res = true;
	if($('#HOW_SAFE_RELATIONSHIP').val() == 0 &&
	   $('#HOW_AFRAID_RELATIONSHIP').val() == 0 &&
		window.idecideObj.NAVIGATION.completedTriggers.safety_message == 0 &&
		pageIn == 'HEALTHY_LABEL_page' ){
		 
		
		 // show message
		 $('#message1').popup('open'); 
		
		 
		 // HIDE THE WHOLE PAGE IN THE SAFETY MODULE IF ALREADY ANSWERED THESE QUESTIONS HERE
		if( (window.idecideObj.QUESTIONS.HOW_SAFE_RELATIONSHIP > 0 &&
		 	window.idecideObj.QUESTIONS.HOW_AFRAID_RELATIONSHIP > 0) ||
		 	window.idecideObj.NAVIGATION.completedTriggers.safety_message == 1){
				$('#SAFETY_LABEL_page').removeClass('active-page');  
		}
		 
		 res = false;
	}
	else if($('#HOW_SAFE_SAFETY').val() == 0 &&
		   $('#HOW_AFRAID_SAFETY').val() == 0 &&
		    window.idecideObj.NAVIGATION.completedTriggers.safety_message == 0 &&
				pageIn == 'SAFETY_LABEL_page'){
			 
			 
			 // show message
			 $('#message1').popup('open');
			 res = false;
		 }
	else{
		res = true;
	}
	 window.idecideObj.NAVIGATION.completedTriggers.safety_message = 1;
	 return res; 
}

function handleCASScore(){
	
	var cas_st = 0;
	var cas_pt = 0;
	var cas_et = 0;
	var cas_ht = 0;
	
	var cas_st_b = 0;
	var cas_pt_b = 0;
	var cas_et_b = 0;
	var cas_ht_b = 0;
	
	var cas_result = '';
	//SC
	cas_st =   window.idecideObj.QUESTIONS.CAS2 +
			   window.idecideObj.QUESTIONS.CAS5 +
			   window.idecideObj.QUESTIONS.CAS7 +
			   window.idecideObj.QUESTIONS.CAS15 +
			   window.idecideObj.QUESTIONS.CAS18 +
			   window.idecideObj.QUESTIONS.CAS22 +
			   window.idecideObj.QUESTIONS.CAS25 +
			   window.idecideObj.QUESTIONS.CAS26;
		 
	cas_pt =   window.idecideObj.QUESTIONS.CAS6 +
			   window.idecideObj.QUESTIONS.CAS10 +
			   window.idecideObj.QUESTIONS.CAS14 +
			   window.idecideObj.QUESTIONS.CAS17 +
			   window.idecideObj.QUESTIONS.CAS23 +
			   window.idecideObj.QUESTIONS.CAS27 +
			   window.idecideObj.QUESTIONS.CAS30;
			   	   
	  
	cas_et =   window.idecideObj.QUESTIONS.CAS1 +
			   window.idecideObj.QUESTIONS.CAS4 +
			   window.idecideObj.QUESTIONS.CAS8 +
			   window.idecideObj.QUESTIONS.CAS9 +
			   window.idecideObj.QUESTIONS.CAS12 +
			   window.idecideObj.QUESTIONS.CAS19 +
			   window.idecideObj.QUESTIONS.CAS20 +
			   window.idecideObj.QUESTIONS.CAS21 +
			   window.idecideObj.QUESTIONS.CAS24 +
			   window.idecideObj.QUESTIONS.CAS28 +
			   window.idecideObj.QUESTIONS.CAS29;
		
	cas_ht =   window.idecideObj.QUESTIONS.CAS3 +
			   window.idecideObj.QUESTIONS.CAS11 +
			   window.idecideObj.QUESTIONS.CAS13 +
			   window.idecideObj.QUESTIONS.CAS16;	   
	
	  
	 if(cas_st >0){ cas_st_b = 1;}
	 if(cas_pt >0){ cas_pt_b = 1;}
	 if(cas_et >0){ cas_et_b = 1;}
	 if(cas_ht >0){ cas_ht_b = 1;}
	 
	 
	 if( cas_st_b == 1){ cas_result = 'sc';}
	 if( cas_st_b == 0 && cas_pt_b == 1 &&  cas_et_b  == 0 && cas_ht_b == 0) { cas_result = 'po';}
	 if( cas_st_b == 0 && cas_pt_b == 1 && (cas_et_b  == 1 || cas_ht_b == 1)){ cas_result = 'pe';}
	 if( cas_st_b == 0 && cas_pt_b == 0 && (cas_et_b  == 1 || cas_ht_b == 1)){ cas_result = 'eo';}
	 
	 console.log('cas_st_b:' + cas_st_b);
	 console.log('cas_pt_b:' + cas_pt_b);
	 console.log('cas_et_b:' + cas_et_b);
	 console.log('cas_ht_b:' + cas_ht_b);
	 window.idecideObj.cas_result = cas_result;
		
}
function handleCASResults(){
	$('#cas_results_content div').hide();	
	$('#cas_' +  window.idecideObj.cas_result + '').show();	
	
}
// RETRIEVE DA RESULTS AFTER DA IS COMPLETED
function handleDAResults(dataIn){
		
	addSpinner('da-spinner');
	if(window.idecideObj.partner_gender == 0){
		getDAResults('F',dataIn);
	}
	else{
		getDAResults('M',dataIn);
	}
}

// RETRIEVE DA RESULTS AFTER DA IS COMPLETED
function handlePrioritiesResults(dataIn){
	
	addSpinner('priorities-spinner');
	
		if(window.idecideObj.QUESTIONS.CHILDREN == 1){
			getPrioritiesResults('PRI_CHILD',dataIn);
		}
		else{
			getPrioritiesResults('NONE',dataIn);
		}
	
}
// SAVE THE PRIORITY ON RESULT RETURN SO WE CAN EASILY MAP IT TO THE ACTION PLAN STRATEGIES
function handlePrioritiesMap(priority){
	
	var prioritySet = 'safety';
	switch(priority){
		
		case 'PRI_RESOURCES':
			prioritySet = 'resources'
		break;
		case 'PRI_SAFETY':
			prioritySet = 'safety'
		break;
		case 'PRI_CHILD':
			prioritySet = 'child'
		break;
		case 'PRI_PRIVACY':
			prioritySet = 'health'
		break;
		case 'PRI_PARTNER':
			prioritySet = 'partner'
		break;
				
	}
	addToDataObject('priority',prioritySet);
	
}
function handleSuicideRisk(){
	
	window.idecideObj.S_RISK = 0;
	// RULE 1
	if( (window.idecideObj.QUESTIONS.CESDR_HURT > 3) || (window.idecideObj.QUESTIONS.CESDR_DEAD > 3) ){
			window.idecideObj.S_RISK = 1;
		}
	else{
		// RULE 2
		if( (window.idecideObj.QUESTIONS.CESDR_HURT == 3) || (window.idecideObj.QUESTIONS.CESDR_DEAD == 3) ){
			
			if( (window.idecideObj.QUESTIONS.DA20 == 1) || (window.idecideObj.QUESTIONS.DAf18 == 1) ) {
				window.idecideObj.S_RISK = 1;	
			}
		}
	}
	
	
	if(window.idecideObj.S_RISK == 1){
		$('body').find('div.risk').addClass('active-page');	
		//inform('Suicide Risk');
	}
	else{
		$('body').find('div.risk').removeClass('active-page');
	}
	
		
}
// RETRIEVE DA RESULTS AFTER DA IS COMPLETED
function handleActionPlan(){
	addSpinner('ap-spinner');
	setTimeout(function () {
					getActionPlanResults();
				}, 100);
		


	//$('#plan').on('pagebeforeshow',function(){
	//		$(this).find('div.section-container').trigger('create');								
	//});
	
}

function alterCSS(){
	
	if(window.iosversion >=7){
		$('#footer-home, .page-footer').addClass('ios7-footer');	
	}	
}
function getLocation(locationCode){
	
	var location = '';
	if(locationCode >= 0 && locationCode <= 1999){
		location = 'act';
	}
	if(locationCode >= 2000 && locationCode <= 2999){
		location = 'nsw';
	}
	if(locationCode >= 3000 && locationCode <= 3999){
		location = 'vic';
	}
	if(locationCode >= 4000 && locationCode <= 4999){
		location = 'qld';
	}
	if(locationCode >=5000 && locationCode <= 5999){
		location = 'sa';
	}
	if(locationCode >= 6000 && locationCode <= 6999){
		location = 'wa';
	}
	if(locationCode >= 7000 && locationCode <= 7999){
		location = 'tas';
	}
	if(locationCode >= 8000 && locationCode <= 8999){
		location = 'nt';
	}
	location = location.toUpperCase();
	return location	
}