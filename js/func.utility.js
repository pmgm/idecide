// JavaScript Document
// ----------------------------------------------------------------------------------------------
// COUNT NUMBER OF OBJECT PROPERTIES
function countProperties(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function getDateNow(){
	
		var d = new Date();
		var curr_date = d.getDate();
		var curr_month =d.getMonth() + 1; //Months are zero based
		var curr_year = d.getFullYear();
		var curr_hour = d.getHours();
		var curr_min = d.getMinutes();
		var curr_sec = d.getSeconds();
	
		if(curr_date.toString().length == 1){
				curr_date = "0" + curr_date.toString();
		}
		if(curr_hour.toString().length == 1){
				curr_hour = "0" + curr_hour.toString();
		}
		if(curr_min.toString().length == 1){
				curr_min = "0" + curr_min.toString();
		}
		if(curr_sec.toString().length == 1){
				curr_sec = "0" + curr_sec.toString();
		}
		
		var dNow = (curr_year + "-" + curr_month + "-" + curr_date + " " + curr_hour + ":" + curr_min + ":" + curr_sec);

		return dNow;
	}


function inform(message) {

	$("<div class='inform-message ui-loader ui-overlay-shadow'>" + message + "</div>").appendTo($.mobile.pageContainer).delay(1500).fadeOut(600, function() {
		$(this).remove();
	});
}
	
function exitConfirm() {

	$("<div id='exit-survey-now' class='inform-message ui-loader ui-overlay-shadow ui-body-e ui-corner-all'>Are you sure you want to exit?<div><a href='#' data-role='button' data-theme='c' data-corners='false' class='close-exit-button'>No</a><a href='index.html' data-role='button' rel='external' data-theme='c'  data-corners='false' class='button-close-exit'>Yes, exit</a></div></div>").appendTo($.mobile.pageContainer).trigger('create');
}

function chatConfirm() {

	$("<div id='chat-now' class='inform-message ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><p>Do you want to chat with a peer advocate at www.loveisrespect.org?</p><p>Selecting 'Yes' will start your chat session.</p><div><a href='#' data-role='button' data-theme='c' data-corners='false' class='oll-button button-close'>No</a><a href='#chat-page' data-role='button' data-theme='c'  data-corners='false' class='button-chat-confirm oll-button'>Yes</a></div></div>").appendTo($.mobile.pageContainer).trigger('create');
}


function resetConfirm() {

	$("<div id='reset-survey-now' class='inform-message ui-loader ui-overlay-shadow ui-body-e ui-corner-all'>Are you sure you want to reset the data?<div><a href='#' data-role='button' data-theme='c' data-corners='false' class='close-reset-button'>No</a><a href='index.html' data-role='button' rel='external' data-theme='c'  data-corners='false' class='button-reset-confirm'>Yes, reset</a></div></div>").appendTo($.mobile.pageContainer).trigger('create');
}

function getFormDataItem(dataObj,dataItem){
	
	var returnValue = '';
	
	for(dataResponseCounter = 0; dataResponseCounter < dataObj.length; dataResponseCounter++){
		
		if(dataObj[dataResponseCounter].name == dataItem){
			returnValue = dataObj[dataResponseCounter].value;
		}
	}

	return returnValue;
	
}


function showRequired(fieldName,msgType){
	
	switch(msgType){
		
		case 1:
			var msg = 'Please select an option'
		break;
		
		case 2:
			var msg = 'Please select each item';
		break;
		case 4:
			var msg = 'Please specify a 4 digit post code';
		break;
		case 5:
			var msg = 'Please move the slider, even just a little bit';
		break;
	}
	
	
	if(msgType != 5){
		if( $('#' + fieldName + '_container div.required-item').length){	
		  }
		else {
			if( !($('#' + fieldName + '_container').parent().hasClass('question-required')) ){
				$('#' + fieldName + '_container').parent().prepend('<div class="required-item">' + msg + '</div>').addClass('question-required');
	
					$('html, body').animate({
						scrollTop: $('#' + fieldName + '_container').parent().offset().top - 100
					}, 100);
			}
				
		}
		
	}
	// PRIORITIES SLIDERS
	else{
		
		if( $('#' + fieldName + '_container').find('div.required-item').length){	
		  }
		else {
			if( !($('#' + fieldName + '_container').find('.priority-question').hasClass('question-required')) ){
				$('#' + fieldName + '_container').find('.priority-question').prepend('<div class="required-item">' + msg + '</div>').addClass('question-required');
				$('#' + fieldName + '_container').find('.priority-question label.ui-slider').css('color','#FFFFFF')
					$('html, body').animate({
						scrollTop: $('#' + fieldName + '_container').parent().offset().top - 100
					}, 100);
			}
				
		}
		
	}
		
		
		
		
		
	}


function addSpinner(targetId){
	
		$('<div id="' + targetId + '" class="inform-message spinner-message ui-loader ui-overlay-shadow">Loading<div id="' + targetId +'-spinner" class="spinner-container"></div></div>').appendTo($.mobile.pageContainer);
		
		$('#' + targetId +'-spinner').spin({lines:17,length: 8, width:3,radius:8,trail:80,speed:1.0});	
}
function removeSpinner(targetId){
		
		$('#' + targetId + '').remove();
}


function detectBrowserPrivate(){
	
	
	
		
	
	var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
	if (navigator.userAgent.indexOf('Safari') > -1){
			if(navigator.userAgent.indexOf('Chrome') > -1) {
				var is_chrome = true;
			}
			else{
				var is_safari = true;
			}
	}
	if (navigator.userAgent.indexOf('MSIE') > -1 || navigator.userAgent.indexOf('Trident') > -1) {
		var is_explorer = true;
	}
	
	if(is_chrome){
		$('#guide-incognito-browser-heading').text('Chrome Incognito Browsing');
		$('#guide-incognito-intro').text('It looks like you\'re using the Chrome browser.  Here are a few quick steps to start browsing safely.');
		$('#guide-incognito-step-1').text('The fastest way to enable Incognito Browsing is to press Ctrl + Shift + N.');
		$('#guide-incognito-step-2').text('You can also enable Incognito Browsing by clicking on the Menu icon (top right of Chrome), then selecting New Incognito Window');	
		$('#guide-incognito-step-3').text('Incongito browsing will open in a new window for you.  You can then open your email or iCANPlan4Safety in that window.');
	}
	if(is_explorer){
		$('#guide-incognito-browser-heading').text('IE InPrivate Browsing');
		$('#guide-incognito-intro').text('It looks like you\'re using the Internet Explorer browser.  Here are a few quick steps to start browsing safely.');
		$('#guide-incognito-step-1').text('The fastest way to enable InPrivate Browsing is to press Ctrl + Shift + P.');
		$('#guide-incognito-step-2').text('You can also enable InPrivate Browsing by selecting Tools in the Menu bar of your browser and then selecting InPrivate Browsing');	
		$('#guide-incognito-step-3').text('InPrivate Browsing will open in a new window for you. You can then open your email or iCANPlan4Safety in that window.');
	}
	if(is_firefox){
		$('#guide-incognito-browser-heading').text('Firefox Private Browsing');
		$('#guide-incognito-intro').text('It looks like you\'re using the Firefox browser.  Here are a few quick steps to start browsing safely.');
		$('#guide-incognito-step-1').text('The fastest way to enable Private Browsing is to press Ctrl + Shift + P.');
		$('#guide-incognito-step-2').text('You can also enable Private Browsing by clicking on the Menu icon (top right of Firefox) and then selecting New Private Window');	
		$('#guide-incognito-step-3').text('Private Browsing will open in a new window for you. You can then open your email or iCANPlan4Safety in that window.');
	}
	if(is_safari){
		$('#guide-incognito-browser-heading').text('Safari Private Browsing');
		$('#guide-incognito-intro').text('It looks like you\'re using the Safari browser.  Here are a few quick steps to start browsing safely.');
		$('#guide-incognito-step-1').text('To enable Private Browsing, simply click on the Menu icon (gear icon) in the top right of Safari and then select Private Browsing');
		$('#guide-incognito-step-2').text('You should see a \'Private\' indicator in the URL bar once turned on.');	
		$('#guide-incognito-step-3').hide();
	}
	
	
}


// -----------------------------------------------
// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();