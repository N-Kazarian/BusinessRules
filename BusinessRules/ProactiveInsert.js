	(function executeRule(current, previous /*null when async*/) {
		var r = new sn_ws.RESTMessageV2('x_436948_street_se.Proactive Insert', 'Default POST');
	r.setEndpoint("https://api-test.lacity.org/v2/myla311_qa/bssproactive");


	var date = new Date();
	var time = date.getTime();
	var unique_integration_id = "BSS-" + time;
		
	r.setHttpMethod("post");
	r.setRequestHeader("Content-Type", "application/json");
	var body =  "{ " +
		   "\"ServiceRequest\": {" +
		   "\"SRType\": \"Street Tree Inspection\","+
		   "\"AddressVerified\": \"P\"," +
		   "\"IntegrationId\": \"" + unique_integration_id + "\"," +
		   "\"CreatedByUserLogin\": \"STREETSLAINTEGRATION\","+
		   "\"UpdatedByUserLogin\": \"STREETSLAINTEGRATION\","+
		   "\"NewContactFirstName\": \"Ross\","+
		   "\"NewContactLastName\": \"Taylor\","+
		   "\"Source\": \"Driver Self Report\","+
		   "\"SRAddress\": \"14410 W SYLVAN ST, 91401\","+
		   "\"Owner\": \"BSS\","+
		   "\"CreatedByUserOrganization\": \"Proactive Insert\","+
		   "\"ResolutionCode\": \"PE\","+
		   "\"ServiceDate\": \"01/08/2020 22:43:00\","+
		   "\"ListOfLa311StreetTreeInspection\": {"+
		   "\"La311StreetTreeInspection\": ["+
				"{"+
					   "\"ApprovedBy\": \"Ross\","+
					   "\"AssignedTo\": \"Ross\","+
					   "\"CompletedBy\": \"Ross\","+
					   "\"Contact\": \"\","+
					   "\"ContactDate\": \"\","+
					   "\"Crew\": \"\","+
					   "\"DateCompleted\": \"\","+
					   "\"InfestedTreeLocation\": \"\","+
					   "\"InspectedBy\": \"Ross\","+
					   "\"InspectionDate\": \"01/08/2020 22:43:00\","+
					   "\"InspectionType\": \"Tree Well\","+
					   "\"OtherTreeWellInspectionType\": \"\","+
					   "\"StumpRemovalLocation\": \"\","+
					   "\"TreePlantingLocation\": \"\","+
					   "\"TreeRemovalReason\": \"\","+
					   "\"TreeStakeInspectionType\": \"\","+
					   "\"TreeWellInspectionType\": \"Install DG\","+
					   "\"Type\": \"Street Tree Inspection\","+
					   "\"TreeRemovalLocation\": \"\","+
					   "\"LastUpdatedBy\": \"STREETSLAINTEGRATION\""+
				"}"+
			  "]"+
		   "},"+
		   "\"ListOfLa311ServiceRequestNotes\": {"+
			   "\"La311ServiceRequestNotes\": ["+
				"{"+
					   "\"Comment\": \"Internal - This SR is created as part of BSS Proactive insert test. Please ignore the email if you received, this is a test Email\","+
					   "\"CreatedByUser\": \"STREETSLAINTEGRATION\"," +
					   "\"CommentType\": \"Internal\"" +
				"}," +
				"{" +
					   "\"Comment\": \"External - This SR is created as part of BSS Proactive insert test. Please ignore the email if you received, this is a test Email\"," +
					   "\"CreatedByUser\": \"STREETSLAINTEGRATION\"," +
					   "\"CommentType\": \"External\"" +
				"}," +
				"{" +
					   "\"Comment\": \"Address Comment  - This SR is created as part of BSS Proactive insert test. Please ignore the email if you received, this is a test Email\"," +
					   "\"CreatedByUser\": \"STREETSLAINTEGRATION\"," +
					   "\"CommentType\": \"Address Comments\"" +
				"}" +
			  "]" +
			"}" +
		"}" +
	"}";

	r.setRequestBody(body);
	r.setLogLevel('all');

	var response = r.execute();
	var responseBody = response.getBody();
	var httpStatus = response.getStatusCode();
	var responseObj = JSON.parse(responseBody);


		
	var update_gr_1 = new GlideRecord('x_436948_street_se_service_request');
	update_gr_1.initialize();
	update_gr_1.addQuery('sys_id', current.sys_id);
	update_gr_1.query();	
	if(update_gr_1.next()) {
		update_gr_1.srnumber = responseObj.Response.ListOfServiceRequest.ServiceRequest[0].SRNumber;
	}	

	update_gr_1.update();	
		
	})(current, previous);