// JavaScript Document
//----------------------------------------------


function getSurveyQuestions(question, sequence, previousData) {
	
		
	
		var questionAll = '';
		var questionOpen = '';
		var questionLabel = '';
		var questionAnswers = '';
		var questionClose = '';
		
		
		// for most question types - open and close the question container
		if(question.fieldType != 'checkbox' && question.subType != 'checkbox' && question.subType != 'grouped'  ){
			questionOpen = getQuestionOpen(question, sequence);
			questionLabel = getQuestionLabel(question,'parent');
			questionClose = getQuestionClose(question.isChild);	
			
		}
		
		// for nested series - start the container, add in the label, but don't close
		if(question.subType == 'checkbox'){
			questionOpen = getQuestionOpen(question, sequence);
			questionLabel = getQuestionLabel(question,'parent');	
			
		}
		// for checkbox series or for grouped questions, just show the label, no need to open or close a container
		if(question.fieldType == 'checkbox' || question.subType == 'grouped'){
			questionLabel = getQuestionLabel(question,'child');	
			
		}
	// for checkbox series
		if( (question.fieldType == 'checkbox' && question.checkboxEnd == 1) || (question.subType == 'grouped' && question.checkboxEnd == 1)){
			questionLabel = getQuestionLabel(question,'child');	
			questionClose = getQuestionClose(question.isChild);	
		}
		
		
		questionAnswers = getQuestionAnswers( question, previousData[question.standardName] );
		// GRID PROCESSING
		/*else{
			 var questionAnswers = '<fieldset data-role="controlgroup">';
			 var answerSet = answer;
			
			// FOR EACH ANSWER, BUILD A HIDDEN DIV WITH QUESTION AND ANSWERS
			for (x in answerSet ){
				 //alert( answerSet[x] );
				 var answerSetArray = new Array(answerSet[x]);
				 questionAnswers = questionAnswers + getQuestionAnswers( question, answerSetArray, x );
				questionAnswers = questionAnswers + '<div class="pfp-hidden-block" id="' + question  + '_' + x + '_sub">';
				
				var nestedQuestions =  processChildQuestion( question.grid_questions, x );
				
				
				questionAnswers = questionAnswers + nestedQuestions + '</div>';
			 }
			 questionAnswers = questionAnswers + '</fieldset>';
				 	 
		}*/
		questionAll = questionOpen + questionLabel + questionAnswers + questionClose;

		return questionAll;	
		
}




// OPEN QUESTION PAGE AND CONTAINER
function getQuestionOpen(question, sequence) {

	var questionOpen = '';
	
			var audioInclude = 'N';
			var questionAudio = '';
			var genderClass = '';
			if(question.genderCode == 'F'){
				var genderClass = ' femaleQuestion';
			}
			if(question.genderCode == 'M'){
				var genderClass = ' maleQuestion';
			}
			if(question.genderCode == 'A'){
				var genderClass = ' allQuestion';
			}
			
			var childClass = '';
			if(question.childCode == 'Y'){
				var childClass = ' childQuestion';
			}
			if(question.childCode == 'N'){
				var childClass = ' noChildQuestion';
			}
			var labelClass = '';
			if(question.fieldType == 'label' && question.subType != 'checkbox'){
					var labelClass = ' labelQuestion';
			}
				
	
			// FOR NESTED QUESTIONS
			if(question.isChild == 1){
				var questionContent = '<div id="' + question.standardName + '_outer" class="question-set question-sub' + genderClass + childClass + '">';
				if(question.subType != 'visible'){
					var showClass = "hide";
				}
				else{
					var showClass = "";
					}
				var questionContainer = '<div data-role="fieldcontain" id="' + question.standardName + '_container" class="' + showClass + '"><fieldset>';
				var questionNumber = '<div class="question-number">';
				
			}
			
			// FOR REGULAR QUESTIONS
			else {
				
				var questionContent = '<div id="' + question.standardName + '_outer" class="question-set' + labelClass + genderClass + childClass + '">';
				var questionContainer = '<div data-role="fieldcontain" id="' + question.standardName + '_container"><fieldset>';
				var questionNumber = '<div class="question-number">';
			}
			
				
			
			var questionAudio = renderAudioButton('question',question.audioText);
			//var questionAudio = '<div class="question-audio audioLink hidden"><a href="" class="audio-page"  name="' + question.standardName + '" data-role="button" data-inline="true" data-mini="true"></a></div>';
				
			var questionInnerContainer = '<div class="question-container">';
				
		
				
				questionOpen =  questionContent  + questionContainer + questionNumber + questionAudio + questionInnerContainer;
	



	
	return questionOpen;
		
}



//----------------------------------------------
// QUESTION LABEL
function getQuestionLabel(question, type){
	
		
		var questionLabel = '<label class="question-label" for="' + question.standardName + '" >' + question.label + '</label>';	
	
		if(type == 'parent'){
			questionLabel = '<div class="question-label-parent">' + questionLabel + '</div>';
		}
		
		
		
		return questionLabel;
	
}


//----------------------------------------------
// QUESTION ANSWERS
function getQuestionAnswers(question, previousData) {
	
	var answerOutput = '';
	var id_number = '';
	var inline = '';
	

	console.log(question.questionShortName + ":" + previousData);

	// checkbox
	if(question.fieldType == 'checkbox'){

	   /* DON'T NEED TO SHOW A NO OPTION */
	  	for (i=0;i<1;i++) {
		   
			   
		   // compare previous response
			 if(previousData != '' && previousData == question.answers[i].data){
				   var checkedValue = 'checked="checked"';
			   }
			   else {
				   var checkedValue = '';
			   }
		   answerOutput = answerOutput + '<input type="checkbox" name="' + question.standardName + '" id="' + question.standardName  + '" value="' + previousData + '" data-theme="c" data-native-menu="false"' + checkedValue + '/>';	
		   
		}
	}
	
	
	
	
	
	
	
	
	// radiobutton
	if(question.fieldType == 'radiobutton-v'){
		if(question.isGrid != 1){
			answerOutput = '<fieldset data-role="controlgroup">';
		}
		for (i=0;i<question.answers.length;i++) {
		   
		   
			   if(question.isGrid != 1){
					id_number = i;
				}
			
				// compare previous response
			
			   if(previousData != '' && previousData == question.answers[i].data){
				   var checkedValue = 'checked';
			   }
			   else {
				   var checkedValue = '';
			   }
			  
			   answerOutput = answerOutput + '<input type="radio" name="' + question.standardName +'" id="' + question.standardName + question.answers[i].data + '" value="' + question.answers[i].data + '" data-theme="c" data-native-menu="false" ' + checkedValue + ' /><label for="' + question.standardName + question.answers[i].data + '">' + question.answers[i].display + '</label>';	
		   
		}

		if(question.isGrid != 1){
			answerOutput = answerOutput + '</fieldset>';
		}
	}
	
	
	// radiobutton
	if(question.fieldType == 'radiobutton-h'){
		
		//if($(window).width() > 400){
			var layoutType = "horizontal";
		//}
		//else {
			//var layoutType = "vertical";
		//}
		
		if(question.isGrid != 1){
			answerOutput = '<fieldset data-role="controlgroup" data-type="' + layoutType + '">';
		}
		for (i=0;i<question.answers.length;i++) {
		   
		   
				   if(question.isGrid != 1){
						id_number = i;
					}
		
				// compare previous response
				//alert(question.answers[i].data + ':' + previousData);
				 if(previousData != '' && previousData == question.answers[i].data){
					 //alert('question:' + question.standardName + ' previous:' + previousData + 'data:' + question.answers[i].data);
					   var checkedValue = 'checked';
				   }
				   else {
					   var checkedValue = '';
				   }
				
				   answerOutput = answerOutput + '<input type="radio" name="' + question.standardName +'" id="' + question.standardName + question.answers[i].data + '" value="' + question.answers[i].data + '" data-theme="c" data-native-menu="false" ' + checkedValue + ' /><label for="' + question.standardName + question.answers[i].data + '">' + question.answers[i].display + '</label>';	
			
		}
		if(question.isGrid != 1){
			answerOutput = answerOutput + '</fieldset>';
		}
	}
	
	// dropdown
	if(question.fieldType == 'dropdown'){
		
		answerOutput = '<select data-native-menu="true" name="' + question.standardName  + id_number  + '" id="' + question.standardName + '" data-theme="c" data-native-menu="false">';
		for (i=0;i<question.answers.length;i++) {
			answerOutput = answerOutput + '<option value="' +  question.answers[i].data + '"> ' + question.answers[i].display + '</option>';
		}
		answerOutput = answerOutput + '</select>';
	}
	
	// textarea
	if(question.fieldType == 'textarea'){
			answerOutput = '<textarea name="' + question.standardName + id_number + '" id="' + question.standardName  + '">' + previousData + '</textarea>';
	}
	
	// textfield
	if(question.fieldType == 'text'){
			answerOutput = '<input type="text" name="' + question.standardName + id_number + '" id="' + question.standardName  + '"  value="' + previousData + '" />';
	}
	if(question.fieldType == 'label'){
			
	}
	// slider
	if(question.fieldType == 'slider'){
			answerOutput = '<input type="range" name="' + question.standardName + id_number + '" id="' + question.standardName  + '"  value="' + previousData + '" min="0" max="10" />';
	}
	
	// date field
	if(question.fieldType == 'date'){
			answerOutput = '<input type="date" name="' + question.standardName + id_number + '" id="' + question.standardName  + '"  value="' + previousData + '"  />';
	}
	
	
	return answerOutput;
}


//----------------------------------------------
// CLOSE QUESTION
function getQuestionClose(child) {
	
	var questionClose = '';
	
	// FOR NON-CHILD QUESTION CONTAINER ADD IN BUTTONS
	if(child != 1){
			
			
			
			var questionInnerContainerClose = '</div>';
			
			var questionContainerClose = '<div class="break"></div></fieldset></div>';
			var questionContentClose = '</div>';
		
			questionClose =  questionInnerContainerClose +  questionContainerClose +  questionContentClose;
	}
	// FOR CHILD QUESTION CONTAINERS, DON'T ADD IN BUTTONS AND DON'T CLOSE THE CONTAINER
	else {
			questionClose = '</fieldset></div></div>';  // just close the container
	}
	
	return questionClose;
	
	
}














//-------------------------------------------------------------------------------------------------
// FOR PRIORITIES SETTING

function getPrioritiesQuestions(questions, order, sequence,previousData) {
	
	var questionAll = '';

	var priorityNumber = 1;
	for (var priorityOrder in order) {
	   var priorityOrderObj = order[priorityOrder];
			
		
		
		var questionOpen = getQuestionOpen(priorityOrderObj, priorityNumber) + '<div class="slider-container">';
	
		var questionLabel = getPriorityLabel(priorityOrderObj);
	
		var questionAnswers = getPriorityAnswers( questions, priorityOrderObj,previousData);
	
		var questionClose =  '</div>' + getQuestionClose();
		
		priorityNumber++;
		questionAll = questionAll + questionOpen + questionLabel + questionAnswers  + questionClose;
		
	}
	
		return questionAll;		
}
//----------------------------------------------
// QUESTION LABEL
function getPriorityLabel(order){

	var questionLabel = '<div class="priority-question"><label for="' + order.standardName + '">Which of these two factors is more important to YOU?</label></div>';	
	return questionLabel;
}

// SLIDER
function getPriorityAnswers( questions, order, previousData){
		
		var answerOutput = '';

		for(i=0;i<questions.length;i++){
			if( order.leftItem == questions[i].questionShortName){
				var leftItemName = questions[i].questionShortName;
				var leftItemLabel = questions[i].label;
				var leftItemDefinition = questions[i].display;
				
			}
			if( order.rightItem == questions[i].questionShortName){
				var rightItemName = questions[i].questionShortName;
				var rightItemLabel = questions[i].label;
				var rightItemDefinition = questions[i].display;
			}	
		}
		
		if(previousData[order.standardName] == undefined){
			var sliderVal = 50;
			var sliderScript = '';
		}
		else {
			var sliderVal = previousData[order.standardName];
			var sliderScript = '';
			/*var sliderScript ="<script>$('#" + order.standardName + "_container').find(\"div.slider-label-left-message\").show();$('#" + order.standardName + "_container').find(\"div.slider-label-right-message\").show();$('#" + order.standardName + "_container').find(\"div.slider-label-right-message\").css(\"height\", \"62px\");$('#" + order.standardName + "_container').find(\"div.slider-label-left-message\").css(\"height\", \"62px\");$('#" + order.standardName + "_container').find(\"div.slider-label-left-message\").html( \"is <br /><span class='percent-weight'>" + Math.abs(sliderVal- 100)  + "%</span><br /> more <br /> important\" );$('#" + order.standardName + "_container').find(\"div.slider-label-right-message\").html( \"is <br /><span class='percent-weight'>" +  sliderVal + "%</span><br /> more <br />important\" );"
			
			
			if(sliderVal < 50){
				sliderScript = sliderScript + "$('#" + order.standardName + "_container').find(\"div.slider-graphic-left\").css(\"opacity\", 1);$('#" + order.standardName + "_container').find(\"div.slider-label-right, div.slider-label-right-message\").css(\"background-color\", '#F1BCBC' );$('#" + order.standardName + "_container').find(\"div.slider-label-left, div.slider-label-left-message\").css(\"background-color\", '#B0E794');$('#" + order.standardName + "_container').find(\"div.slider-graphic-right\").css(\"opacity\", " + sliderVal/50.00 +");</script>";
			}
			else if(sliderVal > 50){
					sliderScript = sliderScript + "$('#" + order.standardName + "_container').find(\"div.slider-graphic-right\").css(\"opacity\", 1);$('#" + order.standardName + "_container').find(\"div.slider-graphic-left\").css(\"opacity\", " + (100-sliderVal)/50.00 +");$('#" + order.standardName + "_container').find(\"div.slider-label-left, div.slider-label-left-message\").css(\"background-color\", '#F1BCBC');$('#" + order.standardName + "_container').find(\"div.slider-label-right, div.slider-label-right-message\").css(\"background-color\", '#B0E794')</script>";
					
				}
			else if(sliderVal == 50){
					sliderScript = sliderScript + "$('#" + order.standardName + "_container').find(\"div.slider-graphic-right\").css(\"opacity\", 1);$('#" + order.standardName + "_container').find(\"div.slider-graphic-left\").css(\"opacity\", 1);$('#" + order.standardName + "_container').find(\"div.slider-label-left, div.slider-label-left-message\").css(\"background-color\", '#B0E794');$('#" + order.standardName + "_container').find(\"div.slider-label-right, div.slider-label-right-message\").css(\"background-color\", '#B0E794');</script>";
					
				}
			else{
				sliderScript = sliderScript + "</script>";
			}*/
	
			
		}

		
		
		
		// feedback on percentage
		
		
		// graphics
		answerOutput = answerOutput + '<div class="slider-graphics"><div class="ui-slider-inner-label slider-graphic-left ' + leftItemName + '"><a href="" class="priority-definition oll-button" data-role="button" data-corners="false" data-mini="true"  title="' + leftItemDefinition + '" data-iconpos="notext" data-icon="info"></a></div><div class="ui-slider-inner-label slider-graphic-right ' + rightItemName + '"><a href="" class="priority-definition oll-button" data-role="button" data-corners="false" data-mini="true"  title="' + rightItemDefinition + '" data-iconpos="notext" data-icon="info"></a></div><div class="break"></div></div>';
		
		
		
		answerOutput = answerOutput + '<input type="range" name="' + order.standardName +'" id="' + order.standardName + '"  value="' + sliderVal + '" min="0" max="100"  />';
		if(sliderVal == 50){
				var requireSlider = '';
		}
		else{
				var requireSlider = sliderVal;
		}
		
		// left definition
		answerOutput = answerOutput + '<div class="slider-labels priority-labels"><div class="ui-slider-inner-label slider-label-left"><div>' + leftItemLabel + '</div></div>';
		
		// right definition
		answerOutput = answerOutput + '<div class="ui-slider-inner-label slider-label-right"><div>' + rightItemLabel + '</div></div><div class="break"></div></div><div class="break"></div>';
		answerOutput = answerOutput + '<div class="slider-labels"><div class="ui-slider-inner-label slider-label-percent slider-label-left-message">50%</div>';
		answerOutput = answerOutput + '<div class="ui-slider-inner-label slider-label-percent-right slider-label-right-message">50%</div><div class="break"></div></div>';
		//answerOutput = answerOutput + '<input type="hidden" name="' + order.standardName +'_val" id="' + order.standardName +'_val" value="' + requireSlider + '" />';
		answerOutput  = answerOutput + sliderScript;
		
		
		
		


		return answerOutput;
		
}
