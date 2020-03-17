(function executeRule(current, previous /*null when async*/) {
	
	//Creates "SRType" String to place in ListOfLa311 array
	var StringSR = String(current.u_service_type);
	
	var words = StringSR.split(" -");
	
	var SRType = words[0];

	var LAendpoint = "https://api-dev.lacity.org/v2/myla311_qa/bssproactive";
	
	//Creates RESTMessageV2
	var request = new sn_ws.RESTMessageV2('x_428553_bss_sr.Upsert Comment', 'Default POST');

	request.setEndpoint(LAEndpoint);
	
	//Set Headers
	request.setRequestHeader("Content-Type", "Application/json");
	
	//Set Body
	Body = ' {   "ServiceRequest": "STREETSLAINTEGRATION",' 
		+  '  "AddressVerified": "P",'
		+  '  "SRType": "' + current.u_service_type + '",'
		+  '  "IntegrationID": "' + SRType + '",'
		+  '  "CreatedByUserLogin": "STREETSLAINTEGRATION",'
		+  '  "UpdatedUserLogin": "STREETSLAINTEGRATION",'
		+  '  "Source": "Driver Self Report",'
        +  '  "Owner": "BSS",'
        +  '  "CreatedByUserOrganization": "Proactive Insert"'
		+  '  "Status": "Open",'
		+  '  "ReasonCode": "' + current.u_reason_code + '", '
		+  '  "ServiceDate": "' + current.u_service_date + '", ' 
		+  '  "SRAddress": "' + current.u_address + '", '
		+  '  "ListOfLa311' + SRType +'": { '
		+  '     "La311' + SRType + '": [{ '
		+  '          "ApprovedBy": "' + current.u_approvedBy + '",'
		+  '          "Crew": "' + current.u_crew + '",'
		+  '          "Type": "' + SRType + '", '
		+  '          "LastUpdatedBy": "' + current.u_last_updated_by + '", '
		+  '}]'  
        +  '}'
		+  '}}';
	
	request.setRequestBody(Body);
	
	request.execute();

})(current, previous);