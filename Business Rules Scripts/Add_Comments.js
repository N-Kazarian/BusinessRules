(function executeRule(current, previous /*null when async*/ ) {

    var r = new sn_ws.RESTMessageV2('x_436948_street_se.Proactive Insert', 'Update POST');
    var sr_number = current.srnumber;
    r.setEndpoint("https://api-test.lacity.org/v2/myla311_qa/service-requests/" + sr_number);

    //unique_integratin_id = current.integrationid;

    /**********************************************************************************************************************************
    	start ---                   							Upsert a Comment
    **********************************************************************************************************************************/
    //the problem with the upsert comment might be that the srnumber is required in the url of the REST Message

    //there are notes, comments, work_notes. Which of them has to change in order to trigger the Business rule?
    r.setHttpMethod("post");
    r.setRequestHeader("Content-Type", "application/json");

    //"\"IntegrationId\": \"" + unique_integration_id + "\"," +

    /*
    	start --- for checking the Journal field type
    */
    //var gr_journal = new GlideRecord('x_436948_street_se_service_request');
    //gr_journal.initialize();
    //gr_journal.addQuery('srnumber', '1-1457212861');
    //gr_journal.query();	
    //if(gr_journal.next()) {
    //	
    //}		
    /*
    	end --- for checking the Journal field type
    */

    if (current.comments != previous.comments) {
        var notes = current.comments.getJournalEntry(-1);
        //gets all journal entries as a string where each entry is delimited by '\n\n'
        var na = notes.split("\n\n");
        var pattern = "(Comments)\n";
        if (na[0].indexOf(pattern) >= 0) {
			var comment = "lkdsf";
            comment = na[0].substr(na[0].indexOf(pattern) + pattern.length, na[0].length);
            //comment = na[0].substr(0, na[0].indexOf(pattern));
        }

        var body_comment = "{" +
            "\"UpdatedByUserLogin\": \"STREETSLAINTEGRATION\"," +
				"\"Comments\": [" +
				"{" +
					"\"Comment\": \"" + comment + "\"," +
					"\"CommentType\": \"Internal\"" +
				"}" +
				"]," +
            "\"ReasonCode\": \"\"" +
            "}";
		
		    r.setRequestBody(body_comment);
			r.setLogLevel('all');
    }

    //if(current.notes != previous.notes) {

    //}

    /**********************************************************************************************************************************
    	end ---                   							    Upsert a Comment
    **********************************************************************************************************************************/


    /**********************************************************************************************************************************
    	start ---				                       			Upsert an Attachment
    **********************************************************************************************************************************/
	
    /**********************************************************************************************************************************
    	end ---                     							Upsert an Attachment
    **********************************************************************************************************************************/





    var response = r.execute();
    var responseBody = response.getBody();
    var httpStatus = response.getStatusCode();
    var responseObj = JSON.parse(responseBody);


})(current, previous);