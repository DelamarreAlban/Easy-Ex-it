/**
 * Created by Alban on 19/06/2017.
 */


var xmlGraph = {};
var xmi_json = {};
var ids = [];
var id_length = 12;
var agent_operations = [];
var agentInTeam = [];
var animations_localProfile = [];
var xmiFile;
var generated_activities = [];
var generated_xmi = [];
var xmi_text;

//Behaviors to keep when cleaning XMI file.
//Also to be called during vignette.
var commonBehaviors = [];
commonBehaviors.push({"id":"","name":"test"});
commonBehaviors.push({"id":"","name":"FinalBehavior"});

var sounds = [];
sounds.push("Humming");
sounds.push("Laughing");

var resourceList = [];
var locationList = [];
var animationList =[];
var operationList = [];

//Input to get the name of the disruptive student
var disruptiveName = document.getElementById("agent").value;

var student_class_id = ""
var teacher_class_id = ""

//Objectnames
var disruptiveBook = "Book_"+disruptiveName;
var disruptiveNotebook = "Book_Notebook_"+disruptiveName ;
var disruptiveWorkbook = "Book_Workbook_"+disruptiveName ;
var teacherBook = "Book_Teacher";
var disruptivePencil = "Pencil_"+disruptiveName;
var disruptiveSheet = "Paper_Worksheet_"+disruptiveName;
var disruptiveBackpack = "Backpack_"+disruptiveName ;
var disruptiveChair = "Chair_"+disruptiveName ;
var disruptiveDesk =  "Desk_"+disruptiveName;
console.log("##########################  " + disruptiveName);
function check() {
    disruptiveName = document.getElementById("agent").value;
    console.log("##########################  " + disruptiveName);
    updateNames();

}


function updateNames() {
//TO get objects check the list of roles and get the good one
    disruptiveBook = + "Book_"+disruptiveName ;
    disruptiveNotebook =  "Book_Notebook_"+disruptiveName ;
    disruptiveWorkbook ="Book_Workbook_"+disruptiveName ;
    disruptivePencil = "Pencil_"+disruptiveName;
    disruptiveSheet =  "Paper_Worksheet_"+disruptiveName;
    disruptiveBackpack = "Backpack_"+disruptiveName ;
    disruptiveChair = "Chair_"+disruptiveName ;
    disruptiveDesk = "Desk_"+disruptiveName;
    console.log(disruptiveDesk)
}

document.getElementById("xml-generator").addEventListener("click", function() {
    generateXMI();
    //integrate2XMI();

    document.getElementById('csvdata').innerText = generated_activities[0];
    //document.getElementById('csvdata').innerText = generateId();

    console.log("RESOURCES");
    console.log(resourceList);
    console.log("LOCATIONS");
    console.log(locationList);
    console.log("ANIMATIONS");
    console.log(animationList);
    console.log("OPERATIONS");
    console.log(operationList);
});

document.getElementById("xmi-export-btn").addEventListener("click", function() {

    integrate2XMI();
    xmi_text = generated_xmi.join('\n');
    download_file("XMI_generated.xmi",xmi_text);
    document.getElementById('csvdata').innerText = generated_activities.join('\n');


});

document.getElementById("input-xmi").addEventListener('change', function() {
    var reader = new FileReader();
    reader.addEventListener('load', function() {
        xmiFile = this.result;

        var x2js = new X2JS();
        //var xmlText = "<MyRoot><test>Success</test><test2><item>val1</item><item>val2</item></test2></MyRoot>";
        var jsonObj = x2js.xml_str2json( xmiFile );
        console.log("XMI FILE");
        console.log(jsonObj);
        xmi_json = jsonObj;
        console.log("GET XMI IDS");
        getXMI_ids();
        //console.log(xmiFile);
        cleanXMIFile();
    });
    reader.readAsText(document.querySelector("#input-xmi").files[0]);
});

function getXMI_ids(){
    if(xmi_json){
        var pe_0 = [];
        pe_0 = xmi_json.XMI.Model.packagedElement;
        var classroom = null;
        var scenario = null;
        for(var p in pe_0){
            if(pe_0[p]._name === "EasyExit")
                classroom = pe_0[p];
            if(pe_0[p]._name === "Scenario")
                scenario = pe_0[p];
        }
        if(classroom)
        {
            console.log("Looking for agent operations: EasyExit package found!!");

            var pe_1 = [];
            pe_1 = classroom.packagedElement;
            var org = null;
            for(var p in pe_1){
                if(pe_1[p]._name === "Organisation")
                    org = pe_1[p];

            }
            if(org)
            {
                console.log("Looking for agent operations: Organisation package found!!");
                console.log(org);
                var agents = [];
                agents = org.packagedElement;
                for(var a in agents){
                    var agent = agents[a];
                    for(var o in agent.ownedOperation){
                        console.log(agent._name + " -> " + agent.ownedOperation[o]._name);
                        var operation = {
                            "id": agent.ownedOperation[o]['_xmi:id'],
                            "name": agent.ownedOperation[o]._name
                        }
                        agent_operations.push(operation);
                    }
                }
            }
        }
        console.log("OPERATIONS");
        console.log(agent_operations);
    }
    if(scenario) {
        console.log("Looking for agent in scenario: Scenario package found!!");
        console.log(scenario);
        var package = [];
        package.push(scenario.packagedElement);
        var attributes = {};
        console.log(package);
        for(var p in package){
            if(package[p]["_xmi:type"]== "uml:Collaboration")
                attributes = package[p].ownedAttribute;
        }
        console.log(attributes);
        for(var a in attributes){
            console.log(attributes[a]._name);
            var ag = {};
            ag.name = attributes[a]._name;
            ag.id = attributes[a]["_xmi:id"];
            ag.type = attributes[a]._type;
            agentInTeam.push(ag);
        }
    }
    console.log("AGENT IN TEAM");
    console.log(agentInTeam);
    
}

function generateXMI(){
    xmlGraph = chart_graph;
	//student_class_id = getStudentRId();
    getStudentRId();
    if(agent_operations.length == 0){
        console.log("No operations!!")
        return;
    }

    console.log("GENERATE XMI");
    //console.log(xmlGraph);

    //Insert resource nodes


    for(var a in xmlGraph.activity){
        var activity = xmlGraph.activity[a];
        setActivityInfo(activity);

        console.log(activity.name);

        var xmi_activities = "";
        xmi_activities += "<ownedBehavior xmi:type=\"uml:Activity\" xmi:id=\"" + activity.id +"\" name=\"" + activity.name + "\">\n";
        xmi_activities += "<nestedClassifier xmi:type=\"uml:Collaboration\" xmi:id=\"" + generateId() + "\" name=\"locals\"/>\n";
        //<ownedBehavior xmi:type="uml:Activity" xmi:id="_-32vxnBnEee0iO2rXDmDdw" name="JordanIsLate">
        //<nestedClassifier xmi:type="uml:Collaboration" xmi:id="_-32vx3BnEee0iO2rXDmDdw" name="locals"/>
        for(var n in activity.nodes){
            if(activity.nodes[n].type != "feedback" && activity.nodes[n].type != undefined)
                xmi_activities += getNodeXml(activity.nodes[n]) + "\n";
        }

        //console.log(getNodeXml(xmlGraph.nodes[n]));

        for(var e in activity.edges)
            xmi_activities += getEdgeXml(activity.edges[e]) + "\n";

        var recorder = false;
        for(var r in activity.roles){
            console.log("+++++++++++++++++++++++++++++++++++++++++++++");
            console.log("found role in "+activity.name);
            console.log("found role "+activity.roles[r].name);
            if(activity.roles[r].name == "Recorder")
                recorder = true;
			console.log(activity)
			console.log(activity.roles[r])
            xmi_activities += getPartitionXml(activity.roles[r]) + "\n";
        }
		for(var r in activity.resourceRoles){
            console.log("+++++++++++++++++++++++++++++++++++++++++++++");
            console.log("found role res in "+activity.name);
            console.log("found role res "+activity.resourceRoles[r].name);
			var create=true;
			for( var search in activity.roles)
			{
				if(activity.roles[search].name == activity.resourceRoles[r].name)
				{
					create=false;
				}
			}
			if(create)
			{
				console.log(activity)
				console.log(activity.resourceRoles[r])
				xmi_activities += getPartitionXmlFromResource(activity.resourceRoles[r]) + "\n";
			}
        }
		
		
        if(!recorder)
            xmi_activities += "<group xmi:type=\"uml:ActivityPartition\" xmi:id=\""+generateId()+"\" name=\"Recorder\"/>" + "\n";

        xmi_activities +="</ownedBehavior>\n";
        generated_activities.push(xmi_activities);
    }

    //console.log(xmi_activities);

    console.log("GENERATED ACTIVITIES ");
    console.log(xmlGraph);
    //console.log(generated_activities);
    //document.getElementById('csvdata').innerText = xmi_activities;

}

function setActivityInfo(activity){
    if( !activity.roles ){console.log("found role ACTIVITY IS NULL in setactivityinfo "+activity.name); activity.roles = [];}
	else{console.log("found role ACTIVITY IS NOT NULL in setactivityinfo "+activity.name);}
    // activity.roles = [];
    for(var n in activity.nodes){
        if(getRole(activity,activity.nodes[n].role) == undefined) {
            var role = {};
            role.name = activity.nodes[n].role;
            role.id = generateId();
            role.nodes = [];
            role.nodes.push(activity.nodes[n]);
            activity.roles.push(role);
            activity.nodes[n].partition_id = role.id;
        }
        else{
            getRole(activity,activity.nodes[n].role).nodes.push(activity.nodes[n]);
            activity.nodes[n].partition_id = getRole(activity,activity.nodes[n].role).id;
        }
    }

    //console.log("ROLES");
    //console.log(activity.roles);
}

function getNodeXml(node){
    var xmlElement = "<node";
    var argument =  "/>";
    if(node.body !== undefined && node.type != "uml:DecisionNode") {
        if(node.type =="uml:CallBehaviorAction") {
            if (node.body.behavior !== undefined) {
                var activity = getActivity(node.body.behavior);
                if(activity != null)
                    argument = " behavior=\"" + activity.id + "\"/>";
                else
                    argument = " behavior=\"" + isCommonBehavior(node.body.behavior).id + "\"/>";
            }
        }
        else if (node.body.operation !== undefined) {
            //Check if operation name is a behavior
            //Check if operation exists in agent_operations
            //If not we consider the operation as an animation
            //console.log(node.body.operation);
            if(isCommonBehavior(node.body.operation) != null) {
                //Add WaitingForBehavior operation after the callBehavior
                node.type = "uml:CallBehaviorAction";
                argument = " behavior=\"" + isCommonBehavior(node.body.operation).id+ "\"/>";
            }
            else {
                var ope = findOperation(node.body.operation);
                if (ope) {
                    if(!operationList.includes(ope.name))
                        operationList.push(ope.name);
                    //console.log(ope);
                    //UML operation
                    if (node.type === "type")
                        node.type = "uml:CallOperationAction";

                    xmlElement += " operation=\"" + ope.id + "\"";

                    argument = ">";
                    argument += generateNodeArgument(node);
                    argument += "</node>";
                }
                else {
                    //UML Play animation
                    if (node.type === "type")
                        node.type = "uml:OpaqueAction";

                    argument = ">";
                    argument += generateNodeArgument(node);
                    argument += "<body></body>";
                    argument += "</node>";

                    //console.log("PLAY ANIMATION  " + node.body.operation);
                    var localProfile = "<LocalProfile:PlayAnimation xmi:id=\"" + generateId() + "\" base_OpaqueAction=\"" + node.id + "\" Animation=\"" + node.body.operation + "\"/>";
                    animations_localProfile.push(localProfile);
                    if(!animationList.includes(node.body.operation))
                        animationList.push(node.body.operation);
                }
            }
        }else if(node.type =="uml:CentralBufferNode") {
            argument = ">";
            argument += "<upperBound xmi:type=\"uml:LiteralString\" xmi:id=\""+generateId()+"\" name=\"UpperBound\" value=\"1\"/>\n";
            argument += "</node>";
        //<node xmi:type="uml:CentralBufferNode" xmi:id="_p9W0Nsc6EeeAMcbgWGZ4wQ" name="JordanBook" outgoing="_p9W0isc6EeeAMcbgWGZ4wQ" inPartition="_p9W0uMc6EeeAMcbgWGZ4wQ">
        //        <upperBound xmi:type="uml:LiteralString" xmi:id="_p9W0N8c6EeeAMcbgWGZ4wQ" name="UpperBound" value="1"/>
        //        </node>
        }
    }


    xmlElement += " xmi:type=" + "\"" + node.type + "\"";
    xmlElement += " xmi:id=" + "\"" + node.id + "\"";
    xmlElement += " name=" + "\"" + node.name + "\"";
    if(node.outgoing){
        xmlElement += " outgoing=" + "\"" + node.outgoing.join(" ") + "\"";
    }
    if(node.incoming){
        xmlElement += " incoming=" + "\"" + node.incoming.join(" ") + "\"";
    }
    xmlElement += " inPartition=" + "\"" + node.partition_id + "\"";
    xmlElement += argument;

    return xmlElement;
//<node xmi:type="uml:CallOperationAction" xmi:id="_348rtlgYEeek59hf2UqvgA" name="801a" outgoing="_348r_1gYEeek59hf2UqvgA" incoming="_348sJ1gYEeek59hf2UqvgA" inPartition="_348sK1gYEeek59hf2UqvgA" operation="_345lAFgYEeek59hf2UqvgA">
//        <argument xmi:type="uml:ValuePin" xmi:id="_348rt1gYEeek59hf2UqvgA" name="Message">
//        <ownedComment xmi:id="_348ruFgYEeek59hf2UqvgA">
//        <body>&lt;p>Please copy down the answers to the Do Now so you can use them for your homework&lt;/p>
//    </body>
//    </ownedComment>
//    <type xmi:type="uml:PrimitiveType" href="pathmap://UML_LIBRARIES/UMLPrimitiveTypes.library.uml#String"/>
//        <upperBound xmi:type="uml:LiteralString" xmi:id="_348ruVgYEeek59hf2UqvgA" name="UpperBound" value="1"/>
//        </argument>
//        </node>

    //<node xmi:type="uml:CallBehaviorAction" xmi:id="_-32wZ3BnEee0iO2rXDmDdw" name="DECISION_790" outgoing="_-32wl3BnEee0iO2rXDmDdw"
//    incoming="_-32wlXBnEee0iO2rXDmDdw" inPartition="_-32wqHBnEee0iO2rXDmDdw" behavior="_-35MsXBnEee0iO2rXDmDdw"/>
}

//If a new operation with an argument is added, => ADD NEW CASE HERE!!
function generateNodeArgument(node){
    var argument = "";
    var operations = node.body.operation.split(' ');
    if(node.type == "uml:OpaqueAction"){
        //Play animation - Added to node description
        var argument = "<ownedComment xmi:id=\"" + generateId()  + "\">";
        argument += "\n <body>" + htmlSpecialChars(node.body.operation) + "</body>";
        argument += "</ownedComment>";
        return argument;
    }else {
        for (var o in operations) {
            var operation = operations[o];
            if (operation == "Speak") {
                var argument = "\n<argument";
                argument += " xmi:type=\"uml:ValuePin\"";
                argument += " xmi:id=\"" + generateId() + "\"";
                // Pin name
                argument += " name=\"" + "Message" + "\">";
                //
                argument += "\n <ownedComment xmi:id=\"" + generateId() + "\">";
                if(node.soundId && node.role != "TeacherAuto" && node.role != "Teacher")
                    argument += "\n <body>" + "AUDIO:" + node.soundId+ "_" + htmlSpecialChars(node.body.body) + "</body>";
                else
                    argument += "\n <body>" + htmlSpecialChars(node.body.body) + "</body>";
                argument += "\n </ownedComment>";
                argument += "\n <type xmi:type=\"uml:PrimitiveType\" href=\"pathmap://UML_LIBRARIES/UMLPrimitiveTypes.library.uml#String\"/>";
                argument += "\n <upperBound xmi:type=\"uml:LiteralString\" xmi:id=\"" + generateId();
                argument += "\" name=\"UpperBound\"" + " value=\"1\"/>";
                argument += "\n </argument>\n";

                var argument2 = "\n<argument";
                argument2 += " xmi:type=\"uml:ValuePin\"";
                argument2 += " xmi:id=\"" + generateId() + "\"";
                // Pin name
                argument2 += " name=\"" + "Specification" + "\">";
                //

                if(!node.body.feedback){
                    node.body.feedback = {}
                    node.body.feedback.quantitative = ""
                    node.body.feedback.qualitative = ""
                    node.body.feedback.strategy = ""
                }

                argument2 += "\n <ownedComment xmi:id=\"" + generateId() + "\">";
                argument2 += "\n <body>" + htmlSpecialChars(node.body.feedback.quantitative) + "_" + htmlSpecialChars(node.body.feedback.strategy) + "_" + htmlSpecialChars(node.body.feedback.qualitative) + "</body>";
                argument2 += "\n </ownedComment>";
                argument2 += "\n <type xmi:type=\"uml:PrimitiveType\" href=\"pathmap://UML_LIBRARIES/UMLPrimitiveTypes.library.uml#String\"/>";
                argument2 += "\n <upperBound xmi:type=\"uml:LiteralString\" xmi:id=\"" + generateId();
                argument2 += "\" name=\"UpperBound\"" + " value=\"1\"/>";
                argument2 += "\n </argument>\n";
                argument += argument2;
            }
            else if (operation == "Choice") {
                var argument1 = "\n<argument";
                argument1 += " xmi:type=\"uml:ValuePin\"";
                argument1 += " xmi:id=\"" + generateId() + "\"";
                // Pin name
                argument1 += " name=\"" + "Message" + "\">";
                //
                argument1 += "\n <ownedComment xmi:id=\"" + generateId() + "\">";
                argument1 += "\n <body>" + htmlSpecialChars(node.body.body) + "</body>";
                argument1 += "\n </ownedComment>";
                argument1 += "\n <type xmi:type=\"uml:PrimitiveType\" href=\"pathmap://UML_LIBRARIES/UMLPrimitiveTypes.library.uml#String\"/>";
                argument1 += "\n <upperBound xmi:type=\"uml:LiteralString\" xmi:id=\"" + generateId();
                argument1 += "\" name=\"UpperBound\"" + " value=\"1\"/>";
                argument1 += "\n </argument>\n";

                var argument2 = "\n<argument";
                argument2 += " xmi:type=\"uml:ValuePin\"";
                argument2 += " xmi:id=\"" + generateId() + "\"";
                // Pin name
                argument2 += " name=\"" + "Specification" + "\">";
                //
                argument2 += "\n <ownedComment xmi:id=\"" + generateId() + "\">";
                argument2 += "\n <body>" + htmlSpecialChars(node.body.feedback.quantitative) + "_" + htmlSpecialChars(node.body.feedback.strategy) + "_" + htmlSpecialChars(node.body.feedback.qualitative) + "</body>";
                argument2 += "\n </ownedComment>";
                argument2 += "\n <type xmi:type=\"uml:PrimitiveType\" href=\"pathmap://UML_LIBRARIES/UMLPrimitiveTypes.library.uml#String\"/>";
                argument2 += "\n <upperBound xmi:type=\"uml:LiteralString\" xmi:id=\"" + generateId();
                argument2 += "\" name=\"UpperBound\"" + " value=\"1\"/>";
                argument2 += "\n </argument>\n";
                var argument = argument1;
                argument += argument2;
            }
            else if (operation.includes("PlayAudio")) {
                var target = operation.substring(operation.indexOf("(") + 1, operation.indexOf(")"));
                //console.log("Chair " + target);
                var argument = "\n<argument";
                argument += " xmi:type=\"uml:ValuePin\"";
                argument += " xmi:id=\"" + generateId() + "\"";
                // Pin name
                argument += " name=\"" + "Name" + "\">";
                //
                argument += "\n <ownedComment xmi:id =\"" + generateId() + "\">";
                argument += "\n <body>" + target + "</body>";
                argument += "\n </ownedComment>";
                argument += "\n <type xmi:type=\"uml:PrimitiveType\" href=\"pathmap://UML_LIBRARIES/UMLPrimitiveTypes.library.uml#String\"/>";
                argument += "\n <upperBound xmi:type=\"uml:LiteralString\" xmi:id=\"" + generateId();
                argument += "\" name=\"UpperBound\" value=\"1\"/>";
                argument += "\n </argument>\n";
            }
            else if (operation.includes("LookAt") || operation.includes("MoveTo") || operation.includes("FaceAt")) {	//object sing
                var target_obj = operation.substring(operation.indexOf("(") + 1, operation.indexOf(")"));
                //console.log(operation);
                //console.log(operation + " : " + target_obj);
                var object = getResource(target_obj);
                var resource = getResourceInActivity(getActivity(node.activity),object.name);
                var edgeId = resource.edge_id;
                if(resource.inputPin_id[0]) {
                    var inputPinId = resource.inputPin_id[0];
                    resource.inputPin_id.shift();
                }

                var argument = "\n<argument";
                argument += " xmi:id=\"" + inputPinId + "\"";
                argument += " name=\""+ "Location" +"\"";
                argument += " incoming=\"" + edgeId + "\"";
                argument += " type=\"" + getResource("EnvironmentObject").type + "\">";
                argument += "\n <upperBound xmi:type=\"uml:LiteralString\" xmi:id=\"" + generateId() + "\" name=\"UpperBound\" value=\"1\"/>";
                argument += "</argument>";

            }
            else if (operation.includes("PlayAnimation")) {
                var target = operation.substring(operation.indexOf("(") + 1, operation.indexOf(")"));
                //console.log("Chair " + target);
                var argument = "\n<argument";
                argument += " xmi:type=\"uml:ValuePin\"";
                argument += " xmi:id=\"" + generateId() + "\"";
                // Pin name
                argument += " name=\"" + "Animation" + "\">";
                //
                argument += "\n <ownedComment xmi:id =\"" + generateId() + "\">";
                argument += "\n <body>" + target + "</body>";
                argument += "\n </ownedComment>";
                argument += "\n <type xmi:type=\"uml:PrimitiveType\" href=\"pathmap://UML_LIBRARIES/UMLPrimitiveTypes.library.uml#String\"/>";
                argument += "\n <upperBound xmi:type=\"uml:LiteralString\" xmi:id=\"" + generateId();
                argument += "\" name=\"UpperBound\" value=\"1\"/>";
                argument += "\n </argument>\n";
            }
            else if (operation.includes("SetFacialExpression")) {
                var target = operation.substring(operation.indexOf("(") + 1, operation.indexOf(")"));
                //console.log("Chair " + target);
                var argument = "\n<argument";
                argument += " xmi:type=\"uml:ValuePin\"";
                argument += " xmi:id=\"" + generateId() + "\"";
                // Pin name
                argument += " name=\"" + "Expression" + "\">";
                //
                argument += "\n <ownedComment xmi:id =\"" + generateId() + "\">";
                argument += "\n <body>" + target + "</body>";
                argument += "\n </ownedComment>";
                argument += "\n <type xmi:type=\"uml:PrimitiveType\" href=\"pathmap://UML_LIBRARIES/UMLPrimitiveTypes.library.uml#String\"/>";
                argument += "\n <upperBound xmi:type=\"uml:LiteralString\" xmi:id=\"" + generateId();
                argument += "\" name=\"UpperBound\" value=\"1\"/>";
                argument += "\n </argument>\n";
            }
            else {
            }
        }
    }
    return argument;
}


function getStudentRId()
{
	for(line in generated_xmi)
	{
        if(generated_xmi[line].includes('xmi:type="uml:Interface"') && generated_xmi[line].includes("TeacherR"))
            teacher_class_id = generated_xmi[line].split("xmi:id")[1].split('"')[1]
		if(generated_xmi[line].includes('xmi:type="uml:Interface"') && generated_xmi[line].includes("StudentR"))	//if the line describes a class that has the right name
		{
			student_class_id = generated_xmi[line].split("xmi:id")[1].split('"')[1]
		}
	}
}

function insertAgentInTeam(name){
	/*
	*1 check agent name
	*2 find corresponding type
	*3 generateid for agent
	*4 add agent to generated_xmi
	*5 add agent to agentInTeam array
	*6 return agent
	*/
	if(name == undefined || name=="")
	{
		name = "Target_DefaultTarget";
	}
	console.log("starting agent creation : "+name)
	//Create agent
	id = generateId()
	var ag = {}
	ag.name = name
	ag.id = id
	//Find type id
	var str_type = ag.name.split("_")[0]	//will either contain the object class, or the name of the student
	//Go through all Types in the xmi, if we don't find it it means we are dealing with a student agent.
    if(str_type == "Teacher")
        console.log("TEACHER NEEDS TO BE INSERTED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
	found = false
	student_class_id = ""
	for(line in generated_xmi)
	{
		if(generated_xmi[line].includes('xmi:type="uml:Class"') && generated_xmi[line].split('name="')[1].split('"')[0] ==str_type)	//if the line describes a class that has the right name
		{
			found = true
			var type_id = generated_xmi[line].split("xmi:id")[1].split('"')[1]
			ag.type=type_id
			console.log("found class line id :"+type_id)
			console.log(generated_xmi[line])
		}
        if(generated_xmi[line].includes('xmi:type="uml:Interface"') && generated_xmi[line].includes("TeacherR"))
            teacher_class_id = generated_xmi[line].split("xmi:id")[1].split('"')[1]
		if(generated_xmi[line].includes('xmi:type="uml:Interface"') && generated_xmi[line].includes("StudentR"))	//if the line describes a class that has the right name
		{
			student_class_id = generated_xmi[line].split("xmi:id")[1].split('"')[1]
		}
	}
	if(!found)
	{
		ag.type=student_class_id
		console.log("Either the object doesnt exist, or it is a student, let's consider it a student and hope for the best");
	}
	
	found=false;
	//Add agent to team for realz inside of the xmi
	for(line in generated_xmi)
	{
		if(generated_xmi[line].includes("Team"))
		{
			found=true;
			console.log("found team zone")
			console.log(generated_xmi[line])
			continue
		}
		if(found)
		{
			generated_xmi.splice(line,0,team_membership(ag))
			break;
		}
	}
	
	agentInTeam.push(ag)
	return ag
}


function team_membership(agent)
{
	var str_ret = '<ownedAttribute xmi:id="'+agent.id+'"';
	str_ret+=' name="'+agent.name+'"';
	str_ret+=' type="'+agent.type+'"';
	str_ret+=' aggregation="composite"/>';
	
	console.log(str_ret);
	
	return str_ret;
}


function getAgentInTeam(name) {
    //console.log("getting agent in team"+name);
    function byName(agent) {
        return agent.name === name;
    }

	if(name == undefined || name=="")
	{
		name = "Target_DefaultTarget";
	}
	
    if (agentInTeam.find(byName))
        return agentInTeam.find(byName);
    else {
		//Create agent
		
        console.log(name +" agent in team not found...");
        return insertAgentInTeam(name);
    }
}

//Should take the type from roles
//to do it right => get All environment object from the environment package
//then match the types and get the id of the type
var resourceList = [];
function getResource(name){
    var resource;
    var ag = getAgentInTeam(name);
    if(ag) {
        if(!resourceList.includes(ag.name))
            resourceList.push(ag.name);
        return ag;
    }
    else {
        if (name.includes("Notebook"))
            resource = getAgentInTeam(disruptiveNotebook);
        else if (name.includes("Workbook"))
            resource = getAgentInTeam(disruptiveWorkbook);
        else if (name.includes("TeacherBook"))
            resource = getAgentInTeam(teacherBook);
        else if (name.includes("Book") || name.includes("book"))
            resource = getAgentInTeam(disruptiveBook);
        else if (name.includes("Pencil") || name.includes("pencil"))
            resource = getAgentInTeam(disruptivePencil);
        else if (name.includes("sheet"))
            resource = getAgentInTeam(disruptiveSheet);
        else if (name.includes("Desk") || name.includes("desk"))
            resource = getAgentInTeam(disruptiveDesk);
        else if (name.includes("Chair") || name.includes("chair"))
            resource = getAgentInTeam(disruptiveChair);
        else if (name.includes("Backpack") || name.includes("backpack"))
            resource = getAgentInTeam(disruptiveBackpack);
        else {
            console.log("RESOURCE: " + name + " NOT FOUND");
            return null;
        }
    }
    if(!resourceList.includes(resource.name))
        resourceList.push(resource.name);
    return resource;
}


function getResourceInActivity(activity,name) {
    function byName(resource) {
        return resource.name === name;
    }
    if (activity.resources.find(byName))
        return activity.resources.find(byName);
    else {
		
        console.log(name +" resources in activity "+ activity.name  +" not found !!");
        return undefined;
    }
}

function getPartitionXmlFromResource(partition) {
    var xmlElement = "<group";
    xmlElement += " xmi:type=" + "\"" + "uml:ActivityPartition" + "\"";
    xmlElement += " xmi:id=" + "\"" + partition.id + "\"";
    xmlElement += " name=" + "\"" + partition.name + "\"";
    xmlElement += " represents=" + "\"" + getAgentInTeam(partition.name).id + "\"";
    xmlElement += "/>";

    return xmlElement;
    //<group xmi:type="uml:ActivityPartition" xmi:id="_dNPt9oa_EeaGQIHr6EmBRw" name="Teacher"
//    node="_dNPthIa_EeaGQIHr6EmBRw _dNPtiIa_EeaGQIHr6EmBRw" represents="_dNQUFYa_EeaGQIHr6EmBRw"/>
}

//Represent = Id represented object by this agent
function getPartitionXml(partition) {
    var xmlElement = "<group";
    xmlElement += " xmi:type=" + "\"" + "uml:ActivityPartition" + "\"";
    xmlElement += " xmi:id=" + "\"" + partition.id + "\"";
    xmlElement += " name=" + "\"" + partition.name + "\"";


    //Find a way to get all nodes of a partition
    if (partition.nodes.Count != 0) {
        var xmlPartitionNodes = " node="+ "\"";
        for (var n in partition.nodes) {
            xmlPartitionNodes += partition.nodes[n].id + " ";

            //    xmlElement += " node=" + "\"" + getNodes() + "\"";
        }
        xmlPartitionNodes = xmlPartitionNodes.substring(0, xmlPartitionNodes.length-1);
        xmlElement += xmlPartitionNodes + "\"";
    }
    xmlElement += " represents=" + "\"" + getAgentInTeam(partition.name).id + "\"";
    xmlElement += "/>";

    return xmlElement;
    //<group xmi:type="uml:ActivityPartition" xmi:id="_dNPt9oa_EeaGQIHr6EmBRw" name="Teacher"
//    node="_dNPthIa_EeaGQIHr6EmBRw _dNPtiIa_EeaGQIHr6EmBRw" represents="_dNQUFYa_EeaGQIHr6EmBRw"/>
}

function getEdgeXml(edge){
    if(!edge.type)
        edge.type = "uml:ControlFlow";
    var xmlElement = "<edge";
    xmlElement += " xmi:type=" + "\"" + edge.type + "\"";
    xmlElement += " xmi:id=" + "\"" + edge.id + "\"";
    if(edge.source != null)
        xmlElement += " source=" + "\"" + edge.source + "\"";
    if(edge.target != null)
        xmlElement += " target=" + "\"" + edge.target + "\"";
    xmlElement += ">\n";

    if(edge.guard != "" && edge.guard != undefined)
    {

        xmlElement += "<guard xmi:type=\"uml:OpaqueExpression\" xmi:id=\"" + generateId() +"\">\n";
        xmlElement += "<body>";
        xmlElement += edge.guard;
        xmlElement += "</body>\n";
        xmlElement += "</guard>\n";
        xmlElement += "<weight xmi:type=\"uml:LiteralInteger\" xmi:id=\"" + generateId() + "\" value=\"1\"/>\n";
        xmlElement += "</edge>";
    } else {
        xmlElement += "<weight xmi:type=\"uml:LiteralInteger\" xmi:id=\"" + generateId() + "\" value=\"1\"/>\n";
        xmlElement += "</edge>";
    }
    return xmlElement;
    //< edge xmi: type = "uml:ControlFlow" xmi: id = "_dNPt1Ya_EeaGQIHr6EmBRw"
    //source = "_dNPtmoa_EeaGQIHr6EmBRw" target = "_dNPtm4a_EeaGQIHr6EmBRw" />
    //< edge xmi: type = "uml:ControlFlow" xmi: id = "_FqJqF7INEea1KOgZF_jStg" source = "_FqJp9LINEea1KOgZF_jStg" target = "_FqJqBrINEea1KOgZF_jStg" >
    //       < guard xmi: type = "uml:OpaqueExpression" xmi: id = "_FqJqGLINEea1KOgZF_jStg" >
    //            < body > a = 1 </ body >
    //        </ guard >
    //      < weight xmi: type = "uml:LiteralInteger" xmi: id = "_FqJqGbINEea1KOgZF_jStg" value = "1" />
    //         </ edge >
}

function generateId() {
    var length = id_length;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var newID = "";
    do
    {
        newID = "_";
        for (var i = 0; i < length; i++)
        {
            newID += chars[getRandomArbitrary(0,chars.length)];
        }
    } while (ids.includes(newID));

    ids.push(newID);

    return newID;
}

function getRandomArbitrary(min, max) {
    var rdm = parseInt(Math.random() * (max - min) + min);
    return rdm;//Math.random() * (max - min) + min;
}

function getRole(activity,name){
    function byName(role) {
        return role.name === name;
    }
    if (activity.roles.find(byName))
        return activity.roles.find(byName);
    else {
        //console.log(name +" role in activity "+ activity.name  +" not found !!");
        return undefined;
    }
}

function findOperation(opeNameOrId){
    function byName(operation){
        if(opeNameOrId.includes("("))
            opeNameOrId = opeNameOrId.substring(0,opeNameOrId.indexOf("("));
        return operation.name === opeNameOrId;
    }

    if (agent_operations.find(byName))
        return agent_operations.find(byName);

    return undefined;
}

function integrate2XMI(){

    // --  integrate this one
    //generated_activities
    // --  into this one
    //generated_xmi

    console.log("INTEGRATE 2 XMI");
    console.log(generated_activities);
    var insert_index = generated_xmi.indexOf("<-- Enter ownedBehavior here -->");
    console.log(insert_index);

    generated_xmi = generated_xmi.slice( 0, insert_index ).concat( generated_activities ).concat( generated_xmi.slice( insert_index) );

    insert_index = generated_xmi.indexOf("<-- Enter ownedBehavior here -->");
    generated_xmi.splice(insert_index, 1);

    insert_index = generated_xmi.indexOf("<-- Enter PlayAnimation here -->");
    generated_xmi = generated_xmi.slice( 0, insert_index ).concat( animations_localProfile ).concat( generated_xmi.slice( insert_index) );

    insert_index = generated_xmi.indexOf("<-- Enter PlayAnimation here -->");
    generated_xmi.splice(insert_index, 1);
}

var behaviors2Keep = [];
function isCommonBehavior(line){
    if(line) {
        for (var b in commonBehaviors)
            if (line.includes(commonBehaviors[b].name))
                return commonBehaviors[b];
    }
    return null;
}

function cleanXMIFile() {
    if(xmiFile){
        //OwnedBehavior
        var lines=xmiFile.split("\n");
        var index_start_behavior=-1;
        var index_end_behavior;
        for(var l in lines){
            var line = lines[l];
            if(line.includes("<packagedElement") && line.includes("name=\"Scenario\"")){
                index_start_behavior = parseInt(l) + 2;
            }
            if(index_start_behavior != -1){
                if(line.includes("ownedBehavior") && isCommonBehavior(line) != null){
                    var commonBe = {};
                    commonBe.name = isCommonBehavior(line).name;
                    commonBe.text = [];
                    var commonBeRecording = true;
                }
            }
            if(commonBeRecording)
                commonBe.text.push(line);
            if(line.includes("</ownedBehavior>")){
                if(commonBeRecording){
                    commonBeRecording = false;
                    behaviors2Keep.push(commonBe);
                }
                var next_index = parseInt(l)+1;
                var next_line = lines[next_index];
                if(next_line.includes("<ownedAttribute")){
                    index_end_behavior = next_index;
                }
            }

        }
        var nb_lines = lines.length;
        var cleaned_lines = lines.splice(0,index_start_behavior);
        var end_lines = lines.splice(index_end_behavior - cleaned_lines.length,nb_lines-1);

        cleaned_lines.push("<-- Enter ownedBehavior here -->");
        for(var b in behaviors2Keep){
            //get id and push in the the commonbehavior list
            var line = behaviors2Keep[b].text[0]; var id_index= line.indexOf("xmi:id=\"");
            var id_be = line.substring(id_index+8,line.length-1);var lastIndex = id_be.indexOf("\"");
            id_be = id_be.substring(0,lastIndex);

            for(var cb in commonBehaviors){
                if(commonBehaviors[cb].name == behaviors2Keep[b].name)
                    commonBehaviors[cb].id = id_be;
            }

            for(var l in behaviors2Keep[b].text) {
                cleaned_lines.push(behaviors2Keep[b].text[l]);
            }
        }
        cleaned_lines = cleaned_lines.concat(end_lines);

        lines = cleaned_lines;

        //Profile for Play Animation
        var index_start_playAnimation =-1; var index_stop_playAnimation =-1;
        for(var l in lines) {
            var line = lines[l];
            if (line.includes("LocalProfile:PlayAnimation") && index_start_playAnimation == -1)
                index_start_playAnimation = parseInt(l);
            if (line.includes("</xmi:XMI>") && index_stop_playAnimation == -1)
                index_stop_playAnimation = parseInt(l);
        }

        console.log("Play animation start " + index_start_playAnimation + "  stop " + index_stop_playAnimation);
        var nb_lines = lines.length;
        cleaned_lines = lines.splice(0,index_start_playAnimation);
        end_lines = lines.splice(index_stop_playAnimation - cleaned_lines.length,nb_lines-1);
        cleaned_lines.push("<-- Enter PlayAnimation here -->");
        cleaned_lines = cleaned_lines.concat(end_lines);

        lines = cleaned_lines;

        //Will have to take care of the owned attribute late too (including roles and objects)



        generated_xmi = lines;
        //document.getElementById('csvdata').innerText = lines.join('\n');
    }
}

function download_file(name, contents, mime_type) {
    mime_type = mime_type || "text/plain";

    var blob = new Blob([contents], {type: mime_type});

    var dlink = document.createElement('a');
    dlink.download = name;
    dlink.href = window.URL.createObjectURL(blob);
    dlink.onclick = function(e) {
        // revokeObjectURL needs a delay to work properly
        var that = this;
        setTimeout(function() {
            window.URL.revokeObjectURL(that.href);
        }, 1500);
    };

    dlink.click();
    dlink.remove();
}

function htmlSpecialChars(unsafe) {
    if(!unsafe)
        return "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&apos;")
        .replace(/"/g, "&quot;");
}



