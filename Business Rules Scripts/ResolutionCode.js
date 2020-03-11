(function executeRule(current, previous /*null when async*/) {
	
	//Creates "SRType" String to place in ListOfLa311 array
	var StringSR = String(current.srtype);
	
	var words = StringSR.split(" -");
	
	var SRType = words[0];

	var LAendpoint = "https://api-test.lacity.org/v2/myla311_qa/service-requests/" + current.srnumber;
	
	//Creates RESTMessageV2
	var request = new sn_ws.RESTMessageV2('x_428553_bss_sr.Upsert Comment', 'Default POST');

	request.setEndpoint(LAEndpoint);
	
	//Set Headers
	request.setRequestHeader("Content-Type", "Application/json");
	
	//Set Body
	Body = ' {   "UpdatedByUserLogin": "STREETSLAINTEGRATION",' 
		+  '  "ServiceDate": "",'
		+  '  "ResolutionCode": "' + current.resolutioncode + '",'
		+  '  "ListOfLa311 + ' + SRType +'": { '
		+  '     "La311' + SRType + '": [ '
        +  ' {'
        +  '      "ApprovedBy": '  + '"' + current.ApprovedBy + '",'
        +  '      "CompletedBy": ' + '"' + current.CompletedBy + '",'
		+  '      "Crew": "' + current.crew + '", '
		+  '      "Type": "' + SRType + '", '
		+  '      "LastUpdatedBy": "' + current.LastUpdatedBy + '", '
		+  '      "Name": "' + current.name + '" '
		+  '}]'  
        +  '}'
		+  '}';
	
	request.setRequestBody(Body);
	
	request.execute();

})(current, previous);