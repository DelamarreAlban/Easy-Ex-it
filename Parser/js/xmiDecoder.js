/**
 * Created by Alban on 13/06/2017.
 */

var graph = {};
var activityName = "JordanIsLate";
var rootActivityName = "JordanIsLate";
var initNode; var initEdge;
var finalActivityName = "final_node";
var activities = [];
var fromXMI = true;
/*
d3.json("/temp_data/test_tracking.json", function(error, data) {
    console.log("LOADING JSON");
    if (error) throw error;
    console.log(data);
    graph.data = data;
});*/

function removeRecordingPath() {
    //Names in the activity diagram need to be set according to these ones
    //var initNode = getNode("Initial Node");
    var initNode = getNode("uml:InitialNode");
    var forkNode = getNode("ForkRecord");
    var recordNode = getNode("Record_Action");
    var joinNode = getNode("JoinRecord");
    var endRecordNode = getNode("EndRecording_Action");
    //var finalNode = getNode("Activity Final Node"); "uml:ActivityFinalNode"
    var finalNode = getNode("uml:ActivityFinalNode");

    if(forkNode && initNode) {
        //console.log("fork + init");
        changeSourceNode(forkNode, initNode);
        removeAllLinks(forkNode);
    }


    if(endRecordNode && finalNode) {
        //console.log("endRecordNode + finalNode");
        changeTargetNode(endRecordNode, finalNode);
        removeAllLinks(endRecordNode);
    }

    if(joinNode && finalNode)
        changeTargetNode(joinNode, finalNode);

    if(recordNode && joinNode) {
        //console.log("recordNode + joinNode");
        removeAllLinks(recordNode);

        removeAllLinks(joinNode);
    }

    if(recordNode)
        removeNode(recordNode);
    if(endRecordNode)
        removeNode(endRecordNode);
    if(forkNode)
        removeNode(forkNode);
    if(joinNode)
        removeNode(joinNode);

}

function removeJoin() {
    for (var n in graph.nodes) {
        var node = graph.nodes[n];
        if (node.xmi_type == "uml:JoinNode") {

            var inco = getIncoming(node);
            var outgo = getOutgoing(node);
            for (var i in inco) {
                var inLink = inco[i];
                for (var o in outgo) {
                    changeLinkTarget(inLink, getNode(outgo[o]._target));
                }
            }
            removeAllLinks(node);
            removeNode(node);
        }
    }
}

function removeDecisionMergeNodes() {
    for (var n in graph.nodes) {
        var node = graph.nodes[n];
        if (node.xmi_type == "uml:DecisionNode") {
            var outgo = getOutgoing(node);
            for (var l in outgo) {
                var link = outgo[l];
                changeLinkSource(link, getNode(getIncoming(node)[0]._source));
            }
            removeAllLinks(node);
            removeNode(node);
        }
    }
}

function xmiDecoder() {
    console.log("VIGNETTE TREE DECODING !!!!");

    graph.links = [];
    graph.nodes = [];
    graph.activity = [];
    graph.group = [];
    console.log(graph.data);
    if (graph.data.xmi_XMI) {
        console.log("xmi file!!");
        graph.model = graph.data.xmi_XMI.uml_Model;
        if (graph.model) {
            console.log("model found");
            var packagedElement = graph.model.packagedElement;
            for (var package in packagedElement) {
                if (packagedElement[package]._name == "Scenario") {
                    console.log("scenario found");
                    graph.scenario = packagedElement[package];
                }

            }

            if (graph.scenario) {
                for (var package in graph.scenario.packagedElement) {
                    if (graph.scenario.packagedElement[package]._name == "Team") {
                        console.log("Team found");
                        graph.team = graph.scenario.packagedElement[package];
                    }
                }
                if(graph.team){
                    //Get activities
                    for (var activity in graph.team.ownedBehavior) {
                        if (graph.team.ownedBehavior[activity].xmi_type == "uml:Activity") {
                            graph.activity.push(graph.team.ownedBehavior[activity]);
                        }
                    }
                    console.log(graph.activity.length + " activities found!");
/*
                    //Get partitions
                    for (var partition in graph.team.ownedAttribute) {
                        graph.partition.push(graph.team.ownedAttribute[partition]);
                    }
                    console.log(graph.partition.length + " partitions found!");*/
                }
            }
        }

        console.log("activity ");
        console.log(graph.activity);

        //SETTING NODES AND LINKS -- REMOVING Fork/Join duplicate

        var xmi_activity = graph.activity[graph.activity.map(function (x) {
            return x._name;
        }).indexOf(activityName)];
        if(!initNode) {
            graph.nodes = xmi_activity.node;
            graph.edges = xmi_activity.edge;
            initNode = getNode("uml:InitialNode");
            initEdge = getEdge(initNode._outgoing);
        }

        for(var i in graph.activity) {
            var xmi_activity = graph.activity[i];
            if (xmi_activity) {
                var activity = {};
                //console.log("activity " + xmi_activity._name);
                graph.nodes = xmi_activity.node;
                graph.edges = xmi_activity.edge;
                graph.group = xmi_activity.group;

                setPartition();

                removeRecordingPath();
                removeJoin();
                removeDecisionMergeNodes();

                console.log("Activity " + xmi_activity._name + " nodes: " + graph.nodes.length  + "    edges: " +  graph.edges.length);

                activity.name = xmi_activity._name;
                activity.outputNodes = getActivityFinalNodes();
                activity.inputNode = getActivityInitialNode();
                activity.graph = {};
                activity.graph.nodes = graph.nodes;
                activity.graph.edges = graph.edges;

                activities.push(activity);
            }
        }


        graph.nodes = [];
        graph.edges = [];
        for(var i in activities) {
            var a = activities[i];
            if (a) {
                graph.nodes = graph.nodes.concat(a.graph.nodes);
                graph.edges = graph.edges.concat(a.graph.edges);
            }
        }
        console.log("AGG " + graph.nodes.length + " nodes found");
        console.log("AGG " + graph.edges.length + " edges found");
    }
    else {
        console.log("Not xmi file !!");
        console.log("going down");
    }

    console.log("ACTIVITIES ");
    console.log(activities);


    buildTree();
    cleanTree();

    console.log(graph.nodes);
}

function buildTree(){
    console.log("build tree");
    var rootAct = getActivity(rootActivityName);
    var finalAct = getActivity(finalActivityName);

    var visitedStack = [];
    visitedStack = visitedStack.concat(rootAct.outputNodes);

    var probleme = true;

    while(visitedStack.length > 0){
        //console.log(visitedStack.length);
        var currentOutput = visitedStack[0];
        probleme = true;
        if(currentOutput) {
            for (var a in activities) {
                var act = activities[a];
                if (currentOutput._name == act.name) {
                    //console.log("FIND CONNECTION");
                    changeLinkTarget(getEdge(currentOutput._outgoing), act.inputNode);
                    visitedStack.splice(visitedStack.indexOf(currentOutput), 1);
                    visitedStack = visitedStack.concat(act.outputNodes);
                    probleme = false;
                    break;
                }
                else if(currentOutput._name.includes("_end")){
                    if(currentOutput._outgoing != "")
                        removeLink(getEdge(currentOutput._outgoing));
                    visitedStack.splice(visitedStack.indexOf(currentOutput), 1);
                    probleme = false;
                    break;
                }
            }
            if(probleme){
                //console.log("PROBLEME " + currentOutput._name);
                visitedStack.splice(visitedStack.indexOf(currentOutput), 1);
            }
        }
    }
}

function cleanTree(){
    console.log("clean tree");

    //remove initial and activity final node
    for(var n in graph.nodes){
        var node = graph.nodes[n];
        if(node.xmi_type == "uml:InitialNode" || node.xmi_type == "uml:ActivityFinalNode" ){
            removeAllLinks(node);
            removeNode(node);
        }
    }

    //remove call behavior
    for(var n in graph.nodes){
        var node = graph.nodes[n];
        if(node.xmi_type == "uml:CallBehaviorAction"){
            if(!node._name.includes("_end")){
                var outgoEdge = getEdge(node._outgoing);
                var outGoNode = getNode(outgoEdge._target);

                var incoEdge = getEdge(node._incoming);
                changeLinkTarget(incoEdge,outGoNode);

                removeAllLinks(node);
                removeNode(node);
            }
        }
    }

    //add vignette starting node
    initNode._outgoing = initEdge.xmi_id;
    initNode._name = "Initial Node";
    initEdge._target = getActivity(rootActivityName).inputNode.xmi_id;

    graph.nodes.push(initNode);
    graph.edges.push(initEdge);

}

function getActivityFinalNodes(){
    var node = getNode("uml:ActivityFinalNode");
    var outgoingNodes = [];

    var incoLinks = [];
    for(var e in graph.edges){
        if(graph.edges[e]._target == node.xmi_id)
            incoLinks.push(graph.edges[e]);
    }
    if(node && incoLinks) {
        for(var e in incoLinks) {
            outgoingNodes.push(getNode(incoLinks[e]._source));
        }
    }
    else
        console.log("No final node");

    //console.log(outgoingNodes);
    return outgoingNodes;
}
function getActivityInitialNode() {
    var initNode = getNode("uml:InitialNode");
    var outgoingEdge;
    for(var e in graph.edges){
        if(graph.edges[e]._source == initNode.xmi_id)
            outgoingEdge = graph.edges[e];
    }


    var startNode = getNode(outgoingEdge._target);
    //console.log(startNode);
    return startNode;
}

function getActivity(name){
    function byName(activity) {
        return activity.name === name;
    }
    if (activities.find(byName))
        return activities.find(byName);
    else
        console.log("Activity " + name + " not found!");
}


