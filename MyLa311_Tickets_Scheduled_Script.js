var pageSize = 100;
var startRowNum = 0;
var newQuery = true;
var lastPage = "false";

try {
    // Format date to send as parameters in rest message
    var date = new GlideDateTime();
    var localDate = date.getLocalDate();
    var dateFormatted = localDate.getByFormat("MM/dd/yyyy");

    var time = new GlideDateTime();
    var localTime = time.getLocalTime();
    var timeFormatted = localTime.getByFormat("HH:mm:ss");

    var updatedTill = dateFormatted + " " + timeFormatted;

    time.subtract(300000);
    var subtractedLocalTime = time.getLocalTime();
    var subtractedTimeFormatted = subtractedLocalTime.getByFormat("HH:mm:ss");

    var updatedSince = dateFormatted + " " + subtractedTimeFormatted;
    gs.info("Updated Till = " + updatedTill);
    gs.info("Updated Since = " + updatedSince);

    // Turn off comment upsert business rule
    var br = new GlideRecord('sys_script');
    br.addEncodedQuery('nameSTARTSWITHTrigger Upsert Comment^ORnameSTARTSWITHTrigger Upsert Work Notes');
    br.query();
    while (br.next()) {
        br.active = false;
        br.update();
    }

    var count = 0;
    while (lastPage == "false" && count < 100) {
        // Send rest message and get response
        var r = new sn_ws.RESTMessageV2('x_colac_streets_la.GetMyLA311Tickets', 'Default GET');
        r.setStringParameterNoEscape('updatedSince', updatedSince);
        r.setStringParameterNoEscape('updatedTill', updatedTill);
        r.setStringParameterNoEscape('PageSize', pageSize);
        r.setStringParameterNoEscape('NewQuery', newQuery);
        r.setStringParameterNoEscape('StartRowNum', startRowNum);
        var response = r.execute();
        var responseBody = response.getBody();
        var httpStatus = response.getStatusCode();
        var responseObj = JSON.parse(responseBody);

        // Set parameters after first rest message
        newQuery = false;
        lastPage = responseObj.Response.LastPage;
        startRowNum += 100;

        //    var serviceTypeList = ['Street Sweeping', 'Pothole', 'Sidewalk Repair', 'Gutter Repair', 'Curb Repair', 'General Street Inspection', 'Land/mudslide', 'Flooding', 'Barricade Removal', 'Resurfacing', 'Guard/Warning Rail Maintenance', 'Bus Pad/Landing'];

        if (responseObj.Response.NumOutputObjects != "0") {

            var serviceRequestArrayLength = responseObj.Response.ServiceRequest.length;

            for (var i = 0; i < serviceRequestArrayLength; i++) {

                var gr = new GlideRecord('x_colac_streets_la_service_requests');

                count = count + 1;
                // Query record to see if it already exists
                gr.addQuery('u_service_request_number', responseObj.Response.ServiceRequest[i].SRNumber);
                gr.query();

                // If not found, then create
                if (!gr.next()) {
                    gs.info("RECORD NOT FOUND");

                    // Initialize the gliderecord if not found
                    gr.initialize();

                    //Check if location exists in table and if it does, don't create and just set
                    var lr = new GlideRecord('cmn_location');
                    lr.addQuery('full_name', responseObj.Response.ServiceRequest[i].SRAddress);
                    lr.query();
                    if (!lr.next()) {
                        lr.initialize();
                        lr.full_name = responseObj.Response.ServiceRequest[i].SRAddress;
                        lr.latitude = responseObj.Response.ServiceRequest[i].Latitude;
                        lr.longitude = responseObj.Response.ServiceRequest[i].Longitude;
                        lr.update();
                    }

                    gr.sr_location = lr.getUniqueValue();

                    var serviceType = responseObj.Response.ServiceRequest[i].SRType;

                    gr.u_a = count;
//                 Mapping fields that all SR Tickets inherit
                    gr.u_service_request_number = responseObj.Response.ServiceRequest[i].SRNumber;
                    gr.full_name = responseObj.Response.ServiceRequest[i].SRAddress;
                    gr.u_latitude = responseObj.Response.ServiceRequest[i].Latitude;
                    gr.u_longitude = responseObj.Response.ServiceRequest[i].Longitude;
                    gr.u_service_type = serviceType;
                    gr.sys_created_on = responseObj.Response.ServiceRequest[i].CreatedDate;
                    gr.sys_updated_on = responseObj.Response.ServiceRequest[i].UpdatedDate;
                    gr.sys_created_by = responseObj.Response.ServiceRequest[i].CreatedByUserLogin;
                    gr.sys_updated_by = responseObj.Response.ServiceRequest[i].UpdatedByUserLogin;
                    gr.u_anonymous = responseObj.Response.ServiceRequest[i].Anonymous;
                    gr.u_zipcode = responseObj.Response.ServiceRequest[i].Zipcode;
                    gr.new_contact_first_name = responseObj.Response.ServiceRequest[i].NewContactFirstName;
                    gr.new_contact_last_name = responseObj.Response.ServiceRequest[i].NewContactLastName;
                    gr.new_contact_phone_number = responseObj.Response.ServiceRequest[i].NewContactPhoneNumber;
                    gr.new_contact_email = responseObj.Response.ServiceRequest[i].NewContactEmail;
                    gr.u_language = responseObj.Response.ServiceRequest[i].Language;
                    gr.u_reason_code = responseObj.Response.ServiceRequest[i].ReasonCode;
                    gr.u_service_date = responseObj.Response.ServiceRequest[i].ServiceDate;
                    gr.u_source = responseObj.Response.ServiceRequest[i].Source;
                    gr.u_help_text = responseObj.Response.ServiceRequest[i].HelpText;
                    gr.u_closed_date = responseObj.Response.ServiceRequest[i].ClosedDate;
                    gr.u_resolution_code = responseObj.Response.ServiceRequest[i].ResolutionCode;
                    gr.u_sr_unit_number = responseObj.Response.ServiceRequest[i].SRUnitNumber;
                    gr.u_mobile_os = responseObj.Response.ServiceRequest[i].MobileOS;
                    gr.u_sr_address = responseObj.Response.ServiceRequest[i].SRAddress;
                    gr.u_sr_area_planning_commission = responseObj.Response.ServiceRequest[i].SRAreaPlanningCommission;
                    gr.u_sr_council_district_member = responseObj.Response.ServiceRequest[i].SRCouncilDistrictMember;
                    gr.u_sr_council_district_number = responseObj.Response.ServiceRequest[i].SRCouncilDistrictNumber;
                    gr.u_sr_direction = responseObj.Response.ServiceRequest[i].SRDirection;
                    gr.u_sr_neighborhood_council_id = responseObj.Response.ServiceRequest[i].SRNeighborhoodCouncilId;
                    gr.u_sr_neighborhood_council_name = responseObj.Response.ServiceRequest[i].SRNeighborhoodCouncilName;
                    gr.u_sr_street_name = responseObj.Response.ServiceRequest[i].SRStreetName;
                    gr.u_sr_suffix = responseObj.Response.ServiceRequest[i].SRSuffix;
                    gr.u_sr_table_column = responseObj.Response.ServiceRequest[i].SRTBColumn;
                    gr.u_sr_table_map_grid_page = responseObj.Response.ServiceRequest[i].SRTBMapGridPage;
                    gr.u_sr_table_row = responseObj.Response.ServiceRequest[i].SRTBRow;
                    gr.u_assign_to = responseObj.Response.ServiceRequest[i].AssignTo;
                    gr.u_assignee = responseObj.Response.ServiceRequest[i].Assignee;
                    gr.u_owner = responseObj.Response.ServiceRequest[i].Owner;
                    gr.u_parent_sr_status = responseObj.Response.ServiceRequest[i].ParentSRStatus;
                    gr.u_parent_sr_type = responseObj.Response.ServiceRequest[i].ParentSRType;
                    gr.u_parent_sr_link_date = responseObj.Response.ServiceRequest[i].ParentSRLinkDate;
                    gr.u_parent_sr_link_user = responseObj.Response.ServiceRequest[i].ParentSRLinkUser;
                    gr.u_sr_neighborhood_council_id = responseObj.Response.ServiceRequest[i].SRAreaPlanningCommissionId;
                    gr.u_sr_community_ation_precinct = responseObj.Response.ServiceRequest[i].SRCommunityPoliceStationAPREC;
                    gr.u_sr_community_recinct_number = responseObj.Response.ServiceRequest[i].SRCommunityPoliceStationPREC;
                    gr.u_sr_cross_street = responseObj.Response.ServiceRequest[i].SRCrossStreet;
                    gr.u_sr_house_number = responseObj.Response.ServiceRequest[i].SRHouseNumber;
                    gr.u_sr_intersection_direction = responseObj.Response.ServiceRequest[i].SRIntersectionDirection;
                    gr.u_sr_approximate_address = responseObj.Response.ServiceRequest[i].SRApproximateAddress;
                    // gr.u_la311_created_by_first_name = responseObj.Response.ServiceRequest[i].LA311CreatedByFirstName;
                    gr.u_la311_created_by_last_name = responseObj.Response.ServiceRequest[i].LA311CreatedByLastName;
                    gr.u_la311_updated_by_first_name = responseObj.Response.ServiceRequest[i].LA311UpdatedByFirstName;
                    gr.u_la311_updated_by_last_name = responseObj.Response.ServiceRequest[i].LA311UpdatedByLastName;
                    gr.u_contact_mobil_os = responseObj.Response.ServiceRequest[i].ContactMobilOS;
                    gr.u_created_by_user_organization = responseObj.Response.ServiceRequest[i].CreatedByUserOrganization;
                    gr.u_claim_number = responseObj.Response.ServiceRequest[i].ClaimNum;
                    gr.u_work_order_number = responseObj.Response.ServiceRequest[i].WorkOrderNum;
                    gr.u_has_image = responseObj.Response.ServiceRequest[i].HasImage;
                    gr.u_phone_number_extension = responseObj.Response.ServiceRequest[i].PhoneNumberExtension;
                    gr.u_la311_sr_photo_id = responseObj.Response.ServiceRequest[i].La311SrPhotoId;
					
					gr.insert();
					/*
						Start of GIS 
                    */
//                     if (responseObj.Response.ServiceRequest[i].La311GisLayer.length) {
//                         gr.u_a_call_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].A_Call_No;
//                         gr.u_area = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Area;
//                         gr.u_direction_suffix = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DirectionSuffix;
//                         gr.u_district_abbreviation = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DistrictAbbr;
//                         gr.u_district_name = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DistrictName;
//                         gr.u_district_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DistrictNumber;
//                         gr.u_district_office = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DistrictOffice;
//                         gr.u_fraction = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Fraction;
//                         gr.u_r_call_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].R_Call_No;
//                         gr.u_section_id = responseObj.Response.ServiceRequest[i].La311GisLayer[0].SectionId;
//                         gr.u_street_form = responseObj.Response.ServiceRequest[i].La311GisLayer[0].StreetFrom;
//                         gr.u_street_to = responseObj.Response.ServiceRequest[i].La311GisLayer[0].StreetTo;
//                         gr.u_gis_type = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Type;
//                         gr.u_y_call_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Y_Call_No;
//                         gr.u_community_planning_area = responseObj.Response.ServiceRequest[i].La311GisLayer[0].CommunityPlanningArea;
//                         gr.u_grid_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].GridNumber;
//                         gr.u_street_intersection_1 = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Streetintersection1;
//                         gr.u_street_intersection_2 = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Streetintersection2;
//                         gr.u_pin_drop_latitude = responseObj.Response.ServiceRequest[i].La311GisLayer[0].PinDropLatitude;
//                         gr.u_pin_drop_longitude = responseObj.Response.ServiceRequest[i].La311GisLayer[0].PinDropLongitude;
//                         gr.u_sanitation_district_yard = responseObj.Response.ServiceRequest[i].La311GisLayer[0].SanitationDistrictYard;
//                         gr.u_is_food_waste = responseObj.Response.ServiceRequest[i].La311GisLayer[0].IsFoodWaste;
//                     }
					/*
						End of GIS
					*/

					/*
						Start of Service Request Organization
					*/
// 					if (responseObj.Response.ServiceRequest[i].ServiceRequest_Organization.length) {
// 						gr.u_organization = responseObj.Response.ServiceRequest[i].ServiceRequest_Organization[0].Organization;
// 						gr.u_organization_bu_name = responseObj.Response.ServiceRequest[i].ServiceRequest_Organization[0].OrganizationBUName;
// 						gr.u_is_worked_last = responseObj.Response.ServiceRequest[i].ServiceRequest_Organization[0].IsWorkedLast;
// 					}
					/*
						End of Service Request Organization
					*/



                    //Set source of request
//                    gr.sr_source_of_request = responseObj.Response.ServiceRequest[i].Source;

                    // Set Priority
//                     var responsePriority = responseObj.Response.ServiceRequest[i].Priority;

//                     if (responsePriority == "Normal") {
//                         gr.u_priority = "-500";
//                     } else if (responsePriority == "High") {
//                         gr.u_priority = "-510";
//                     } else if (responsePriority == "Escalated - 1") {
//                         gr.u_priority = "-520";
//                     } else {
//                         gr.u_priority = "-530";
//                     }

                    // Set Status
//                     var responseStatus = responseObj.Response.ServiceRequest[i].Status;

//                     if (responseStatus == "Open") {
//                         gr.u_status = "-600";
//                     } else if (responseStatus == "Pending") {
//                         gr.u_status = "-610";
//                     } else if (responseStatus == "Forward") {
//                         gr.u_status = "-620";
//                     } else if (responseStatus == "Cancelled") {
//                         gr.u_status = "-630";
//                     } else if (responseStatus == "Closed") {
//                         gr.u_status = "-640";
//                     } else {
//                         gr.u_status = "-650";
//                     }


                     // Start of Service Request Notes
//                      var serviceRequestNotesLength = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes.length;

//                         for(var k = 0; k < serviceRequestNotesLength; k++){
                                
//                             // Create a new gliderecord to check to see if comment exists in journal table
//                             var cr = new GlideRecord('sys_journal_field');
                            
//                             var commentType = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].CommentType;
                            
//                             if(commentType == "Address Comments"){
//                                 gr.u_additional_l_on_information = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment;
//                             }
//                             else if (commentType == "External"){
//                                 cr.addQuery('value', responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment);
//                                 cr.addQuery('element_id', gr.u_getUniqueValue());
//                                 cr.query();
//                                 if(!cr.next()){
//                                     gr.u_comments = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment;
//                                 }
//                             }
//                             else if (commentType == "Internal"){
//                                 cr.addQuery('value', responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment);
//                                 cr.addQuery('element_id', gr.u_getUniqueValue());
//                                 cr.query();
//                                 if(!cr.next()){
//                                     gr.u_work_notes = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment;
//                                 }
//                             }
//                     }
                     //End of Service Request Notes


					/*
							start --- Street Sweeping
					*/

                    if (serviceType == "Street Sweeping") {
                        if (responseObj.Response.ServiceRequest[i].La311StreetSweeping.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].ApprovedBy;
                            gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].AssignTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Location;
                            gr.u_other_reason = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].OtherReason;
                            gr.u_reason = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Reason;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Name;
                            gr.empty_array = "false";
                        // }
                        // else {
                        //     gr.empty_array = "true";
                        //     gr.u_insert();
                        }
                    }

					/*
						end --- Street Sweeping
					*/


					/*
						start --- Pothole
					*/
// 					else if (serviceType == "Pothole - Small Asphalt Repair") {
//                         if (responseObj.Response.ServiceRequest[i].La311Pothole.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311Pothole[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311Pothole[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311Pothole[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311Pothole[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311Pothole[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311Pothole[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311Pothole[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311Pothole[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311Pothole[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311Pothole[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311Pothole[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311Pothole[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311Pothole[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311Pothole[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311Pothole[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311Pothole[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311Pothole[0].Name;
//                             gr.empty_array = "false";
//                         // }
//                         // else {
//                         //     gr.empty_array = "true";
//                         //     gr.u_insert();
//                         }
//                     }
					/*
						end --- Pothole
					*/

					/*
						start --- Sidewalk Repair
                    */

//                     else if (serviceType == "Sidewalk Repair") {
//                         if (responseObj.Response.ServiceRequest[i].La311SidewalkRepair.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].InspectionDate;
//                             gr.u_other_problem = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].OtherProblem;
//                             gr.u_problem = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Problem;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ContactLastName;
//                             gr.u_authorized_agent_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].AuthorizedAgentFlag;
//                             gr.u_compliance_verification_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ComplianceVerificationFlag;
//                             gr.u_legal_property_owner_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].LegalPropertyOwnerFlag;
//                             gr.u_non_resident_roperties_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].NonResidentialPropertiesFlag;
//                             gr.u_property_owned_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].PropertyOwnedBy;
//                             gr.u_rebate_program_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].RebateProgramFlag;
//                             gr.u_trustee_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].TrusteeFlag;
//                             gr.u_w9_form_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].W9FormFlag;
//                             gr.u_reimbursement_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ReimbursementFlag;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Name;
//                             gr.empty_array = "false";
//                         // }
//                         // else {
//                         //     gr.empty_array = "true";
//                         //     gr.u_insert();
//                         }
//                     }
					/*
						end --- Sidewalk Repair
					*/


					/*
						start --- Gutter Repair
					*/
//                     else if (serviceType == "Gutter Repair") {
//                         if (responseObj.Response.ServiceRequest[i].La311GutterRepair.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].ApprovedBy;
//                             gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].AssignTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].InspectionDate;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].Name;
//                             gr.u_gutter_repair = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].GutterType;
//                             gr.u_gutter_problem = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].GutterProblem;
//                             gr.empty_array = "false";
//                         // }
//                         // else {
//                         //     gr.empty_array = "true";
//                         //     gr.u_insert();
//                         }
//                     }
					/*
						end --- Gutter Repair
					*/

					/*
						start --- Curb Repair
					*/
//                     else if (serviceType == "Curb Repair") {
//                         if (responseObj.Response.ServiceRequest[i].La311CurbRepair.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].ApprovedBy;
//                             gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].AssignTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].Crew;
//                             gr.u_curb_problem = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].CurbProblem;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].InspectionDate;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].Name;
//                             gr.empty_array = "false";
//                         // }
//                         // else {
//                         //     gr.empty_array = "true";
//                         //     gr.u_insert();
//                         }
//                     }
					/*
						end --- Curb Repair
					*/

					/*
						start --- General Street Inspection
					*/
//                     else if (serviceType == "General Street Inspection") {
//                         if (responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection.length) {
//                             gr.u_access_ramp_problem = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].AccessRampProblem;
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].ApprovedBy;
//                             gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].AssignTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].InspectionDate;
//                             gr.u_metal_plate_location = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].MetalPlateLocation;
//                             gr.u_oil_spill_location = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].OilSpillLocation;
//                             gr.u_other_inspection = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].OtherInspection;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].Type;
//                             gr.u_water_blowout_location = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].WaterBlowoutLocation;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].Name;
//                             gr.empty_array = "false";
//                         // }
//                         // else {
//                         //     gr.empty_array = "true";
//                         //     gr.u_insert();
//                         }
//                     }
// 					/*
// 						end --- General Street Inspection
// 					*/


// 					/*
// 							start --- Land/Mudslide
// 						*/

//                     else if (serviceType == "Land/Mud Slide") {
//                         if (responseObj.Response.ServiceRequest[i].La311LandMudSlide.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].ApprovedBy;
//                             gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].AssignTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Location;
//                             gr.u_other_location = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].OtherLocation;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].ContactLastName;
//                             gr.u_road_passable_flag = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].RoadPassableFlag;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Name;
//                             gr.empty_array = "false";
//                         // }
//                         // else {
//                         //     gr.empty_array = "true";
//                         //     gr.u_insert();
//                         }
//                     }
// 					/*
// 							end --- Land/Mudslide
// 						*/



// 					/*
// 						start --- Flooding
// 					*/
//                     else if (serviceType == "Flooding") {
//                         if (responseObj.Response.ServiceRequest[i].La311Flooding.length) {
//                         gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311Flooding[0].ApprovedBy;
//                         gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311Flooding[0].AssignTo;
//                         gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311Flooding[0].CompletedBy;
//                         gr.u_contact = responseObj.Response.ServiceRequest[i].La311Flooding[0].Contact;
//                         gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311Flooding[0].ContactDate;
//                         gr.u_crew = responseObj.Response.ServiceRequest[i].La311Flooding[0].Crew;
//                         gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311Flooding[0].DateCompleted;
//                         gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311Flooding[0].InspectedBy;
//                         gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311Flooding[0].InspectionDate;
//                         gr.u_location_type = responseObj.Response.ServiceRequest[i].La311Flooding[0].Location;
//                         gr.u_type = responseObj.Response.ServiceRequest[i].La311Flooding[0].Type;
//                         gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311Flooding[0].LastUpdatedBy;
//                         gr.u_purpose_of_service_request = responseObj.Response.ServiceRequest[i].La311Flooding[0].PurposeOfSR;
//                         gr.u_division_name = responseObj.Response.ServiceRequest[i].La311Flooding[0].DivisionName;
//                         gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311Flooding[0].ContactFirstName;
//                         gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311Flooding[0].ContactLastName;
//                         gr.u_service_date_rendered = responseObj.Response.ServiceRequest[i].La311Flooding[0].ServiceDateRendered;
//                         gr.u_work_referral_date = responseObj.Response.ServiceRequest[i].La311Flooding[0].WorkReferralDate;
//                         gr.u_name = responseObj.Response.ServiceRequest[i].La311Flooding[0].Name;
//                         gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Flooding
// 					*/

// 					/*
// 						start --- Barricade Removal
// 						Barricade Removal has no Additional fields
// 					*/
//                     else if (serviceType == "Barricade Removal") {
//                         // gr.u_ = responseObj.Response.ServiceRequest[i].La311BarricadeRemoval[0].;				
//                     }
// 					/*
// 						end --- Barricade Removal
// 					*/


// 					/*
// 						start --- Guard Warning Rail Maintenance
// 					*/
//                     else if (serviceType == "Guard Warning Rail Maintenance") {
//                         if (responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].InspectionDate;
//                             gr.u_request_type = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].RequestType;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Guard Warning Rail Maintenance
// 					*/

// 					/*
// 						start --- Bus Pad Landing
// 					*/
//                     else if (serviceType == "Bus Pad Landing") {
//                         if (responseObj.Response.ServiceRequest[i].La311BusPadLanding.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].InspectionDate;
//                             gr.u_install_or_repair = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].InstallorRepair;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Bus Pad Landing
// 					*/

// 					/* 
// 						start --- Tree Emergency
// 					*/
//                     else if (serviceType == "Tree Emergency") {
//                         if (responseObj.Response.ServiceRequest[i].La311TreeEmergency.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].DateCompleted;
//                             gr.u_emergency_type = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].EmergencyType;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Location;
//                             gr.u_other_location = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].OtherLocation;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].DivisionName;
//                             gr.u_device_id = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].DeviceId;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Tree Emergency
// 					*/

// 					/*
// 						start --- Bees or Beehive
// 					*/
//                     else if (serviceType == "Bees or Beehive") {
//                         if (responseObj.Response.ServiceRequest[i].La311BeesOrBeehive.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Name;
//       //                      gr.empty_array = "false";
//                         }
//                     }


// 					/*
// 						end --- Bees or Beehive
// 					*/


// 					/*
// 						start --- Tree Obstruction
// 					*/
//                     else if (serviceType == "Tree Obstruction") {
//                         if (responseObj.Response.ServiceRequest[i].La311TreeObstruction.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].InspectionDate;
//                             gr.u_obstruction_location = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ObstructionLocation;
//                             gr.u_obstruction_problem = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ObstructionProblem;
//                             gr.u_other_problem = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].OtherProblem;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Tree Obstruction
// 					*/


// 					/*
// 						start --- Street Tree Inspection
// 					*/
//                     else if (serviceType == "Street Tree Inspection") {
//                         if (responseObj.Response.ServiceRequest[i].La311StreetTreeInspection.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].DateCompleted;
//                             gr.u_infested_tree_location = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].InfestedTreeLocation;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].InspectionDate;
//                             gr.u_inspection_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].InspectionType;
//                             gr.u_other_tree_w_nspection_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].OtherTreeWellInspectionType;
//                             gr.u_stump_removal_location = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].StumpRemovalLocation;
//                             gr.u_tree_planting_location = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreePlantingLocation;
//                             gr.u_tree_stake_inspection_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreeStakeInspectionType;
//                             gr.u_tree_removal_reason = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreeRemovalReason;
//                             gr.u_tree_removal_location = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreeRemovalLocation;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].Type;
//                             gr.u_tree_well_inspection_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreeWellInspectionType;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Street Tree Inspection
// 					*/

// 					/*
// 						start --- Median Island Maintenance
// 					*/
//                     else if (serviceType == "Median Island Maintenance") {
//                         if (responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].InspectionDate;
//                             gr.u_problem_type = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ProblemType;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Median Island Maintenance
// 					*/

// 					/*
// 						start --- Tree Permit
// 					*/
//                     else if (serviceType == "Tree Permits") {
//                         if (responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311TreePermits[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311TreePermits[0].AssignedTo;
//                             gr.u_city = responseObj.Response.ServiceRequest[i].La311TreePermits[0].City;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311TreePermits[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311TreePermits[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311TreePermits[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311TreePermits[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311TreePermits[0].InspectionDate;
//                             gr.u_is_address_same = responseObj.Response.ServiceRequest[i].La311TreePermits[0].IsAddrSame;
//                             gr.u_is_authorized = responseObj.Response.ServiceRequest[i].La311TreePermits[0].IsAuthorized;
//                             gr.u_is_form_needed = responseObj.Response.ServiceRequest[i].La311TreePermits[0].IsFormNeeded;
//                             gr.u_mailing_address = responseObj.Response.ServiceRequest[i].La311TreePermits[0].MailingAddress;
//                             gr.u_name_of_company = responseObj.Response.ServiceRequest[i].La311TreePermits[0].NameofCompany;
//                             gr.u_number_of_oak_trees = responseObj.Response.ServiceRequest[i].La311TreePermits[0].NoofOakTrees;
//                             gr.u_number_of_other_trees = responseObj.Response.ServiceRequest[i].La311TreePermits[0].NoofOtherTrees;
//                             gr.u_number_of_palm_trees = responseObj.Response.ServiceRequest[i].La311TreePermits[0].NoofPalmTrees;
//                             gr.u_permit_type = responseObj.Response.ServiceRequest[i].La311TreePermits[0].PermitType;
//                             gr.u_property_owner_contact = responseObj.Response.ServiceRequest[i].La311TreePermits[0].PropertyOwnerContact;
//                             gr.u_property_owner_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].PropertyOwnerName;
//                             gr.u_quantity = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Quantity;
//                             gr.u_representative_title = responseObj.Response.ServiceRequest[i].La311TreePermits[0].RepresentativeTitle;
//                             gr.u_state = responseObj.Response.ServiceRequest[i].La311TreePermits[0].State;
//                             gr.u_tree_location = responseObj.Response.ServiceRequest[i].La311TreePermits[0].TreeLocation;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Type;
//                             gr.u_zipcode = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Zipcode;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311TreePermits[0].LastUpdatedBy;
//                             gr.u_disclaimer_acceptance = responseObj.Response.ServiceRequest[i].La311TreePermits[0].DisclaimerAcceptence;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311TreePermits[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Tree Permit
// 					*/


// 					/*
// 						start --- Street Tree Violations
// 					*/
//                     else if (serviceType == "Street Tree Violations") {
//                         if (responseObj.Response.ServiceRequest[i].La311StreetTreeViolations.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].InspectionDate;
//                             gr.u_street_tree_type = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].StreetTreeType;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].Type;
//                             gr.u_violation_type = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ViolationType;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Street Tree Violations
// 					*/

// 					/*
// 						start --- Overgrown Vegetation/Plants
// 					*/
//                     else if (serviceType == "Overgrown Vegetation/Plants") {
//                         if (responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Overgrown Vegetation/Plants
// 					*/


// 					/*
// 						start --- Weed Abatement for Private Parcels
// 					*/
//                     else if (serviceType == "Weed Abatement for Private Parcels") {
//                         if (responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].InspectionDate;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Weed Abatement for Private Parcels
// 					*/


// 					/*
// 						start --- Palm Fronds Down
// 					*/
//                     else if (serviceType == "Palm Fronds Down") {
//                         if (responseObj.Response.ServiceRequest[i].La311PalmFrondsDown.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Location;
//                             gr.u_other_location = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].OtherLocation;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Palm Fronds Down
// 					*/


// 					/*
// 						start --- Obstructions
// 					*/
//                     else if (serviceType == "Obstructions") {
//                         if (responseObj.Response.ServiceRequest[i].La311Obstructions.length) {
//                             gr.u_collection_day = responseObj.Response.ServiceRequest[i].La311Obstructions[0].CollectionDay;
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311Obstructions[0].AssignedTo;
//                             gr.u_closer_item = responseObj.Response.ServiceRequest[i].La311Obstructions[0].CloserItem;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311Obstructions[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Contact;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311Obstructions[0].DateCompleted;
//                             gr.u_illegal_lane_closure_hours = responseObj.Response.ServiceRequest[i].La311Obstructions[0].IllegalLaneClosureHours;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311Obstructions[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311Obstructions[0].InspectionDate;
//                             gr.u_obstructions_location = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ObstructionsLocation;
//                             gr.u_obstructions_type = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ObstructionsType;
//                             gr.u_other = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Other;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Type;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ContactDate;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311Obstructions[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311Obstructions[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311Obstructions[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Obstructions
// 					*/


// 					/*
// 						start --- Illegal Sign Removal
// 					*/
//                     else if (serviceType == "Illegal Sign Removal") {
//                         if (responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Location;
//                             gr.u_sign_type = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].SignType;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Type;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ContactDate;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ContactLastName;
//                             gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].OtherObstruction;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Illegal Sign Removal
// 					*/



// 					/*
// 						start --- Illegal Construction Fence
// 					*/
//                     else if (serviceType == "Illegal Construction Fence") {
//                         if (responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].ContactLastName;
//                             gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].OtherObstruction;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Illegal Construction Fence
// 					*/



// 					/*
// 						start --- Illegal Discharge of Water
// 					*/
//                     else if (serviceType == "Illegal Discharge of Water") {
//                         if (responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].ContactLastName;
//                             gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].OtherObstruction;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Illegal Discharge of Water
// 					*/



// 					/*
// 						start --- Illegal Construction
// 					*/
//                     else if (serviceType == "Illegal Construction") {
//                         if (responseObj.Response.ServiceRequest[i].La311IllegalConstruction.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].ContactLastName;
//                             gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].OtherObstruction;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Illegal Construction
// 					*/


// 					/*
// 						start --- Illegal Excavation
// 					*/
//                     else if (serviceType == "Illegal Excavation") {
//                         if (responseObj.Response.ServiceRequest[i].La311IllegalExcavation.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].ContactLastName;
//                             gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].OtherObstruction;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Illegal Excavation
// 					*/

// 					/*
// 						start --- Illegal Auto Repair
// 					*/
//                     else if (serviceType == "Illegal Auto Repair") {
//                         if (responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].ContactLastName;
//                             gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].OtherObstruction;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- Illegal Auto Repair
// 					*/


//                     //Non-Complaint Vending for both Food and Merchandise do not take in any fields from the myLA311 get request 
// 					/*
// 						start --- Non-Complaint Vending
					
// 					else if (serviceType == "Non-Complaint Vending") {
// 						gr.u_ = responseObj.Response.ServiceRequest[i].La311IllegalVending[0].;
// 					}
					
// 						end --- Non-Complaint Vending
// 					*/


// 					/*
// 						start --- News Rack Violation
// 					*/
//                     else if (serviceType == "News Rack Violation") {
//                         if (responseObj.Response.ServiceRequest[i].La311NewsRackViolation.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].InspectionDate;
//                             gr.u_other_type = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].OtherType;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Type;
//                             gr.u_violation_type = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ViolationType;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ContactLastName;
//                             gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].OtherObstruction;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
// 					/*
// 						end --- News Rack Violation
// 					*/

// 					/*
// 						start --- Tables and Chairs Obstructing
// 					*/
//                     else if (serviceType == "Tables and Chairs Obstructing") {
//                         if (responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing.length) {
//                             gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].ApprovedBy;
//                             gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].AssignedTo;
//                             gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].CompletedBy;
//                             gr.u_contact = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Contact;
//                             gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].ContactDate;
//                             gr.u_crew = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Crew;
//                             gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].DateCompleted;
//                             gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].InspectedBy;
//                             gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].InspectionDate;
//                             gr.u_location_type = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Location;
//                             gr.u_type = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Type;
//                             gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].LastUpdatedBy;
//                             gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].OptionalTrackingCode;
//                             gr.u_division_name = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].DivisionName;
//                             gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].ContactFirstName;
//                             gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].ContactLastName;
//                             gr.u_name = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Name;
//                             gr.empty_array = "false";
//                         }
//                     }
					/*
						end --- Tables and Chairs Obstructing
					*/

					/*
						start --- Leaf Blower Violation
					*/
                    else if (serviceType == "Leaf Blower Violation") {
                        if (responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					
					/*
						end --- Leaf Blower Violation
					*/



                    // Illegal Dumping has its own array "La311IllegalDumpingInProgress" as seen in the get Request from the myLA311 test api
                    // But "Illegal" dumping is classified as an "Obstruction" thus is appended to the "La311Obstructions" array and not the intended "La311IllegalDumpingInProgress"
					/*
						start --- Illegal Dumping in Progress
					
					else if (serviceType == "Leaf Blower Violation") {
						gr.u_ = responseObj.Response.ServiceRequest[i].La311IllegalDumpingInProgress[0].;
					}
					
						end --- Illegal Dumping in Progress
					*/

                    // Insert record
                    if(!gr.empty_array) {
                        gr.insert();
                    }
                    else {
                        gr.empty_array = "true";
                        gr.insert();
                    }

                }
                else {
                    var serviceType = responseObj.Response.ServiceRequest[i].SRType;

                    // Mapping fields that all SR Tickets inherit
                    gr.u_service_request_number = responseObj.Response.ServiceRequest[i].SRNumber;
                    gr.u_full_name = responseObj.Response.ServiceRequest[i].SRAddress;
                    gr.u_latitude = responseObj.Response.ServiceRequest[i].Latitude;
                    gr.u_longitude = responseObj.Response.ServiceRequest[i].Longitude;
                    gr.u_service_type = serviceType;
                    gr.sys_created_on = responseObj.Response.ServiceRequest[i].CreatedDate;
                    gr.sys_updated_on = responseObj.Response.ServiceRequest[i].UpdatedDate;
                    gr.sys_created_by = responseObj.Response.ServiceRequest[i].CreatedByUserLogin;
                    gr.sys_updated_by = responseObj.Response.ServiceRequest[i].UpdatedByUserLogin;
                    gr.u_anonymous = responseObj.Response.ServiceRequest[i].Anonymous;
                    gr.u_zipcode = responseObj.Response.ServiceRequest[i].Zipcode;
                    gr.u_new_contact_first_name = responseObj.Response.ServiceRequest[i].NewContactFirstName;
                    gr.u_new_contact_last_name = responseObj.Response.ServiceRequest[i].NewContactLastName;
                    gr.u_new_contact_phone_number = responseObj.Response.ServiceRequest[i].NewContactPhoneNumber;
                    gr.u_new_contact_email = responseObj.Response.ServiceRequest[i].NewContactEmail;
                    gr.u_language = responseObj.Response.ServiceRequest[i].Language;
                    gr.u_reason_code = responseObj.Response.ServiceRequest[i].ReasonCode;
                    gr.u_service_date = responseObj.Response.ServiceRequest[i].ServiceDate;
                    gr.u_source = responseObj.Response.ServiceRequest[i].Source;
                    gr.u_help_text = responseObj.Response.ServiceRequest[i].HelpText;
                    gr.u_closed_date = responseObj.Response.ServiceRequest[i].ClosedDate;
                    gr.u_resolution_code = responseObj.Response.ServiceRequest[i].ResolutionCode;
                    gr.u_sr_unit_number = responseObj.Response.ServiceRequest[i].SRUnitNumber;
                    gr.u_mobile_os = responseObj.Response.ServiceRequest[i].MobileOS;
                    gr.u_sr_address = responseObj.Response.ServiceRequest[i].SRAddress;
                    gr.u_sr_area_planning_commission = responseObj.Response.ServiceRequest[i].SRAreaPlanningCommission;
                    gr.u_sr_council_district_member = responseObj.Response.ServiceRequest[i].SRCouncilDistrictMember;
                    gr.u_sr_council_district_number = responseObj.Response.ServiceRequest[i].SRCouncilDistrictNumber;
                    gr.u_sr_direction = responseObj.Response.ServiceRequest[i].SRDirection;
                    gr.u_sr_neighborhood_council_id = responseObj.Response.ServiceRequest[i].SRNeighborhoodCouncilId;
                    gr.u_sr_neighborhood_council_name = responseObj.Response.ServiceRequest[i].SRNeighborhoodCouncilName;
                    gr.u_sr_street_name = responseObj.Response.ServiceRequest[i].SRStreetName;
                    gr.u_sr_suffix = responseObj.Response.ServiceRequest[i].SRSuffix;
                    gr.u_sr_table_column = responseObj.Response.ServiceRequest[i].SRTBColumn;
                    gr.u_sr_table_map_grid_page = responseObj.Response.ServiceRequest[i].SRTBMapGridPage;
                    gr.u_sr_table_row = responseObj.Response.ServiceRequest[i].SRTBRow;
                    gr.u_assign_to = responseObj.Response.ServiceRequest[i].AssignTo;
                    gr.u_assignee = responseObj.Response.ServiceRequest[i].Assignee;
                    gr.u_owner = responseObj.Response.ServiceRequest[i].Owner;
                    gr.u_parent_sr_status = responseObj.Response.ServiceRequest[i].ParentSRStatus;
                    gr.u_parent_sr_type = responseObj.Response.ServiceRequest[i].ParentSRType;
                    gr.u_parent_sr_link_date = responseObj.Response.ServiceRequest[i].ParentSRLinkDate;
                    gr.u_parent_sr_link_user = responseObj.Response.ServiceRequest[i].ParentSRLinkUser;
                    gr.u_sr_area_planning_commission_id = responseObj.Response.ServiceRequest[i].SRAreaPlanningCommissionId;
                    gr.u_sr_community_ation_precinct = responseObj.Response.ServiceRequest[i].SRCommunityPoliceStationAPREC;
                    gr.u_sr_community_recinct_number = responseObj.Response.ServiceRequest[i].SRCommunityPoliceStationPREC;
                    gr.u_sr_cross_street = responseObj.Response.ServiceRequest[i].SRCrossStreet;
                    gr.u_sr_house_number = responseObj.Response.ServiceRequest[i].SRHouseNumber;
                    gr.u_sr_intersection_direction = responseObj.Response.ServiceRequest[i].SRIntersectionDirection;
                    gr.u_sr_approximate_address = responseObj.Response.ServiceRequest[i].SRApproximateAddress;
                    gr.u_la311_created_by_first_name = responseObj.Response.ServiceRequest[i].LA311CreatedByFirstName;
                    gr.u_la311_created_by_last_name = responseObj.Response.ServiceRequest[i].LA311CreatedByLastName;
                    gr.u_la311_updated_by_first_name = responseObj.Response.ServiceRequest[i].LA311UpdatedByFirstName;
                    gr.u_la311_updated_by_last_name = responseObj.Response.ServiceRequest[i].LA311UpdatedByLastName;
                    gr.u_contact_mobil_os = responseObj.Response.ServiceRequest[i].ContactMobilOS;
                    gr.u_created_by_user_organization = responseObj.Response.ServiceRequest[i].CreatedByUserOrganization;
                    gr.u_claim_number = responseObj.Response.ServiceRequest[i].ClaimNum;
                    gr.u_work_order_number = responseObj.Response.ServiceRequest[i].WorkOrderNum;
                    gr.u_has_image = responseObj.Response.ServiceRequest[i].HasImage;
                    gr.u_phone_number_extension = responseObj.Response.ServiceRequest[i].PhoneNumberExtension;
                    //gr.u_la311_sr_photo_id = responseObj.Response.ServiceRequest[i].La311SrPhotoId;


					/*
						Start of GIS 
                    */
                   if (responseObj.Response.ServiceRequest[i].La311GisLayer.length) {
						gr.u_a_call_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].A_Call_No;
						gr.u_area = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Area;
						gr.u_direction_suffix = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DirectionSuffix;
						gr.u_district_abbreviation = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DistrictAbbr;
						gr.u_district_name = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DistrictName;
						gr.u_district_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DistrictNumber;
						gr.u_district_office = responseObj.Response.ServiceRequest[i].La311GisLayer[0].DistrictOffice;
						gr.u_fraction = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Fraction;
						gr.u_r_call_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].R_Call_No;
						gr.u_section_id = responseObj.Response.ServiceRequest[i].La311GisLayer[0].SectionId;
						gr.u_street_form = responseObj.Response.ServiceRequest[i].La311GisLayer[0].StreetFrom;
						gr.u_street_to = responseObj.Response.ServiceRequest[i].La311GisLayer[0].StreetTo;
						gr.u_gis_type = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Type;
						gr.u_y_call_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Y_Call_No;
						gr.u_community_planning_area = responseObj.Response.ServiceRequest[i].La311GisLayer[0].CommunityPlanningArea;
						gr.u_grid_number = responseObj.Response.ServiceRequest[i].La311GisLayer[0].GridNumber;
						gr.u_street_intersection_1 = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Streetintersection1;
						gr.u_street_intersection_2 = responseObj.Response.ServiceRequest[i].La311GisLayer[0].Streetintersection2;
						gr.u_pin_drop_latitude = responseObj.Response.ServiceRequest[i].La311GisLayer[0].PinDropLatitude;
						gr.u_pin_drop_longitude = responseObj.Response.ServiceRequest[i].La311GisLayer[0].PinDropLongitude;
						gr.u_sanitation_district_yard = responseObj.Response.ServiceRequest[i].La311GisLayer[0].SanitationDistrictYard;
						gr.u_is_food_waste = responseObj.Response.ServiceRequest[i].La311GisLayer[0].IsFoodWaste;
                     }
                /*
                    End of GIS
                */

					/*
						Start of Service Request Organization
					*/
// 					if (responseObj.Response.ServiceRequest[i].ServiceRequest_Organization.length) {
// 						gr.u_organization = responseObj.Response.ServiceRequest[i].ServiceRequest_Organization[0].Organization;
// 						gr.u_organization_bu_name = responseObj.Response.ServiceRequest[i].ServiceRequest_Organization[0].OrganizationBUName;
// 						gr.u_is_worked_last = responseObj.Response.ServiceRequest[i].ServiceRequest_Organization[0].IsWorkedLast;
// 					    }					
					/*
						End of Service Request Organization
					*/



                    //Set source of request
                    gr.sr_source_of_request = responseObj.Response.ServiceRequest[i].Source;

                    // Set Priority
                    var responsePriority = responseObj.Response.ServiceRequest[i].Priority;

                    if (responsePriority == "Normal") {
                        gr.u_priority = "-500";
                    } else if (responsePriority == "High") {
                        gr.u_priority = "-510";
                    } else if (responsePriority == "Escalated - 1") {
                        gr.u_priority = "-520";
                    } else {
                        gr.u_priority = "-530";
                    }

                    // Set Status
                    var responseStatus = responseObj.Response.ServiceRequest[i].Status;

                    if (responseStatus == "Open") {
                        gr.u_status = "-600";
                    } else if (responseStatus == "Pending") {
                        gr.u_status = "-610";
                    } else if (responseStatus == "Forward") {
                        gr.u_status = "-620";
                    } else if (responseStatus == "Cancelled") {
                        gr.u_status = "-630";
                    } else if (responseStatus == "Closed") {
                        gr.u_status = "-640";
                    } else {
                        gr.u_status = "-650";
                    }


                    // var serviceRequestNotesLength = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes.length;

                    // if (serviceRequestNotesLength > 0) {

                    //     for (var notes = 0; notes < serviceRequestNotesLength; notes++) {

                    //         commentType = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[notes].CommentType;

                    //         if (commentType == "Address Comments") {
                    //             gr.u_additional_l_on_information = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[notes].Comment;
                    //         }
                    //         else if (commentType == "External") {
                    //             gr.u_comments = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[notes].Comment;
                    //         }
                    //         else if (commentType == "Internal") {
                    //             gr.u_work_notes = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[notes].Comment;
                    //         }
                    //     }
                    // }


                      // Start of Service Request Notes
                      var serviceRequestNotesLength = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes.length;

                      if (serviceRequestNotesArrayLength) {
 
                         for(var k = 0; k < serviceRequestNotesLength; k++){
                                 
                             // Create a new gliderecord to check to see if comment exists in journal table
                             var cr = new GlideRecord('sys_journal_field');
                             
                             var commentType = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].CommentType;
                             
                             if(commentType == "Address Comments"){
                                 gr.u_additional_l_on_information = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment;
                             }
                             else if (commentType == "External"){
                                 cr.addQuery('value', responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment);
                                 cr.addQuery('element_id', gr.u_getUniqueValue());
                                 cr.query();
                                 if(!cr.next()){
                                     gr.u_comments = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment;
                                 }
                             }
                             else if (commentType == "Internal"){
                                 cr.addQuery('value', responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment);
                                 cr.addQuery('element_id', gr.u_getUniqueValue());
                                 cr.query();
                                 if(!cr.next()){
                                     gr.u_work_notes = responseObj.Response.ServiceRequest[i].La311ServiceRequestNotes[k].Comment;
                                 }
                             }
                         }
                     }
                      //End of Service Request Notes


					/*
							start --- Street Sweeping
					*/

                    if (serviceType == "Street Sweeping") {
                        if (responseObj.Response.ServiceRequest[i].La311StreetSweeping.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].ApprovedBy;
                            gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].AssignTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Location;
                            gr.u_other_reason = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].OtherReason;
                            gr.u_reason = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Reason;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311StreetSweeping[0].Name;
                            gr.empty_array = "false";
                        // }
                        // else {
                        //     gr.empty_array = "true";
                        //     gr.u_insert();
                        }
                    }

					/*
						end --- Street Sweeping
					*/


					/*
						start --- Pothole
					*/
                    else if (serviceType == "Pothole - Small Asphalt Repair") {
                        if (responseObj.Response.ServiceRequest[i].La311Pothole.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311Pothole[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311Pothole[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311Pothole[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311Pothole[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311Pothole[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311Pothole[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311Pothole[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311Pothole[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311Pothole[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311Pothole[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311Pothole[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311Pothole[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311Pothole[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311Pothole[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311Pothole[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311Pothole[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311Pothole[0].Name;
                            gr.empty_array = "false";
                        // }
                        // else {
                        //     gr.empty_array = "true";
                        //     gr.u_insert();
                        }
                    }
					/*
						end --- Pothole
					*/

					/*
						start --- Sidewalk Repair
                    */

                    else if (serviceType == "Sidewalk Repair") {
                        if (responseObj.Response.ServiceRequest[i].La311SidewalkRepair.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].InspectionDate;
                            gr.u_other_problem = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].OtherProblem;
                            gr.u_problem = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Problem;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ContactLastName;
                            gr.u_authorized_agent_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].AuthorizedAgentFlag;
                            gr.u_compliance_verification_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ComplianceVerificationFlag;
                            gr.u_legal_property_owner_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].LegalPropertyOwnerFlag;
                            gr.u_non_resident_roperties_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].NonResidentialPropertiesFlag;
                            gr.u_property_owned_by = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].PropertyOwnedBy;
                            gr.u_rebate_program_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].RebateProgramFlag;
                            gr.u_trustee_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].TrusteeFlag;
                            gr.u_w9_form_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].W9FormFlag;
                            gr.u_reimbursement_flag = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].ReimbursementFlag;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311SidewalkRepair[0].Name;
                            gr.empty_array = "false";
                        // }
                        // else {
                        //     gr.empty_array = "true";
                        //     gr.u_insert();
                        }
                    }
					/*
						end --- Sidewalk Repair
					*/


					/*
						start --- Gutter Repair
					*/
                    else if (serviceType == "Gutter Repair") {
                        if (responseObj.Response.ServiceRequest[i].La311GutterRepair.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].ApprovedBy;
                            gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].AssignTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].InspectionDate;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].Name;
                            gr.u_gutter_repair = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].GutterType;
                            gr.u_gutter_problem = responseObj.Response.ServiceRequest[i].La311GutterRepair[0].GutterProblem;
                            gr.empty_array = "false";
                        // }
                        // else {
                        //     gr.empty_array = "true";
                        //     gr.u_insert();
                        }
                    }
					/*
						end --- Gutter Repair
					*/

					/*
						start --- Curb Repair
					*/
                    else if (serviceType == "Curb Repair") {
                        if (responseObj.Response.ServiceRequest[i].La311CurbRepair.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].ApprovedBy;
                            gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].AssignTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].Crew;
                            gr.u_curb_problem = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].CurbProblem;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].InspectionDate;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311CurbRepair[0].Name;
                            gr.empty_array = "false";
                        // }
                        // else {
                        //     gr.empty_array = "true";
                        //     gr.u_insert();
                        }
                    }
					/*
						end --- Curb Repair
					*/

					/*
						start --- General Street Inspection
					*/
                    else if (serviceType == "General Street Inspection") {
                        if (responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection.length) {
                            gr.u_access_ramp_problem = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].AccessRampProblem;
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].ApprovedBy;
                            gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].AssignTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].InspectionDate;
                            gr.u_metal_plate_location = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].MetalPlateLocation;
                            gr.u_oil_spill_location = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].OilSpillLocation;
                            gr.u_other_inspection = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].OtherInspection;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].Type;
                            gr.u_water_blowout_location = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].WaterBlowoutLocation;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311GeneralStreetInspection[0].Name;
                            gr.empty_array = "false";
                        // }
                        // else {
                        //     gr.empty_array = "true";
                        //     gr.u_insert();
                        }
                    }
					/*
						end --- General Street Inspection
					*/


					/*
							start --- Land/Mudslide
						*/

                    else if (serviceType == "Land/Mud Slide") {
                        if (responseObj.Response.ServiceRequest[i].La311LandMudSlide.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].ApprovedBy;
                            gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].AssignTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Location;
                            gr.u_other_location = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].OtherLocation;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].ContactLastName;
                            gr.u_road_passable_flag = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].RoadPassableFlag;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311LandMudSlide[0].Name;
                            gr.empty_array = "false";
                        // }
                        // else {
                        //     gr.empty_array = "true";
                        //     gr.u_insert();
                        }
                    }
					/*
							end --- Land/Mudslide
						*/



					/*
						start --- Flooding
					*/
                    else if (serviceType == "Flooding") {
                        if (responseObj.Response.ServiceRequest[i].La311Flooding.length) {
                        gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311Flooding[0].ApprovedBy;
                        gr.u_assign_to = responseObj.Response.ServiceRequest[i].La311Flooding[0].AssignTo;
                        gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311Flooding[0].CompletedBy;
                        gr.u_contact = responseObj.Response.ServiceRequest[i].La311Flooding[0].Contact;
                        gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311Flooding[0].ContactDate;
                        gr.u_crew = responseObj.Response.ServiceRequest[i].La311Flooding[0].Crew;
                        gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311Flooding[0].DateCompleted;
                        gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311Flooding[0].InspectedBy;
                        gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311Flooding[0].InspectionDate;
                        gr.u_location_type = responseObj.Response.ServiceRequest[i].La311Flooding[0].Location;
                        gr.u_type = responseObj.Response.ServiceRequest[i].La311Flooding[0].Type;
                        gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311Flooding[0].LastUpdatedBy;
                        gr.u_purpose_of_service_request = responseObj.Response.ServiceRequest[i].La311Flooding[0].PurposeOfSR;
                        gr.u_division_name = responseObj.Response.ServiceRequest[i].La311Flooding[0].DivisionName;
                        gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311Flooding[0].ContactFirstName;
                        gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311Flooding[0].ContactLastName;
                        gr.u_service_date_rendered = responseObj.Response.ServiceRequest[i].La311Flooding[0].ServiceDateRendered;
                        gr.u_work_referral_date = responseObj.Response.ServiceRequest[i].La311Flooding[0].WorkReferralDate;
                        gr.u_name = responseObj.Response.ServiceRequest[i].La311Flooding[0].Name;
                        gr.empty_array = "false";
                        }
                    }
					/*
						end --- Flooding
					*/

					/*
						start --- Barricade Removal
						Barricade Removal has no Additional fields
					*/
                    else if (serviceType == "Barricade Removal") {
                        // gr.u_ = responseObj.Response.ServiceRequest[i].La311BarricadeRemoval[0].;				
                    }
					/*
						end --- Barricade Removal
					*/


					/*
						start --- Guard Warning Rail Maintenance
					*/
                    else if (serviceType == "Guard Warning Rail Maintenance") {
                        if (responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].InspectionDate;
                            gr.u_request_type = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].RequestType;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311GuardWarningRailMaintenance[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Guard Warning Rail Maintenance
					*/

					/*
						start --- Bus Pad Landing
					*/
                    else if (serviceType == "Bus Pad Landing") {
                        if (responseObj.Response.ServiceRequest[i].La311BusPadLanding.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].InspectionDate;
                            gr.u_install_or_repair = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].InstallorRepair;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311BusPadLanding[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Bus Pad Landing
					*/

					/* 
						start --- Tree Emergency
					*/
                    else if (serviceType == "Tree Emergency") {
                        if (responseObj.Response.ServiceRequest[i].La311TreeEmergency.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].DateCompleted;
                            gr.u_emergency_type = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].EmergencyType;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Location;
                            gr.u_other_location = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].OtherLocation;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].DivisionName;
                            gr.u_device_id = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].DeviceId;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311TreeEmergency[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Tree Emergency
					*/

					/*
						start --- Bees or Beehive
					*/
                    else if (serviceType == "Bees or Beehive") {
                        if (responseObj.Response.ServiceRequest[i].La311BeesOrBeehive.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311BeesOrBeehive[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Bees or Beehive
					*/


					/*
						start --- Tree Obstruction
					*/
                    else if (serviceType == "Tree Obstruction") {
                        if (responseObj.Response.ServiceRequest[i].La311TreeObstruction.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].InspectionDate;
                            gr.u_obstruction_location = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ObstructionLocation;
                            gr.u_obstruction_problem = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ObstructionProblem;
                            gr.u_other_problem = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].OtherProblem;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311TreeObstruction[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Tree Obstruction
					*/


					/*
						start --- Street Tree Inspection
					*/
                    else if (serviceType == "Street Tree Inspection") {
                        if (responseObj.Response.ServiceRequest[i].La311StreetTreeInspection.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].DateCompleted;
                            gr.u_infested_tree_location = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].InfestedTreeLocation;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].InspectionDate;
                            gr.u_inspection_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].InspectionType;
                            gr.u_other_tree_w_nspection_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].OtherTreeWellInspectionType;
                            gr.u_stump_removal_location = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].StumpRemovalLocation;
                            gr.u_tree_planting_location = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreePlantingLocation;
                            gr.u_tree_stake_inspection_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreeStakeInspectionType;
                            gr.u_tree_removal_reason = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreeRemovalReason;
                            gr.u_tree_removal_location = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreeRemovalLocation;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].Type;
                            gr.u_tree_well_inspection_type = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].TreeWellInspectionType;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311StreetTreeInspection[0].Name;
                            gr.empty_array = "false";3
                        }
                    }
					/*
						end --- Street Tree Inspection
					*/

					/*
						start --- Median Island Maintenance
					*/
                    else if (serviceType == "Median Island Maintenance") {
                        if (responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].InspectionDate;
                            gr.u_problem_type = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ProblemType;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Median Island Maintenance
					*/

					/*
						start --- Tree Permit
					*/
                    else if (serviceType == "Tree Permits") {
                        if (responseObj.Response.ServiceRequest[i].La311MedianIslandMaintenance.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311TreePermits[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311TreePermits[0].AssignedTo;
                            gr.u_city = responseObj.Response.ServiceRequest[i].La311TreePermits[0].City;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311TreePermits[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311TreePermits[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311TreePermits[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311TreePermits[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311TreePermits[0].InspectionDate;
                            gr.u_is_address_same = responseObj.Response.ServiceRequest[i].La311TreePermits[0].IsAddrSame;
                            gr.u_is_authorized = responseObj.Response.ServiceRequest[i].La311TreePermits[0].IsAuthorized;
                            gr.u_is_form_needed = responseObj.Response.ServiceRequest[i].La311TreePermits[0].IsFormNeeded;
                            gr.u_mailing_address = responseObj.Response.ServiceRequest[i].La311TreePermits[0].MailingAddress;
                            gr.u_name_of_company = responseObj.Response.ServiceRequest[i].La311TreePermits[0].NameofCompany;
                            gr.u_number_of_oak_trees = responseObj.Response.ServiceRequest[i].La311TreePermits[0].NoofOakTrees;
                            gr.u_number_of_other_trees = responseObj.Response.ServiceRequest[i].La311TreePermits[0].NoofOtherTrees;
                            gr.u_number_of_palm_trees = responseObj.Response.ServiceRequest[i].La311TreePermits[0].NoofPalmTrees;
                            gr.u_permit_type = responseObj.Response.ServiceRequest[i].La311TreePermits[0].PermitType;
                            gr.u_property_owner_contact = responseObj.Response.ServiceRequest[i].La311TreePermits[0].PropertyOwnerContact;
                            gr.u_property_owner_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].PropertyOwnerName;
                            gr.u_quantity = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Quantity;
                            gr.u_representative_title = responseObj.Response.ServiceRequest[i].La311TreePermits[0].RepresentativeTitle;
                            gr.u_state = responseObj.Response.ServiceRequest[i].La311TreePermits[0].State;
                            gr.u_tree_location = responseObj.Response.ServiceRequest[i].La311TreePermits[0].TreeLocation;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Type;
                            gr.u_zipcode = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Zipcode;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311TreePermits[0].LastUpdatedBy;
                            gr.u_disclaimer_acceptance = responseObj.Response.ServiceRequest[i].La311TreePermits[0].DisclaimerAcceptence;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311TreePermits[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311TreePermits[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Tree Permit
					*/


					/*
						start --- Street Tree Violations
					*/
                    else if (serviceType == "Street Tree Violations") {
                        if (responseObj.Response.ServiceRequest[i].La311StreetTreeViolations.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].InspectionDate;
                            gr.u_street_tree_type = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].StreetTreeType;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].Type;
                            gr.u_violation_type = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ViolationType;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311StreetTreeViolations[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Street Tree Violations
					*/

					/*
						start --- Overgrown Vegetation/Plants
					*/
                    else if (serviceType == "Overgrown Vegetation/Plants") {
                        if (responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311OvergrownVegetationPlants[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Overgrown Vegetation/Plants
					*/


					/*
						start --- Weed Abatement for Private Parcels
					*/
                    else if (serviceType == "Weed Abatement for Private Parcels") {
                        if (responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].InspectionDate;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311WeedAbatementForPrivateParcels[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Weed Abatement for Private Parcels
					*/


					/*
						start --- Palm Fronds Down
					*/
                    else if (serviceType == "Palm Fronds Down") {
                        if (responseObj.Response.ServiceRequest[i].La311PalmFrondsDown.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Location;
                            gr.u_other_location = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].OtherLocation;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311PalmFrondsDown[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Palm Fronds Down
					*/


					/*
						start --- Obstructions
					*/
                    else if (serviceType == "Obstructions") {
                        if (responseObj.Response.ServiceRequest[i].La311Obstructions.length) {
                            gr.u_collection_day = responseObj.Response.ServiceRequest[i].La311Obstructions[0].CollectionDay;
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311Obstructions[0].AssignedTo;
                            gr.u_closer_item = responseObj.Response.ServiceRequest[i].La311Obstructions[0].CloserItem;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311Obstructions[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Contact;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311Obstructions[0].DateCompleted;
                            gr.u_illegal_lane_closure_hours = responseObj.Response.ServiceRequest[i].La311Obstructions[0].IllegalLaneClosureHours;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311Obstructions[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311Obstructions[0].InspectionDate;
                            gr.u_obstructions_location = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ObstructionsLocation;
                            gr.u_obstructions_type = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ObstructionsType;
                            gr.u_other = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Other;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Type;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ContactDate;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311Obstructions[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311Obstructions[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311Obstructions[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311Obstructions[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311Obstructions[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Obstructions
					*/


					/*
						start --- Illegal Sign Removal
					*/
                    else if (serviceType == "Illegal Sign Removal") {
                        if (responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Location;
                            gr.u_sign_type = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].SignType;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Type;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ContactDate;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].ContactLastName;
                            gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].OtherObstruction;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalSignRemoval[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Illegal Sign Removal
					*/



					/*
						start --- Illegal Construction Fence
					*/
                    else if (serviceType == "Illegal Construction Fence") {
                        if (responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].ContactLastName;
                            gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].OtherObstruction;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalConstructionFence[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Illegal Construction Fence
					*/



					/*
						start --- Illegal Discharge of Water
					*/
                    else if (serviceType == "Illegal Discharge of Water") {
                        if (responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].ContactLastName;
                            gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].OtherObstruction;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalDischargeOfWater[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Illegal Discharge of Water
					*/



					/*
						start --- Illegal Construction
					*/
                    else if (serviceType == "Illegal Construction") {
                        if (responseObj.Response.ServiceRequest[i].La311IllegalConstruction.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].ContactLastName;
                            gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].OtherObstruction;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalConstruction[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Illegal Construction
					*/


					/*
						start --- Illegal Excavation
					*/
                    else if (serviceType == "Illegal Excavation") {
                        if (responseObj.Response.ServiceRequest[i].La311IllegalExcavation.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].ContactLastName;
                            gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].OtherObstruction;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalExcavation[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Illegal Excavation
					*/

					/*
						start --- Illegal Auto Repair
					*/
                    else if (serviceType == "Illegal Auto Repair") {
                        if (responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].ContactLastName;
                            gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].OtherObstruction;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311IllegalAutoRepair[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Illegal Auto Repair
					*/


                    //Non-Complaint Vending for both Food and Merchandise do not take in any fields from the myLA311 get request 
					/*
						start --- Non-Complaint Vending
					
					else if (serviceType == "Non-Complaint Vending") {
						gr.u_ = responseObj.Response.ServiceRequest[i].La311IllegalVending[0].;
					}
					
						end --- Non-Complaint Vending
					*/


					/*
						start --- News Rack Violation
					*/
                    else if (serviceType == "News Rack Violation") {
                        if (responseObj.Response.ServiceRequest[i].La311NewsRackViolation.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].InspectionDate;
                            gr.u_other_type = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].OtherType;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Type;
                            gr.u_violation_type = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ViolationType;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].ContactLastName;
                            gr.u_other_obstruction = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].OtherObstruction;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311NewsRackViolation[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- News Rack Violation
					*/

					/*
						start --- Tables and Chairs Obstructing
					*/
                    else if (serviceType == "Tables and Chairs Obstructing") {
                        if (responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311TablesAndChairsObstructing[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Tables and Chairs Obstructing
					*/

					/*
						start --- Leaf Blower Violation
					*/
                    else if (serviceType == "Leaf Blower Violation") {
                        if (responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation.length) {
                            gr.u_approved_by = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].ApprovedBy;
                            gr.u_assigned_to = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].AssignedTo;
                            gr.u_completed_by = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].CompletedBy;
                            gr.u_contact = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Contact;
                            gr.u_contact_date = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].ContactDate;
                            gr.u_crew = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Crew;
                            gr.u_date_completed = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].DateCompleted;
                            gr.u_inspected_by = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].InspectedBy;
                            gr.u_inspection_date = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].InspectionDate;
                            gr.u_location_type = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Location;
                            gr.u_type = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Type;
                            gr.u_last_updated_by = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].LastUpdatedBy;
                            gr.u_optional_tracking_code = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].OptionalTrackingCode;
                            gr.u_division_name = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].DivisionName;
                            gr.u_contact_first_name = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].ContactFirstName;
                            gr.u_contact_last_name = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].ContactLastName;
                            gr.u_name = responseObj.Response.ServiceRequest[i].La311LeafBlowerViolation[0].Name;
                            gr.empty_array = "false";
                        }
                    }
					/*
						end --- Leaf Blower Violation
					*/



                    // Illegal Dumping has its own array "La311IllegalDumpingInProgress" as seen in the get Request from the myLA311 test api
                    // But "Illegal" dumping is classified as an "Obstruction" thus is appended to the "La311Obstructions" array and not the intended "La311IllegalDumpingInProgress"
					/*
						start --- Illegal Dumping in Progress
					
					else if (serviceType == "Leaf Blower Violation") {
						gr.u_ = responseObj.Response.ServiceRequest[i].La311IllegalDumpingInProgress[0].;
					}
					
						end --- Illegal Dumping in Progress
					*/

                    // Insert record
                    if(!gr.empty_array) {
                        gr.update();
                    }
                    else {
                        gr.empty_array = "true";
                        gr.update();
                    }

                }
            }
        }


        else {
            gs.info("No recently updated SRs.");
        }
    }

    br.query();
    while (br.next()) {
        br.active = true;
        br.update();
    }

    }

catch (ex) {
    gs.info(ex);
}