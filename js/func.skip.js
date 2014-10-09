// JavaScript Document
/**
 * This file containts skip logic. 
* Set questions to be displayed based on family history
* Verify percipient meets criteria for study
 */
$(document).ready(function() {
		
		
		// PARTICIPATION
		//-------------------------------------
		$('input[name="COMPUTER"]').live('change',function(){
				if( $(this).val() == 5 ){
					$('#COMPUTEROTH_container').addClass('question-sub-background').show();
				}
				else{
					$('#COMPUTEROTH_container').hide();
					$('input[name="COMPUTEROTH"]').text('');
				}
		});
		
		$('input[name="LOCATION_COMPUTER"]').live('change',function(){
				if( $(this).val() == 6 ){
					$('#LOCATION_COMPUTEROTH_container').addClass('question-sub-background').show();
				}
				else{
					$('#LOCATION_COMPUTEROTH_container').hide();
					$('input[name="LOCATION_COMPUTEROTH"]').text('');
				}
		});
		
		// BACKGROUND
		//-------------------------------------
		$('#POSTCODE').live('keyup',function(){
				var postCodeValue = $('#POSTCODE').val(); 
				if( isNaN(postCodeValue)) {
					$('#POSTCODE').val('');
					inform("Field must be a number only.");
				} 
			
			
		});
		
		$('input[name="RELATIONSHIP"]').live('change',function(){
				if( $(this).val() == 8 ){
					$('#RELATIONSHIP_OTHER_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#RELATIONSHIP_OTHER_SPECIFY_container').hide();
					$('input[name="RELATIONSHIP_OTHER_SPECIFY"]').text('');
				}
		});
		
		
		
		$('input[name="CHILDREN"]').live('change',function(){
				if( $(this).val() ==1 ){
					$('#CHILDREN_LIVE_container,#CHIL_FTPT_container').addClass('question-sub-background').show();
					
				}
				else{
					$('#CHILDREN_LIVE_container,#CHIL_FTPT_containerr').hide();
					$('input[name="CHIL_FTPT"]').prop("checked",false).checkboxradio("refresh");
					$('input[name="CHILDREN_LIVE"]').text('');
				}
		});
		
		$('input[name="EDUCATION_LEVEL"]').live('change',function(){
				if( $(this).val() == 7 ){
					$('#EDUCATION_LEVELOTH_container').addClass('question-sub-background').show();
				}
				else{
					$('#EDUCATION_LEVELOTH_container').hide();
					$('input[name="EDUCATION_LEVELOTH"]').text('');
				}
		});

		$('input[name="EMPLOYED_STATUS"]').live('change',function(){
				//employed
				if( $(this).val() == 1 ){
					$('#EMPLOYED_OCCUPATION_container').addClass('question-sub-background').show();
					$('#UNEMPLOYED_STATUS_container').hide();
					$('input[name="UNEMPLOYED_STATUS"]').prop("checked",false).checkboxradio("refresh");
				}
				//unemployed
				else if( $(this).val() == 3 ){
					$('#UNEMPLOYED_STATUS_container').addClass('question-sub-background').show();
					$('#EMPLOYED_OCCUPATION_container').hide();
					$('input[name="EMPLOYED_OCCUPATION"]').prop("checked",false).checkboxradio("refresh");
				}
				else{
					$('#EMPLOYED_OCCUPATION_container,#UNEMPLOYED_STATUS_container').hide();
					$('input[name="EMPLOYED_OCCUPATION"],input[name="UNEMPLOYED_STATUS"]').prop("checked",false).checkboxradio("refresh");
				}
		});
		
		$('input[name="ABORIG"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#ABORIG_TYPE_container').addClass('question-sub-background').show();
					
				}
				else{
					$('#ABORIG_TYPE_container').hide();
					$('input[name="ABORIG_TYPE"]').prop("checked",false).checkboxradio("refresh");
				}
		});
		
		$('input[name="LANG_SPK"]').live('change',function(){
				if( $(this).val() == 11 ){
					$('#LANG_SPKOTH_container').addClass('question-sub-background').show();
				}
				else{
					$('#LANG_SPKOTH_container').hide();
					$('input[name="LANG_SPKOTH"]').text('');
				}
		});

		$('input[name="AUS_NATIVE"]').live('change',function(){
				if( $(this).val() == 0 ){
					$('#AUS_COUNTRY_SPECIFY_container').addClass('question-sub-background').show();	
				}
				else{
					$('#AUS_COUNTRY_SPECIFY_container').hide();
					$('input[name="AUS_COUNTRY_SPECIFY"]').text('');
				}
		});
		
		$('input[name="LIFE_EVENTS"]').live('change',function(){
				if( $(this).val() == 6 ){
					$('#LIFE_EVENTS_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#LIFE_EVENTS_SPECIFY_container').hide();
					$('input[name="LIFE_EVENTS_SPECIFY"]').text('');
				}
		});
		
		// ACTIVITIES
		$('input[name="WEAVE_ACT_OTHER"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#WEAVE_ACT_OTHER_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#WEAVE_ACT_OTHER_SPECIFY_container').hide();
					$('input[name="WEAVE_ACT_OTHER_SPECIFY"]').text('');
				}
		});	
		
		
		
		// HEALTH SERVICES
		$('select[name="VISITS_OTHER"]').live('change',function(){
				if( $(this).val() > 0 ){
					$('#VISITS_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#VISITS_SPECIFY_container').hide();
					$('input[name="VISITS_SPECIFY"]').text('');
				}
		});	
		
	
		$('input[name="AMB_HELP"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#AMB_HELP_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#AMB_HELP_SPECIFY_container').hide();
					$('input[name="AMB_HELP_SPECIFY"]').text('');
				}
		});	
		
		$('input[name="AMB_TRIP"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#AMB_TRIP_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#AMB_TRIP_SPECIFY_container').hide();
					$('input[name="AMB_TRIP_SPECIFY"]').text('');
				}
		});	
		$('input[name="EMERGENCY"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#EMERGENCY_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#EMERGENCY_SPECIFY_container').hide();
					$('input[name="EMERGENCY_SPECIFY"]').text('');
				}
		});	
		
		$('input[name="OUTPATIENT_PHYS"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#OUTPATIENT_PHYS_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#OUTPATIENT_PHYS_SPECIFY_container').hide();
					$('input[name="OUTPATIENT_PHYS_SPECIFY"]').text('');
				}
		});	
		
		$('input[name="OUTPATIENT_EMO"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#OUTPATIENT_EMO_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#OUTPATIENT_EMO_SPECIFY_container').hide();
					$('input[name="OUTPATIENT_EMO_SPECIFY"]').text('');
				}
		});	
		$('select[name="SERVICE_USE_OTHER"]').live('change',function(){
				if( $(this).val() > 0 ){
					$('#SERVICE_USE_OTHER_SPECIFY_container').addClass('question-sub-background').show();
				}
				else{
					$('#SERVICE_USE_OTHER_SPECIFY_container').hide();
					$('input[name="SERVICE_USE_OTHER_SPECIFY"]').text('');
				}
		});
		
		// DECISION
		$('input[name="REL_INTENT"]').live('change',function(){
				handleRelationshipIntent( $(this).val() );
		});
		
		
		
		
		// DA
		$('input[name="DA3"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#DA3a').parents('div.ui-checkbox').hide();
				}
				else{
					$('#DA3a').parents('div.ui-checkbox').show();
				}
		});
		$('input[name="DA13"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#DA13a').parents('div.ui-checkbox').hide();
				}
				else{
					$('#DA13a').parents('div.ui-checkbox').show();
				}
		});
		$('input[name="DA15"]').live('change',function(){
				if( $(this).val() == 1 ){
					$('#DA15a').parents('div.ui-checkbox').hide();
				}
				else{
					$('#DA15a').parents('div.ui-checkbox').show();
				}
		});
		
});

$(document).on("pagecreate","#SAFETY_LABEL, #SAFETY_8, #SAFETY_16, #SAFETY_24, #SAFETY_32",function(){
 

	$("form input[type=radio]").each(function(){
			var rname = $(this).attr('name');
		
			$('input[name="' + rname + '"]').live('change',function(){
				
					if( $(this).val() == 1 ){
						$('#' + rname + '_HELP_container').addClass('question-sub-background').show();
					}
					else{
						$('#' + rname + '_HELP_container').removeClass('question-sub-background').hide();
						$('input[name="' + rname + '_HELP"]').prop("checked",false).checkboxradio("refresh");
						
					}
			});
		
		});
	


});