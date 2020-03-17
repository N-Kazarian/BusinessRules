	// Creates "SRType" String to place in ListOfLa311 array

	// var StringSR = current.u_service_type;

	// var words = StringSR.split(" -");
	
	// var SRType = words[0];

	var LAendpoint = "https://api-dev.lacity.org/v2/myla311_qa/bssproactive";
	
	//Creates RESTMessageV2
	var request = new sn_ws.RESTMessageV2('x_colac_streets_la.GetMyLA311Tickets', 'Default Post');

	request.setEndpoint(LAEndpoint);

	//Set Body
	var Body = ' {   "ServiceRequest": {' 
		+  '  "AddressVerified": "P",'
		+  '  "SRType": "Weed Abatement for Pvt Parcelst",'
		+  '  "IntegrationId": "BSS-APro2",'
		+  '  "CreatedByUserLogin": "STREETSLAINTEGRATION",'
		+  '  "UpdatedByUserLogin": "STREETSLAINTEGRATION",'
		+  '  "Source": "Driver Self Report",'
      	+  '  "Owner": "BSS",'
        +  '  "CreatedByUserOrganization": "Proactive Insert",'
		+  '  "Status": "Open",'
		+  '  "ReasonCode": "NF", '
		+  '  "ServiceDate": "01/08/2020 22:43:00", ' 
		+  '  "SRAddress": "123 Test Street, 91402", '
		+  '  "ListOfLa311WeedAbatementForPrivateParcels": { '
		+  '     "La311WeedAbatementForPrivateParcels": [{ '
		+  '          "AssignedTo": "Nerses",'
		+  '          "Contact": "",'
		+  '          "ContactDate": "01/08/2020 22:43:00",'
		+  '          "Crew": "Blue",'
		+  '          "InspectedBy": "Narek",'
	    +  '          "InspectionDate": "01/08/2020 22:43:00",'
		+  '          "Type": "Weed Abatement",'
		+  '          "LastUpdatedBy": "STREETSLAINTEGRATION" '
		+  '}]}}}';
	
	request.setRequestBody(Body);
	
	request.execute();