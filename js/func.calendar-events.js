// JavaScript Document

function renderDACalendar() {
		/* initialize the external events
		-----------------------------------------------------------------*/
	
		$('#external-events div.level5,#external-events div.level4, #external-events div.level3, #external-events div.level2, #external-events div.level1').each(function() {
		
			// create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
			// it doesn't need to have a start or end
			var eventObject = {
				title: $.trim($(this).text()) // use the element's text as the event title
			};
			
			// store the Event Object in the DOM element so we can get to it later
			$(this).data('eventObject', eventObject);
			
			// make the event draggable using jQuery UI
			$(this).draggable({
				zIndex: 999,
				revert: true,      // will cause the event to go back to its
				revertDuration: 0  //  original position after the drag
			});
			
		});
	
	
		/* initialize the calendar
		-----------------------------------------------------------------*/
		
			$('#calendar').empty().fullCalendar({
				eventSources: [
					{
						url: 'com/getCalendar.php',
						type: 'POST',
						data: { participantId : window.idecideObj.id },
						error: function(){
							inform('There was a problem retrieving your calendar');	
						}
					}
					],
			
			
					 /*dayClick: function(date, allDay, jsEvent, view) {
		
							if (allDay) {
								alert('Clicked on the entire day: ' + date);
							}else{
								alert('Clicked on the slot: ' + date);
							}
					
							alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
					
							alert('Current view: ' + view.name);
					
							// change the day's background color just for fun
							$(this).css('background-color', 'red');
					
						},
					*/
					
					// JC - CLICK TO REMOVE
					eventClick: function(calEvent, jsEvent, view) {	
						 $('#calendar').fullCalendar('removeEvents', calEvent.id); 
						 // JC - getEvents
						 getCalendarEvents()
				
					},
		
					header: {
						left: '',
						center: 'title',
						right: 'prev,next today'
					},
				
					editable: true,
					today: true,
					droppable: true, // this allows things to be dropped onto the calendar !!!
					drop: function(date, allDay) { // this function is called when something is dropped
					
									
					
						// retrieve the dropped element's stored Event Object
						var originalEventObject = $(this).data('eventObject');
						
						// we need to copy it, so that multiple events don't have a reference to the same object
						var copiedEventObject = $.extend({}, originalEventObject);
						
						// assign it the date that was reported
						copiedEventObject.start = date;
						copiedEventObject.allDay = allDay;
						
						// JC - assign the class to the event object, be sure to just get the first class assigned
						var origClass = $(this).attr("class").split(" ")[0]; 
						copiedEventObject.className = origClass;
						copiedEventObject.id =  new Date().getTime();
		
						
						
					
						// render the event on the calendar
						// the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
						$('#calendar').fullCalendar('renderEvent', copiedEventObject, false);
						
						// is the "remove after drop" checkbox checked?
						if ($('#drop-remove').is(':checked')) {
							// if so, remove the element from the "Draggable Events" list
							$(this).remove();
						}
						
						
						// JC - getEvents
						getCalendarEvents()
						
					}
				});
				
			return true;
			
		
}

/*
------------------------------------------------------
RETRIEVE THE EVENTS FROM THE FULLCALENDAR PLUGIN
------------------------------------------------------
*/	
function getCalendarEvents(){
	var da_events = new Array();
	var page_id = 'da_cal';
	var x;
	var obj;
	var eventCount;
	var eventTitle = 'Titles';
	var eventID = 'IDs';
	var eventDate = 'Dates';
	var eventClass = 'Class';
	var da_events_string;
	
	da_events = $('#calendar').fullCalendar( 'clientEvents' );
	$.ajax({
			   	type:"POST",
				url: "com/saveCalendar.php",
				data: { participantId : window.idecideObj.id, events: JSON.stringify(da_events)},
				success: function(data){
						//inform("Event saved");
				}
			  });

}