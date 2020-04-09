	// Query the Record that is currently being worked on
	var attachment = new GlideRecord('sys_attachment');
	
	attachment.addQuery('table_sys_id',current.table_sys_id);

	attachment.query();	

	// Compose RESTMessage Object
	try {

	var LAendpoint = "https://api-dev.lacity.org/v2/myla311_qa/bssproactive";

	var request = new sn_ws.RESTMessageV2('x_colac_streets_la.GetMyLA311Tickets', 'Default Post');

	request.setEndpoint(LAendpoint);

	// Set Key-Value Parameter through RESTMessage method "setRequestBodyFromAttachment"
	request.setRequestBodyFromAttachment(attachment.sys_id);

	// Set Key-Value Parameters -> Key = ServiceRequest, Value = <SRNumber>
	request.setStringParameterNoEscape('SRNumber', current.srnumber);
	// Set Key-Value Parameters -> Key = CreatedByUser, Value = 'STREETSLAINTEGRATION'
	request.setStringParameterNoEscape('CreatedByUser', 'STREETSLAINTEGRATION');

	var response = request.execute();

	var httpResponseState = response.getStatusCode();

	} catch(ex) {

		var message = ex.getMessage();

		gs.print(message);

	}