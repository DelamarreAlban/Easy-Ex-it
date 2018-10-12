/**
 * Created by Alban on 18/06/2017.
 */

var vignette = {};
var android1 = document.getElementById("agent").value;
var player = "PlayerAuto";
var fromXMI = false;
var chart_graph = {};
var decisionNodes = [];

var activities = [];


var fileName = "";

document.getElementById("input-csv").addEventListener('change', function() {

    var reader = new FileReader();

    reader.addEventListener('load', function() {

        chart_graph = {};

        document.getElementById('csvdata').innerText = this.result;
        //csvFile = document.getElementById('file').innerText.toString();
        var csvFile = this.result.toString();
        parseCSV(csvFile);

    });

    reader.readAsText(document.querySelector("#input-csv").files[0]);
    fileName = document.querySelector("#input-csv").files[0].name;
    console.log("FILENAME : " + document.querySelector("#input-csv").files[0].name);
    //console.log("lala");
});

function csv2json(csv){

    var lines=csv.split("\n");

    //changing the comma to pipe in the quoted value
    for(var i=1;i<lines.length;i++) {
        if(lines[i].includes("\"")){
            var div = lines[i].split("\"");
            for(var k = 1;k <div.length;k+=2){
                    while (div[k].includes(","))
                        div[k] = div[k].replaceAt(div[k].indexOf(","), "|");
            }
            lines[i] = div[0];
            for(var k = 1;k <div.length;k++)
                lines[i] += "\"" + div[k];
        }
    }

    var result = [];

    headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){

        var obj = {};
        var currentLine=lines[i].split(",");

        for(var j=0;j<headers.length;j++){
            if(currentLine[j]) {
                while (currentLine[j].includes("|")) {
                    currentLine[j] = currentLine[j].replaceAt(currentLine[j].indexOf("|"), ",");
                }
                obj[headers[j]] = currentLine[j];
            }
        }

        result.push(obj);

    }

    //return result; //JavaScript object
    return result;
}

String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
};

function parseCSV(csv){
    console.log("############################################");
    vignette.data = csv2json(csv);
    console.log(vignette.data);

    vignette.page = [];
    vignette.node = [];
    vignette.line = [];
    for(var e in vignette.data){
        var element = vignette.data[e];
        if(element.Name == "Page")
            vignette.page.push(element);
        else if(element.Name == "Line")
            vignette.line.push(element);
        else
            vignette.node.push(element);
    }
    console.log("Vignette data " + vignette.data.length);
    console.log("Vignette page " + vignette.page.length);
    console.log("Vignette node " + vignette.node.length);
    console.log("Vignette line " + vignette.line.length);
    console.log(vignette.page.length + vignette.node.length +vignette.line.length);

    var multipleIndex = function(input,c){
        var result = [];

        for(var i in input){
            if(input[i] == c)
                result.push(i);
        }
        return result;
    };

    //Checking csv
    var csv_error_log = "";
    console.log(vignette.line);
    for(var l in vignette.line){
        var line = vignette.line[l];
        if(line["Line Source"] == "" && line["Line Destination"])
            csv_error_log += "Line "+line.Id+" goes from NOTHING to " + line["Line Destination"] +"\n";
        else if(line["Line Source"] && !line["Line Destination"])
            csv_error_log += "Line "+line.Id+" goes from "+line["Line Source"]+" to NOTHING \n";
        else if(line["Line Source"] == !line["Line Destination"])
            csv_error_log += "Line "+line.Id+" loops at "+line["Line Source"]+"\n";
    }
    console.log(vignette.node);
    var startNodeChecking = false;
    for(var n in vignette.node) {
        var node = vignette.node[n];
        var text = node["Text Area 1"];
        var carac2test = ['[',']','{','}','<','>'];
        if(text) {
            if(text.includes("START:"))
                startNodeChecking = true;
            if(node.Name == "Process" || node.Name == "Preparation" || node.Name == "Terminator" || node.Name == "Data (I/O)" || node.Name == "Decision") {
                var numbers = text.split('.');
                numbers[0] = numbers[0].replace("\"", "");
                if (isNaN(parseInt(numbers[0], 10))) {
                    csv_error_log += "Node " + node.Id + " does not start with a number \n";
                }
            }
			var thresholdCarac = 1;
            for (var c in carac2test) {
				if(carac2test[c] == "<" || carac2test[c] == ">")
					thresholdCarac = 2;
				else 
					thresholdCarac = 1;
                if (multipleIndex(text.split(''), carac2test[c]).length > thresholdCarac) {
                    csv_error_log += "Character " + carac2test[c] + " appears more than "+thresholdCarac+" times in " + node.Id + "\n";
                }
            }
        }
    }
    if(!startNodeChecking)
        csv_error_log += "No start node.... Please add: START: to the first node \n";
    if(csv_error_log != ""){
        console.log("ERROR IN CSV FILE")
        document.getElementById('csvdata').innerText = csv_error_log;
        return null;
    }

    console.log("VIGNETTE");
    console.log(vignette);

    chart_graph.edges = [];
    chart_graph.nodes = [];
    chart_graph.activity = [];
    chart_graph.group = [];

    for(var n in vignette.node)
        newGraphNode(vignette.node[n]);
    
    for(var l in vignette.line)
        newGraphEdge(vignette.line[l]);


    

    buildConnections(); //Feedback done here

    

    insertEndOfVignetteCallBehavior();

    setStartNode();
    setDecisionNode();

    setForkJoin();

    console.log(chart_graph);


    //Parallelize Speak + something
    setSpeakOperations();

    console.log("after");
    console.log(chart_graph);


    //When more than one operations with no speak -> Sequence
    setSequenceOfOperations();



    divideActivities();

    for(var a in activities) {
        insertFinalNode(activities[a]);
        insertInitialNode(activities[a]);

    }

    var counterN = 0;
    var counterE = 0;
    for(var a in activities) {
        for(var b in activities[a].nodes){
            if( activities[a].nodes[b].id == "")
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! " + activities[a].nodes[b].name );
            counterN ++;
        }
        for(var c in activities[a].edges){
            counterE ++;
            if(activities[a].edges[c].source && activities[a].edges[c].target == "")
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! " );
        }
    }
    console.log("COUNTERN : " + counterN);
    console.log("COUNTERE : " + counterN);

    buildActivity();

    for(var a in activities) {
        callBehaviorName(activities[a]);
    }
    
}

function newGraphNode(node){
    var newNodeCreation = false;
    var fjCounter = 0;
    var name = ""
    var body = {};
    if(node.Name == "Star" ||node.Name == "Text") {
        //Just ignore
    }
    else if (node.Name == "Display") {
                //Add this as a pin for choices
                name = node.Id;
                type = "specification";
                role = player;
                newNodeCreation = true;
                body.name = node["Text Area 1"];
    }
    else {
        var role = "";
        var text_body = node["Text Area 1"];
        if (text_body) {
            body = extractBodyInfo(text_body);

            name = body.name;
            var type = "type";
            if (node.Name == "Process")
                role = android1;
            else if (node.Name == "Decision") {
                role = player;
                type = "uml:DecisionNode";
            }
            else if (node.Name == "Merge") {
                role = android1;
                type = "uml:DecisionNode";
            }
            else if (node.Name == "Data (I/O)") {
                if (body.role) {
                    role = body.role;
                }
            }
            else if (node.Name == "Preparation" || node.Name == "Hexagon")
                role = player;

            
            newNodeCreation = true;
        }
        else if (node.Name == "Connector") {
            role = android1;
            name = "End_"+node.Id;
            type = "FinalNode";

            newNodeCreation = true;
        }
        else if (node.Name == "Horizontal Fork/Join"){
            name = "Fork/Join_"+fjCounter;
            fjCounter ++;
            type = "Fork/Join";
            role = android1;

            newNodeCreation = true;
        }
        else {console.log(node);
        }
    }



    if(newNodeCreation){
            name = name.replace(/ /g, '');
            var newNode = {
                "id": node.Id,
                "name": name,
                "type": type,
                "body": body,
                "role": role,
                "incoming": [],
                "outgoing": []
            };
            chart_graph.nodes.push(newNode);
        }
}

function extractBodyInfo(text){
    var body = {};
    body.operation = "";
    //console.log("Extract body info  ");
    //console.log(text);
    if(text.includes("START"))
        body.firstNode = true;

    //name
    //text = text.replace(/"/g, "");
    if(text[0] == "\"")
        text = text.slice(1);
    if(text[text.length] == "\"")
        text = text.slice(0,-1);

    text = text.replace(/""/g, "\"");

    var name_index = text.indexOf('.');
    body.name = text.substring(0, name_index);

    text = text.substring(name_index, text.length);

    //Agent if not disruptive
    var display_index_start = text.indexOf('{');
    var display_index_end = text.indexOf('}');
    if(display_index_start != -1 && display_index_end != -1) {
        body.role = text.substring(display_index_start + 1, display_index_end);
        text = text.substring(display_index_end, text.length);
        //body.operation = "Speak";
    }

    //Display
    var display_index_start = text.indexOf('[');
    var display_index_end = text.indexOf(']');
    if(display_index_start != -1 && display_index_end != -1) {
        body.body = text.substring(display_index_start + 1, display_index_end);
        text = text.substring(display_index_end, text.length);
        body.operation = "Speak ";
    }

    //Operation
    var ope_index_start = text.lastIndexOf('<');
    var ope_index_end = text.indexOf('>');
    if(ope_index_start != -1 && ope_index_end != -1) {
        var o = text.substring(ope_index_start + 1, ope_index_end);
        body.operation += o + " ";
        if(isCommonBehavior(o)) {
            body.operation += "WaitingForBehavior" + " ";
        }
    }

    /*
        console.log("name " + body.name);
        console.log("body " + body.body);
        console.log("operation " + body.operation);
    */
    if(text.startsWith("(")){
        body.name = text;
    }

        body.operation = body.operation.substring(0, body.operation.length - 1);
    return body;
}

function newGraphEdge(edge){
    if(edge["Line Connection Start"] != "" && edge["Line Connection End"] != "") {
        var newEdge = {
            "weight": {},
            "id": edge.Id,
            "type": "uml:ControlFlow",
            "source": edge["Line Source"],
            "name": "ControlFlow",
            "target": edge["Line Destination"],
            "index": edge.Id,
            "guard": ""
        };
        chart_graph.edges.push(newEdge);
    }
}

//Feedback is here
function buildConnections(){
    var lines2RemoveIndex = [];
    var choiceNodes = [];
    for(var l in chart_graph.edges){
        var line = chart_graph.edges[l];
        var source = getNode(line.source);
        if(source) {
            if (source.type == "specification") {

                //take care of feedback here
                var feedback = getFeedback(source.body.name);
                var target = getNode(line.target);
                if(target) {
                    console.log("Assigning feedback");
                    target.body.feedback = feedback;
                    choiceNodes.push(target);
                }

                chart_graph.nodes.splice(chart_graph.nodes.indexOf(source),1);
                lines2RemoveIndex.push(line);
            }
            else {
                source.outgoing.push(line.id);
                var target = getNode(line.target);
                if (target)
                    target.incoming.push(line.id);
            }
        }
    }
    for(var l in lines2RemoveIndex) {
        chart_graph.edges.splice(chart_graph.edges.indexOf(lines2RemoveIndex[l]), 1);
    }
}

function getFeedback(feedbackText){
    var feedback = {};

    //Feedback empty if not specified
    feedback.quantitative ="";
    feedback.strategy = "";
    feedback.qualitative = "";

    //Example:
    //(1) {} Great idea to provide a physical prompt which increases the likelihood that Michael will begin reading in the correct place, along with smiling back at him.

    var display_index_start = feedbackText.indexOf('(');
    var display_index_end = feedbackText.indexOf(')');
    if (display_index_start != -1 && display_index_end != -1) {
        feedback.quantitative = feedbackText.substring(display_index_start + 1, display_index_end);
        feedbackText = feedbackText.substring(display_index_end, feedbackText.length);
        //body.operation = "Speak";
    }
    var display_index_start = feedbackText.indexOf('{');
    var display_index_end = feedbackText.indexOf('}');
    if (display_index_start != -1 && display_index_end != -1) {
        feedback.strategy = feedbackText.substring(display_index_start + 1, display_index_end);
        feedbackText = feedbackText.substring(display_index_end, feedbackText.length);
        //body.operation = "Speak";
    }

    var display_index_start = feedbackText.indexOf(' ');
    feedback.qualitative = feedbackText.substring(display_index_start+1, feedbackText.length);
    return feedback;
}

//Change name here to call the endofvignette behavior
//Also Add ReceiveFeedback operation
function insertEndOfVignetteCallBehavior(){
    var fCounter = 0;
    for(var n in chart_graph.nodes){
        if(chart_graph.nodes[n].type == "FinalNode"){
            var callFinalBehaviorNode = chart_graph.nodes[n];

            callFinalBehaviorNode.name = "FinalNode_" + fCounter;
            fCounter ++;
            callFinalBehaviorNode.type = "uml:CallBehaviorAction";
            callFinalBehaviorNode.body = {};
            callFinalBehaviorNode.body.behavior = "FinalBehavior";
            callFinalBehaviorNode.role = android1;
        }
    }
}

function setForkJoin(){
    var fCounter = 0;
    var jCounter = 0;
    for(var n in chart_graph.nodes){
        if(chart_graph.nodes[n].type == "Fork/Join"){
            if(chart_graph.nodes[n].outgoing.length > 1){
                //Fork
                var forkNode = chart_graph.nodes[n];
                //forkNode.id = generateId();
                forkNode.name = "fork_" + fCounter;
                fCounter ++;
                forkNode.type = "uml:ForkNode";
                forkNode.body = {};
            }
            if(chart_graph.nodes[n].incoming.length > 1){
                //Join
                var joinNode = chart_graph.nodes[n];
                //joinNode.id = generateId();
                joinNode.name = "join_" + jCounter;
                jCounter ++;
                joinNode.type = "uml:JoinNode";
                joinNode.body = {};
            }
            
        }
    }
}

//Make sure that no call behavior in activity have the same name
function callBehaviorName(activity){
    var names = [];
    var counter =0;
    for(var n in activity.nodes){
        if(activity.nodes[n].type == "uml:CallBehaviorAction"){
            if(names.includes(activity.nodes[n].name)){
                activity.nodes[n].name += "_" + counter++;
            }
            names.push(activity.nodes[n].name);
        }
    }
}


function buildActivity() {

    console.log("ACTIVITIES");
    console.log(activities);

    for(var ac in activities)
        chart_graph.activity.push(activities[ac]);
}

function setSpeakOperations(){
    var toRemove = [];
    var toAdd = [];
    var counter = 0;
    for(var n in chart_graph.nodes){
        if(chart_graph.nodes[n].body && chart_graph.nodes[n].body.operation) {
            if(chart_graph.nodes[n].body.operation.split(' ').length > 1 && chart_graph.nodes[n].body.operation.includes("Speak")){
                toRemove.push(chart_graph.nodes[n]);
                //console.log(counter++ + " id: "+chart_graph.nodes[n].id + " " + chart_graph.nodes[n].name);

            }
        }
    }

    //Remove node and add two new nodes
    console.log(toRemove);
    
    for(var n in toRemove) {
        chart_graph.nodes.splice(chart_graph.nodes.indexOf(toRemove[n]), 1);
        var parallelNodes = divideSpeakNode(toRemove[n]);
        //console.log("new sequence");
        //console.log(parallelNodes);
        toAdd = toAdd.concat(parallelNodes)
    }
    //console.log(chart_graph.nodes.length);
    console.log("parallel and Sequence of operations");
    console.log(toAdd);
    for (var pn in toAdd) {
        chart_graph.nodes.push(toAdd[pn]);
    }
    
}

function setSequenceOfOperations(){
    var toRemove = [];
    var toAdd = [];
    var counter = 0;
    for(var n in chart_graph.nodes){
        if(chart_graph.nodes[n].body && chart_graph.nodes[n].body.operation) {
            if(chart_graph.nodes[n].body.operation.split(' ').length > 1){
                toRemove.push(chart_graph.nodes[n]);
                //console.log(counter++ + " id: "+chart_graph.nodes[n].id + " " + chart_graph.nodes[n].name);

            }
        }
    }

    //Remove node and add two new nodes
    //console.log(chart_graph.nodes.length);
    for(var n in toRemove) {
        chart_graph.nodes.splice(chart_graph.nodes.indexOf(toRemove[n]), 1);
        var parallelNodes = divideNode(toRemove[n]);
        //console.log("new sequence");
        //console.log(parallelNodes);
        toAdd = toAdd.concat(parallelNodes)
    }
    //console.log(chart_graph.nodes.length);
    console.log("Sequence of operations");
    console.log(toAdd);
    for (var pn in toAdd) {
        chart_graph.nodes.push(toAdd[pn]);
    }
}

//Parallelizes speak and actions
function divideSpeakNode(node){
    //We check for parallelization of actions(Speak + other actions)
    //console.log(chart_graph);
    //console.log(node);
    
    var newNodes = [];
    var operations = node.body.operation.split(' ');
    if (operations.length > 1 && operations.indexOf("Speak") != -1) {
        var parallelNodes = [];
        for (var o in operations) {
            var op = operations[o];
            if (op === "Speak") {
                var body = {};
                body.name = node.name + "_speak";
                body.body = node.body.body;
                body.operation = op;
                var speakNode = {
                    "id": node.id + "_speak",
                    "name": node.name + "_speak",
                    "type": node.type,
                    "body": body,
                    "role": node.role,
                    "incoming": [node.incoming[0]],
                    "outgoing": [node.outgoing[0]]
                };
                if(node.soundId)
                    speakNode.soundId = node.soundId;
                //console.log("speaknodes    " + speakNode.name);
                parallelNodes.push(speakNode);
            }
        }
        operations.splice(operations.indexOf("Speak"), 1);
        node.body.operation = operations.join(" ");
        parallelNodes.push(node);

        //parallelize
        console.log("EDGES");
        console.log(chart_graph.edges);

        createParallel(parallelNodes);
        newNodes = newNodes.concat(parallelNodes);

    }
    return newNodes;
    
}


//Sequences actions which are no speak
function divideNode(node){

    //And finally the sequence of actions

    //Newnodes are added after the loop in setSequenceOfOperations
    var newNodes = [];

    var operations = node.body.operation.split(' ');
    //Sequence of operation
    if (operations.length > 1) {
        var sequenceNodes = [];
        for (var o in operations) {
            var op = operations[o];
            var body = {};
            body.name = node.name + "_" + o;
            body.body = node.body.body;
            body.operation = operations[o];
            body.feedback = node.body.feedback;
            var newNode = {
                "id": node.id + "_" + o,
                "name": node.name + "_" + o,
                "type": node.type,
                "body": body,
                "role": node.role,
                "incoming": [node.incoming[0]],
                "outgoing": [node.outgoing[0]]
            };
            sequenceNodes.push(newNode);
        }
        
        createSequence(sequenceNodes);
        newNodes = newNodes.concat(sequenceNodes);
        //console.log(newNodes);

    }
    return newNodes;
}



function createParallel(parallel_nodes){
    //create fork and join
    //redirect input and output edges to/from fork and join
    //create connections inside fork
    //

    console.log(parallel_nodes);
    var incoming = getEdge(parallel_nodes[0].incoming[0]);
    var outgoing = getEdge(parallel_nodes[0].outgoing[0]);
    var role = parallel_nodes[0].role;

    var forkId= generateId();
    var joinId = generateId();

    var emptyBody = {};
    //Create fork + n new edges for connections
    var newFork = {
        "id": forkId,
        "name": "Fork_" + forkId.substring(0,4),
        "type": "uml:ForkNode",
        "body": emptyBody,
        "role": role,
        "incoming": [incoming.id],
        "outgoing": []
    };
    var listForkOutgoId = [];
    for(var n in parallel_nodes){
        var newEdgeId = generateId();
        var newEdge = {
            "weight": {},
            "id": newEdgeId,
            "xmi_type": "uml:ControlFlow",
            "source": forkId,
            "name": "ControlFlow",
            "target": parallel_nodes[n].id,
            "index": chart_graph.edges.length+1,
            "guard": ""
        };
        parallel_nodes[n].incoming = [];
        parallel_nodes[n].incoming[0] = newEdgeId;
        listForkOutgoId.push(newEdgeId);
        chart_graph.edges.push(newEdge);
    }
    incoming.target = forkId;
    newFork.outgoing = listForkOutgoId;

    //Create Join + n new edges for connections

    var listJoinIncoId = [];
    var counter = 0;
    for(var n in parallel_nodes){
        var newEdgeId = generateId();
        var newEdge = {
            "weight": {},
            "id": newEdgeId,
            "xmi_type": "uml:ControlFlow",
            "source": parallel_nodes[n].id,
            "name": "ControlFlow",
            "target": joinId,
            "index": chart_graph.edges.length+1,
            "guard": ""
        };
        parallel_nodes[n].outgoing[0] = [];
        parallel_nodes[n].outgoing[0] = newEdgeId;
        listJoinIncoId.push(newEdgeId);
        chart_graph.edges.push(newEdge);


    }
    var newJoin = {
        "id": joinId,
        "name": "Join_"+joinId.substring(0,4),
        "type": "uml:JoinNode",
        "body": emptyBody,
        "role": role,
        "incoming": listJoinIncoId,
        "outgoing": []
    };
    //for end nodes which have no outgoing no need to do that
    if(outgoing) {
        newJoin.outgoing[0] = outgoing.id;
        outgoing.source = joinId;
    }


    parallel_nodes.push(newFork);
    parallel_nodes.push(newJoin);
}

function createSequence(nodes){
    //console.log("Divided nodes:");
    //console.log(nodes);

    var incoming_edge = getEdge(nodes[0].incoming[0]);
    var outgoing_edge = getEdge(nodes[0].outgoing[0]);
    //console.log("Incoming edge "+ incoming_edge.id  +" from " + incoming_edge.source + " to " + incoming_edge.target);
    //if(outgoing_edge != undefined)
    //    console.log("Outgoing edge "+ outgoing_edge.id  +" from " + outgoing_edge.source + " to " + outgoing_edge.target);
    //console.log(incoming_edge);
    //console.log(outgoing_edge);

    for(var n in nodes) {
        if(nodes[n] == nodes[nodes.length - 1]){
            //For last node change source of outgoing edge
            if(outgoing_edge != undefined) {
                outgoing_edge.source = nodes[n].id;
                //console.log("last node in sequence, modifying outgoing edge..");
                //console.log("Outgoing edge from " + outgoing_edge.source + " to " + outgoing_edge.target);
            }
            else{
                //console.log("End node, no outgoing edge");
            }
        }else {
            //create new edge and connect with next one in the sequence

            var newEdgeId = generateId();
            var newEdge = {
                "weight": {},
                "id": newEdgeId,
                "xmi_type": "uml:ControlFlow",
                "source": nodes[n].id,
                "name": "ControlFlow",
                "target": nodes[ parseInt(n) + 1].id,
                "index": chart_graph.edges.length + 1,
                "guard": ""
            };

            if (nodes[n] == nodes[0]) {
                incoming_edge.target = nodes[n].id;
                //console.log("first node in sequence, modifying incoming edge..");
                //console.log("Incoming edge from " + incoming_edge.source + " to " + incoming_edge.target);
            }

            nodes[n].outgoing = [newEdgeId];
            nodes[ parseInt(n) + 1].incoming = [newEdgeId];
            chart_graph.edges.push(newEdge);

            //console.log(nodes[n].id);
            //console.log("NEW EDGE " + newEdgeId +"  from " + newEdge.source + "  to  " + newEdge.target);
        }
    }
}

function setStartNode(){
    console.log("setStartNode");
    var csvInitNode;

    for(var n in chart_graph.nodes){
        if(chart_graph.nodes[n].body.firstNode)
            csvInitNode = chart_graph.nodes[n];
    }

    console.log("START NODE");
    console.log(csvInitNode);
    var initNode_id = generateId();
    var initEdge = {
        "weight": {},
        "id": generateId(),
        "xmi_type": "uml:ControlFlow",
        "name": "ControlFlow",
        "source" : initNode_id,
        "target": csvInitNode.id,
        "index": chart_graph.edges.length+1,
        "guard": ""
    };

    var initNode = {
        "id": initNode_id,
        "name": "initialNode",
        "type": "uml:InitialNode",
        "body": "",
        "role": csvInitNode.role,
        "incoming": [],
        "outgoing": [initEdge.id],
        "argument": {}
    };
    csvInitNode.incoming = [initEdge.id];

    chart_graph.nodes.push(initNode);
    chart_graph.edges.push(initEdge);

    //to create the root activity
    decisionNodes.push(initNode);
}

function setDecisionNode(){
    //Operation on decision node
    //Inserting decision operation and choice operations
    for(var n in chart_graph.nodes){
        if(chart_graph.nodes[n].type === "uml:DecisionNode"){
            var decisionNode = chart_graph.nodes[n];
            var role = decisionNode.role;
            if(role == player) //Should not be playerAuto since we are waiting for a human action
                role = "Player";
            insertDecisionOperation(chart_graph.nodes[n]);
            var nodes = [];
            for(var e in chart_graph.nodes[n].outgoing){
                //console.log(chart_graph.nodes[n].outgoing);

                getEdge(chart_graph.nodes[n].outgoing[e]).guard = role+".decisionValue=" + parseInt(e);
                nodes.push(getNode(getEdge(chart_graph.nodes[n].outgoing[e]).target));
            }
            //console.log(nodes);
            insertChoiceOperations(nodes,role);
        }
    }

}

function setSoundPlayingNode(){
    console.log("SOUND PLAY NODES");
    for(var n in chart_graph.nodes) {
        if(chart_graph.nodes[n].body.operation) {
            if (chart_graph.nodes[n].body.operation.includes("Speak")) {
                //console.log("Inserting audio sound : " + chart_graph.nodes[n].body.name);
                chart_graph.nodes[n].soundId = chart_graph.nodes[n].body.name;
            }
            /*var opes = chart_graph.nodes[n].body.operation.split(' ');
            console.log(opes);
            for (var o in opes) {
                if (sounds.includes(opes[o])) {
                    //console.log("Operation is a sound : " + opes[o]);
                    var os = chart_graph.nodes[n].body.operation.split(' ');
                    os.splice(os.indexOf(opes[o]), 1);
                    chart_graph.nodes[n].body.operation = os.join(' ');
                    chart_graph.nodes[n].soundId = opes[o];
                }
            }
            */
        }
    }
}

function insertDecisionOperation(node){
    //console.log("Insert decision " + node.name);
    //insert decision operation before decisionNode
    //var incoming_edge = getEdge(node.incoming[0]);

    var activityName = "Decision_" + node.name;

    var decisionNode_id = generateId();
    var newEdgeId = generateId();
    var body = {};
    body.name = "Decision_" + node.name;
    body.operation = "Decision";

    var decisionNode = {
        "id": decisionNode_id,
        "name": body.name,
        "type": "type",
        "body": body,
        "role": node.role,
        "incoming": node.incoming.slice(0),
        "outgoing": [newEdgeId]
    };
    //It may have various input due to the loop removal
    for(var e in node.incoming)
        node.incoming[e].target = decisionNode_id;
    node.incoming = [newEdgeId];

    var newEdge = {
        "weight": {},
        "id": newEdgeId,
        "xmi_type": "uml:ControlFlow",
        "source": decisionNode_id,
        "name": "ControlFlow",
        "target": node.id,
        "index": chart_graph.edges.length + 1,
        "guard": ""
    };

    chart_graph.nodes.push(decisionNode);
    decisionNodes.push(decisionNode);
    chart_graph.edges.push(newEdge);

    insertCallBehavior(decisionNode,activityName);
}

function insertCallBehavior(node, nextActivity){
    //insert callBehavior before node to call nextActivity
    var incomingID = [];
    //Handle multiple inputs due to loop removals
    for(var e in node.incoming) {
        var incoming_edge = getEdge(node.incoming[e]);

        var callBeNode_id = generateId();
        var newEdgeId = generateId();
        var type = "uml:CallBehaviorAction";
        var body = {};
        body.behavior = nextActivity;

        var callBeNode = {
            "id": callBeNode_id,
            "name": nextActivity,
            "type": type,
            "body": body,
            "role": node.role,
            "incoming": [incoming_edge.id],
            "outgoing": [newEdgeId]
        };
        incoming_edge.target = callBeNode_id;
        incomingID.push(newEdgeId);

        var newEdge = {
            "weight": {},
            "id": newEdgeId,
            "xmi_type": "uml:ControlFlow",
            "source": callBeNode_id,
            "name": "ControlFlow",
            "target": node.id,
            "index": chart_graph.edges.length + 1,
            "guard": ""
        };

        chart_graph.nodes.push(callBeNode);
        chart_graph.edges.push(newEdge);
    }
    node.incoming = incomingID.slice(0);
}

//Choice nodes are attributed to Player role
//Other player actions to PlayerAuto
function insertChoiceOperations(nodes,role) {
    //Insert choice node based on the different options a each decision node
    for (var n in nodes) {
        var node = nodes[n];
        //console.log(node);

        var incoming_edge = getEdge(node.incoming[0]);

        var choiceNode_id = generateId();
        var newEdgeId = generateId();
        var body = {};
        body.name = "choice_" + node.name;
        body.operation = "Choice";
        body.feedback = {};
		
		//in case of no feedback (1)
        if(typeof node.body.feedback == typeof undefined)
		{
			node.body.feedback={};
			node.body.feedback.qualitative="-1";
			node.body.feedback.strategy="-1";
			node.body.feedback.quantitative="-1";
		}
		body.feedback.qualitative = node.body.feedback.qualitative;
		
        body.feedback.strategy = node.body.feedback.strategy;
        body.feedback.quantitative = node.body.feedback.quantitative;

        var opes = node.body.operation.split(" ");
        body.body = "";
        /*if(opes.length >1){
            opes.shift();
            body.body = opes.join(" ");
            body.body += " ";
        }*/
        body.body += node.body.body;
        //console.log(body.name);
        //console.log(body);
        var choiceNode = {
            "id": choiceNode_id,
            "name": body.name,
            "type": "type",
            "body": body,
            "role": role,
            "incoming": node.incoming.slice(0),
            "outgoing": [newEdgeId]
        };
        incoming_edge.target = choiceNode_id;


        var newEdge = {
            "weight": {},
            "id": newEdgeId,
            "xmi_type": "uml:ControlFlow",
            "source": choiceNode_id,
            "name": "ControlFlow",
            "target": node.id,
            "index": chart_graph.edges.length + 1,
            "guard": ""
        };
        node.incoming = [newEdgeId];
        //console.log("CHOICE NODE");
        //console.log(choiceNode);
        chart_graph.nodes.push(choiceNode);
        chart_graph.edges.push(newEdge);
    }
}

function divideActivities(){
    //Create one activity per decision node
    for(var n in decisionNodes){
        var activity = {};
        activity.name = decisionNodes[n].name;
        activity.id = generateId();
        decisionNodes[n].activity = activity.name;
        acquireBranch(decisionNodes[n],activity.name);
        if(decisionNodes[n].type != "uml:InitialNode")
            decisionNodes[n].name = "DECISION";

        activities.push(activity);
    }

    console.log(activities);

    for(var a in activities) {
        activities[a].nodes = [];
        activities[a].edges = [];
        for (var n in chart_graph.nodes) {

            if (activities[a].name == chart_graph.nodes[n].activity) {
                activities[a].nodes.push(chart_graph.nodes[n]);
            }
        }
    }

    for(var e in chart_graph.edges){
        var edge = chart_graph.edges[e];
        var source = getNode(edge.source);

        var target = getNode(edge.target);

        //console.log(edge);
        //console.log("source");
        //console.log(source);
        //console.log("target");
        //console.log(target);
        if(source && target){
            //if(source.activity && target.activity) {
                if (source.activity == target.activity) {
                    edge.activity = source.activity;
                    //console.log(edge);
                    getActivity(edge.activity).edges.push(edge);
                }
                else{
                    //console.log("Check for duplicate edges around " + source.name);
                }
            //}
        }
    }
}

function checkActivity(node){
    if(!node.activity){
        var parent = getParent(node,0);
        if(!parent.activity) {
            console.log("PARENT HAS NO ACTIVITY!");
            //checkActivity(parent);
        }

        if(parent.activity){
            node.activity = parent.activity;
            //
        }
    }
}

function getParent(node,index){
    console.log(node);

    var parent = getNode(getEdge(node.incoming[index]).source);
    console.log(parent);
    return parent;
}

function acquireBranch(node, activityName){
    console.log(node);
    var nodes = [];
    nodes = nodes.concat(getNextNodes(node));
    while(nodes.length > 0){
        var currentNode = nodes.pop();
        //console.log("Acquire new node");
        //console.log(currentNode);
        if(!currentNode.activity){
            console.log("Add Node " + currentNode.name + " to activity " + activityName);
            //console.log(currentNode.name + "   " + currentNode.id);
            currentNode.activity = activityName;
            if(currentNode.type == "uml:CallBehaviorAction"){
                for(var e in currentNode.outgoing)
                    removeEdge(getEdge(currentNode.outgoing[e]));
            }
            var nextNodes = getNextNodes(currentNode);
            nodes = nodes.concat(nextNodes);
            //console.log("NODES")
            //console.log(nodes);
        }
    }
}

function insertInitialNode(activity) {
    //Find first node (The decision one)
    //Insert initial node + edge

    var startNode = null;
    for (var n in activity.nodes) {
        if (activity.nodes[n].body.operation == "Decision") {
            startNode = activity.nodes[n];
        }
    }

    if (startNode != null) {
        var initNode_id = generateId();
        var initEdge = {
            "weight": {},
            "id": generateId(),
            "xmi_type": "uml:ControlFlow",
            "name": "ControlFlow",
            "source" : initNode_id,
            "target": startNode.id,
            "index": chart_graph.edges.length+1,
            "guard": ""
        };

        var initNode = {
            "id": initNode_id,
            "name": "Initial Node",
            "type": "uml:InitialNode",
            "body": "",
            "role": startNode.role,
            "incoming": [],
            "outgoing": [initEdge.id],
            "argument": {}
        };
        startNode.incoming = [initEdge.id];

        activity.nodes.push(initNode);
        activity.edges.push(initEdge);
    }
    else{
        console.log("Start node not found for " + activity.name + " activity");
    }
}

function insertFinalNode(activity){
    //Insert join node and final node
    //Any node which has no outgoing edge is plug into the join node
    //To apply after activities has been divided

    //console.log(activity.name);
    //console.log(activity);
    var finalEdges = [];
    for(var n in activity.nodes){
        if(activity.nodes[n].outgoing.length == 0 || (activity.nodes[n].outgoing.length == 1 && activity.nodes[n].outgoing[0] == undefined ) ){
            //console.log("end node : " + activity.nodes[n].id);
            var newEdge = {
                "weight": {},
                "id": generateId(),
                "xmi_type": "uml:ControlFlow",
                "source": activity.nodes[n].id,
                "name": "ControlFlow",
                "target": "",
                "index": chart_graph.edges.length+1,
                "guard": ""
            };
            finalEdges.push(newEdge);
        }
    }

    if(finalEdges.length > 1) {
        //console.log("insert final node to " + activity.name + " for " + finalEdges.length + " end nodes");
        var finalEdge_id = generateId();
        var joinNode = {
            "id": generateId(),
            "name": "Fork/Join",
            "type": "uml:JoinNode",
            "body": {},
            "role": android1,
            "incoming": [],
            "outgoing": [finalEdge_id]
        };

        var finalNode_id = generateId();
        var finalEdge = {
            "weight": {},
            "id": finalEdge_id,
            "xmi_type": "uml:ControlFlow",
            "source": joinNode.id,
            "name": "ControlFlow",
            "target": finalNode_id,
            "index": chart_graph.edges.length+1,
            "guard": ""
        };


        var finalNode = {
            "id": finalNode_id,
            "name": "Activity Final Node",
            "type": "uml:ActivityFinalNode",
            "body": {},
            "role": android1,
            "incoming": [finalEdge_id],
            "outgoing": []
        };
        for(var e in finalEdges) {
            joinNode.incoming.push(finalEdges[e].id);
            finalEdges[e].target = [joinNode.id];

        }
        activity.nodes.push(joinNode);
        activity.nodes.push(finalNode);
        activity.edges.push(finalEdge);

        activity.edges = activity.edges.concat(finalEdges);
    }
    else if(finalEdges.length == 1){
        //only one node here
        console.log("insert final node to " + activity.name + " for one end node");

        var finalNode = {
            "id": generateId(),
            "name": "Activity Final Node",
            "type": "uml:ActivityFinalNode",
            "body": {},
            "role": android1,
            "incoming": [finalEdges[0].id],
            "outgoing": []
        };

        activity.nodes.push(finalNode);
        activity.edges.push(finalEdges[0]);
    }
}

function removeEdge(edge){
    var source = getNode(edge.source);
    for(var e in source.outgoing){
        if(source.outgoing[e] == edge.id){
            source.outgoing.splice(source.outgoing.indexOf(edge.id), 1);
        }
    }

    var target = getNode(edge.target);
    for(var e in target.incoming){
        if(target.incoming[e] == edge.id){
            target.incoming.splice(target.incoming.indexOf(edge.id), 1);
        }
    }
}

function getNextNodes(node){
    var nextNodes = [];
    for(var e in node.outgoing){
        var edge = getEdge(node.outgoing[e]);
        if(edge){
            var newNode = getNode(edge.target);
            if(newNode)
                nextNodes.push(newNode);
        }

    }
    //console.log("GET NEXT NODES");
    //console.log(nextNodes);
    return nextNodes;
}

function getNode(idOrNameOrType) {
    function byId(node) {
        return node.id === idOrNameOrType;
    }

    function byName(node) {
        return node.name === idOrNameOrType;
    }

    function byType(node) {
        return node.type === idOrNameOrType;
    }

    if (chart_graph.nodes.find(byId))
        return chart_graph.nodes.find(byId);
    else if (chart_graph.nodes.find(byName))
        return chart_graph.nodes.find(byName);
    else if (chart_graph.nodes.find(byType))
        return chart_graph.nodes.find(byType);
    else {
        console.log(idOrNameOrType+" Node not found !!");
        return null;
    }
}
function getNodeInActivity(idOrNameOrType,activity) {
    function byId(node) {
        return node.id === idOrNameOrType;
    }

    function byName(node) {
        return node.name === idOrNameOrType;
    }

    function byType(node) {
        return node.type === idOrNameOrType;
    }

    if (activity.nodes.find(byId))
        return activity.nodes.find(byId);
    else if (activity.nodes.find(byName))
        return activity.nodes.find(byName);
    else if (activity.nodes.find(byType))
        return activity.nodes.find(byType);
    else {
        console.log(idOrNameOrType+" Node not found in " + activity.name);
        return null;
    }
}
function getEdge(id) {
    if( id == 78)
        console.log("EDGE 78");
    function byId(edge) {
        return edge.id === id;
    }

    if (chart_graph.edges.find(byId))
        return chart_graph.edges.find(byId);
    else {
        console.log(id+ " Edge not found !!");
        return null;
    }
}
function getEdgeInActivity(id,activity) {
    function byId(edge) {
        return edge.id === id;
    }

    if (activity.edges.find(byId))
        return activity.edges.find(byId);
    else {
        console.log(id+ " Edge not found in "+ activity.name);
        return null;
    }
}

function getActivity(name) {
    function byName(ac) {
        return ac.name === name;
    }
    function approx(ac){
        if(name.includes(ac.name))
            return ac.name;
    }

    if (activities.find(byName))
        return activities.find(byName);
    else if(activities.find(approx))
        return activities.find(approx);
    else {
        console.log(name + " Activity not found !!");
        return null;
    }
}
