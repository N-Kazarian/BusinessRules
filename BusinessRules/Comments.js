(function executeRule(current, previous /*null when async*/) {
	
	//Query current GlideRecord

	var LAendpoint = "https://api-test.lacity.org/v2/myla311_qa/service-requests/" + current.srnumber;
	
	var request = new sn_ws.RESTMessageV2('x_428553_bss_sr.Upsert Comment', 'Default POST');

	request.setEndpoint(LAEndpoint);
	
	//Set Headers
	request.setRequestHeader("Content-Type", "Application/json");
	
	//Set Body
	Body = ' {   "UpdatedByUserLogin": "",' 
		+  '     "Comments": [            '
        +  ' {' +
        +  '      "Comment": '     + '"' + current.comments + '",';
        +  '      "CommentType": ' + '"' + current.comment_type + '",';
        + '}' 
        + '],' 
        + '"ReasonCode": "",'  
		+ '"ResolutionCode": ""' 
		+ '}';
	
	request.setRequestBody(Body);
	
	request.execute();
	
	
})(current, previous);