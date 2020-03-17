	//Creates "SRType" String to place in ListOfLa311 array

	// var StringSR = current.u_service_type;

	//var words = StringSR.split(" -");
	
	// var SRType = words[0];

	var LAendpoint = "https://api-dev.lacity.org/v2/myla311_qa/bssproactive";
	
	//Creates RESTMessageV2
	var request = new sn_ws.RESTMessageV2('x_colac_streets_la.GetMyLA311Tickets', 'Default Post');

	request.setEndpoint(LAEndpoint);
	
	//Set Headers
	request.setRequestHeader("Content-Type", "Application/json");
	
	//Set Body
	var Body = ' {   "ServiceRequest": {' 
		+  '  "AddressVerified": "P",'
		+  '  "SRType": "Weed Abatement",'
		+  '  "IntegrationID": "BSS-APro2",'
		+  '  "CreatedByUserLogin": "STREETSLAINTEGRATION",'
		+  '  "UpdatedUserLogin": "STREETSLAINTEGRATION",'
		+  '  "Source": "Driver Self Report",'
      	+  '  "Owner": "BSS",'
        +  '  "CreatedByUserOrganization": "Proactive Insert,"'
      	+  '  "Owner": "BSS",'
        +  '  "CreatedByUserOrganization": "Proactive Insert,"'
		+  '  "Status": "Open",'
		+  '  "ReasonCode": "NF", '
		+  '  "ServiceDate": "01/08/2020 22:43:00", ' 
		+  '  "SRAddress": "123 Test Street, 91402", '
		+  '  "ListOfLa311NonCompliantVending": { '
		+  '     "La311NonCompliantVending": [{ '
		+  '          "ApprovedBy": "Ross",'
		+  '          "AssignedTo": "Nerses",'
		+  '          "Contact": "", '
		+  '          "ContactDate": "01/08/2020 22:43:00",'
		+  '          "Crew": "Blue",'
		+  '          "InspectedBy": "Narek",'
	    +  '          "InspectionDate": "01/08/2020 22:43:00",'
		+  '          "CompletedBy": "Ross",'
		+  '          "Type": "Non-Compliant Vending", '
		+  '          "LastUpdatedBy": "STREETSLAINTEGRATION" '
		+  '}]'  
                +  '}'
		+  '}}';
	
	request.setRequestBody(Body);
	
	request.execute();
