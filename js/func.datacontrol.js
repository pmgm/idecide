// JavaScript Document

// ----------------------------------------------------------------------------------------------
// CHECK FOR LOCALSTORAGE
function checkForDataObject(lsName) {
	

	//  NEW USER
	if(window.localStorage.getItem(lsName) == null){
		return false;
	}
	
	// RETURNING USER
	else{
		return true;
	}
	
	
}


// ----------------------------------------------------------------------------------------------
// FOR RETRIEVING JSON CONTENT FROM THE CONTENT SERVER
function getAPIData(apiObj){
	if(apiObj.attributes == undefined){
		var urlLine = apiObj.form;
	}
	else {
		var urlLine = apiObj.form + apiObj.attributes + '';
	}
	
	if(apiObj.async == undefined){
		var async = true;
	}
	else {
		var async = false;
	}

	$.ajax({
		url : urlLine,
		type : 'GET',
		async: false,
		cache: false,
		success : function(response) {
			handleAPIReturn(response,apiObj);	
		},
		error : function() {
			inform('Error loading');
		}
	});		
	
}




// ----------------------------------------------------------------------------------------------
// HANDLE THE RETURNED JSON FROM THE CONTENT SERVER
function handleAPIReturn(responseObj,apiObj, childSelected){

	// HANDLE TYPE
	if(apiObj.type == 'menu'){
		renderContent(responseObj,apiObj);
		
	}
	
	// no other types needed right now	
}



// ----------------------------------------------------------------------------------------------
// PREP USER RESPONSE DATA FOR SUBMISSION
function prepData(formId,context, returnType) {
	var data = $("#" + formId + "").serialize();
	sendData(data,formId,context,returnType);	
}

// ----------------------------------------------------------------------------------------------
// POST USER RESPONSE DATA TO DATABASE
function sendData(data,formName,context,returnType) {
	
	$.ajax({
			url : 'com/' + formName + '.php',
			type : 'POST',
			data : data,
			context : $('#' + context + ''),
			async: true,
			success : function(response) { // response is json
				
				var sResponse = jQuery.parseJSON(response);
				
				// check for successful save
				if(sResponse.success == 1){
						
						
						// set success element
						if(returnType == 'html'){
							$(this).html(sResponse.dataOutput);
						}
						else if(returnType == 'val'){
							$(this).val(sResponse.dataOutput);
						}
						
						
				}
				else{
					
					inform('Error saving.  Please contact support.');	
				}
				
			},
			error : function(response) {
				
				inform('Error saving');
			}
			
		});	
	
}
// SAVE EACH QUESTION TO THE QUESTION OBJECT
function saveData(formDataIn){
	
	window.idecideObj.date_completed = getDateNow();
	for (var savedQuestion in formDataIn) {
		var savedQuestionObj = formDataIn[savedQuestion];
		if(savedQuestionObj.name != 'date_started' && 
		   savedQuestionObj.name != 'date_completed' &&
		   savedQuestionObj.name.indexOf('meta_') != 1) {
	    	window.idecideObj.QUESTIONS[savedQuestionObj.name] = savedQuestionObj.value.replace(/[^\w\s\d]/gi, '');
		}
		else{
			window.idecideObj.QUESTIONS[savedQuestionObj.name] = savedQuestionObj.value;
		}
	}
	console.log('data saved to js obj');
	
	// SAVE TO LOCAL STORAGE
	updateStorage();
	
	// SAVE TO SERVER
	$.ajax({
        url : 'com/saveData.php',
        type : 'POST',
        data : {responseData: window.idecideObj, userId:window.idecideObj.id},
        async: true,
		dataType:"json",
        success : function(response) { // response is json
            var sResponse =response;
          
		    // check for valid response and direct to proper screen
            if(sResponse.success == 1){
				if(window.idecideObj.id == ""){
						window.idecideObj.id  = sResponse.message;
				}
            }
            else{
                inform('Error saving data.  Please contact support.');
            }

        },
        error : function(response) {

            inform('Error contacting server. Please contact support.');
        }
	});
	
}
// SAVE EACH QUESTION TO THE QUESTION OBJECT
function savePlan(){
	
	
	// SAVE TO LOCAL STORAGE
	updateStorage();
	
	// SAVE TO SERVER
	$.ajax({
        url : 'com/savePlan.php',
        type : 'POST',
        data : {responseData: window.idecideObj.ACTION_PLAN_SELECTED, userId:window.idecideObj.id},
        async: true,
		dataType:"json",
        success : function(response) { // response is json
            var sResponse =response;
          
		    // check for valid response and direct to proper screen
            if(sResponse.success == 1){
            }
            else{
                inform('Error saving data.  Please contact support.');
            }

        },
        error : function(response) {

            inform('Error contacting server. Please contact support.');
        }
	});
	
}
// UPDATE LOCAL STORAGE
function updateStorage(){
	//console.log('localStorage check');
	//if( checkForDataObject(appName) == true ){
		console.log('localStorage exists');
		//var savedSurveys = jQuery.parseJSON(localStorage.getItem(appName));
		//for(sv in savedSurveys){
		
			//savedSurveys[sv] = window.idecideObj;	
			var lsWriteSurveys = JSON.stringify(window.idecideObj);
			localStorage.setItem(appProps.appName,lsWriteSurveys);
			console.log('ls updated');
			
		//}
			
	//}
	
}

function addUser(){
	var d = new Date();
	var n = d.getTime();
	var r1 = Math.floor((Math.random()*100000)+1);
	var r2 = Math.floor((Math.random()*100000)+1);
	
	// default values for adding users
	var username = n + '-' + r1 + '-' + r2;
	var passcode = 'myplan';
	var userAgent = navigator.userAgent;
	
	window.idecideObj.username = username;
	
	
	$.ajax({
        url : wwwRoot + 'com/addUser.php',
        type : 'POST',
        data : {username: username,password: passcode, agent:userAgent},
		dataType : 'json',
        async: true,
        success : function(response) { // response is json
           var sResponse = response;
			//new user
            if(sResponse.success == "newuser"){ 
				window.idecideObj.id = sResponse.message;
				archiveData();
			}
		}
				

    });
	
}

function archiveData() {
	
	// SAVE TO SERVER
	if(window.idecideObj.id != ""){
		
		$.ajax({
			url : wwwRoot + 'com/saveData.php',
			type : 'POST',
			data : {responseData: window.idecideObj, userId:window.idecideObj.id},
			async: true,
			success : function(response) { // response is json
				
			   
			}
				
		});
	
	}	
	
}
// ----------------------------------------------------------------------------------------------
// ADD VARIABLE TO DATA OBJECT
function addToDataObject(attribute,value){

	window.idecideObj[attribute] = value;
	updateStorage();
	
}




// ------------------------------------------------------------------------------------------------
// API CALLS

// GET THE ORDER IN WHICH TO SHOW THE PRIORITIES FROM THE CMS  
// CURRENTLY CACHING THESE IN data.js SO NOT BEING INVOKED HERE

/*
function getPrioritiesControls(type){
	
	var sda_priorities_param = '?sda_app=' + window.idecideObj.surveyType + '&sda_strat1=' + type + '';
	
	 $.ajax({
			url : apiDir + 'api/sdaPriorities.php' + sda_priorities_param,
			type : 'GET',
			async: true,
			success : function(response) { // response is json
				console.log(response);
				//var sResponse = jQuery.parseJSON(response);
				
				if(response){
						renderPrioritiesControls(response);	
				}
				else{
					
					inform('Error saving.  Please contact support.');	
				}
				
			},
			error : function(response) {
				removeSpinner('da-spinner');	
				inform('Error saving');
			}
			
		});	
}

*/


// GET THE DA CALCULATION
function getDAResults(type,dataIn){

	var sda_da_calc_param = '?sda_app=' + window.idecideObj.surveyType+ '&sda_da_type=' + type + '&sda_language=en&sda_match_value=1&' +   $.param(dataIn);
	
	 $.ajax({
			url : appProps.apiDir + 'api/sdaCalcDangerAssessment.php' + sda_da_calc_param,
			type : 'GET',
			async: true,
			success : function(response) { // response is json
				console.log(response);
				
					
					
					window.idecideObj.NAVIGATION.completedTriggers.danger = 1;
					addToDataObject('DA_RESULTS',response);
					renderDAGraph(getDAGraph(response),response);
					removeSpinner('da-spinner');
					$('#da-results-container').trigger('create');
						
					
						
				
			},
			error : function(response) {
				removeSpinner('da-spinner');
				inform('No connection.  Please go online to get results.');
				renderError('danger_results_page');
			}
			
		});	
}



// GET THE PRIORITIES CALCULATION
function getPrioritiesResults(type,dataIn){

	if(type == 'PRI_CHILD') {
			var psection = 'priorities';
			var cNum = 5;
	}
	else {
			var psection = 'priorities_nc';
			var cNum = 4;
	}
	var sda_priorities_calc_param = '?sda_app=' + window.idecideObj.surveyType + '&sda_strat1=' + type + '&sda_language=en&sda_section=' + psection + '&sda_visit=visit1&sda_criteria_num=' + cNum + '&' +   $.param(dataIn);
	
	 $.ajax({
			url : appProps.apiDir + 'api/sdaCalcPriorities.php' + sda_priorities_calc_param,
			type : 'GET',
			async: true,
		
			success : function(response) { // response is json
				console.log(response);
				//var sResponse = jQuery.parseJSON(response);
				
				if(response.comparisons){
						
						window.idecideObj.QUESTIONS[response.criteria[0]] = 1;
						handlePrioritiesMap(response.criteria[0]);
						
						addToDataObject('PRIORITIES_RESULTS',response);
						renderPrioritiesGraph(getPrioritiesGraph(response),response);
						removeSpinner('priorities-spinner');
						for(var priorityWeight in response.weights){
							addToDataObject(priorityWeight,response.weights[priorityWeight]);
						
						}
						
						
						
						
				}
				else{
					removeSpinner('priorities-spinner');
					inform('There was an error processing your results.  Please try again later.');		
				}
				
			},
			error : function(response) {
				removeSpinner('priorities-spinner');
				inform('No connection.  Please go online to get results.');
				renderError('priorities_results');
			}
			
		});	
}






// GET THE ACTION PLAN
function getActionPlanResults(){


				// clean out the answer object since we don't need to send everything to get the action plan
				var qObj2 = {};
				for(itemObj in window.idecideObj.QUESTIONS){
						if( 
							(itemObj.indexOf("meta_") == -1) &&
							(itemObj.indexOf("SCRN_") == -1) ){
							qObj2[itemObj] = window.idecideObj.QUESTIONS[itemObj];
						}
						
						// add DA Score
						//qObj2['DA_SUM'] = window.idecideObj.DA_RESULTS.score;
				}
				console.log(qObj2);
			
				//var sda_action_plan_param = '?sda_app=' + window.idecideObj.surveyType + '&sda_region=4000&sda_language=en&' +   $.param(qObj2);
				
				//var sda_action_plan_param = '?sda_app=' + window.idecideObj.surveyType + '&sda_region=' + window.idecideObj.location + '&sda_language=en&' + jQuery.param(qObj2);
				
				 $.ajax({
						url : appProps.apiDir + 'api/sdaRulesv3.php',
						type : 'POST',
						async: false,
						data: {"sda_app" : window.idecideObj.surveyType , "sda_region" : window.idecideObj.location , "sda_language" : "en", "data" : qObj2},
						success : function(response) { // response is json
							console.log(response);
							//var sResponse = jQuery.parseJSON(response);
							
							if(response){
									removeSpinner('ap-spinner');
									addToDataObject('ACTION_PLAN',response);
									renderActionPlan(getActionPlanList(response),'new');
									//$('#plan-list-outer').trigger('create');
									
							}
							else{
								
								inform('There was an error processing your results.  Please try again later.');	
							}
							
						},
						error : function(response) {
							
							inform('No connection.  Please go online to get results.');
							renderError('plan');
						}
						
					});	

}






