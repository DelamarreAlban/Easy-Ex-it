using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UnityEngine;
using Mascaret;
using System.Xml.Linq;

public static class MascaretUtils
{
    public static ActionNode getCurrentActionNode(Agent agt)
    {
        ProceduralBehavior proceduralBehavior = (ProceduralBehavior)(agt.getBehaviorExecutingByName("ProceduralBehavior"));
        List<ProcedureExecution> procedureExecutions = new List<ProcedureExecution>();
        if (proceduralBehavior != null)
        {
            procedureExecutions = proceduralBehavior.runningProcedures;
        }
        if (procedureExecutions.Count != 0)
        {
            foreach (ProcedureExecution procExe in procedureExecutions)
            {
                
                List<ActionNode> allActions = procExe.getAllActionsFor(agt.Aid);
                if (allActions != null)
                {
                    foreach (ActionNode action in allActions)
                    {
                        if (action.isRunning() && action.CurrentExecution.GetType() == typeof(CallOperationBehaviorExecution))
                        {
                            Debug.Log(":::::::::::::::::::::::::   " + procExe.procedure.name);
                            return action;
                        }
                    }
                }
            }
        }
        //Return null if initialization is not over
        return null;
    }
    
    public static ProcedureExecution getCurrentProcedureExecution(string agt)
    {
        return getCurrentProcedureExecution(getAgent(agt));
    }

    public static ProcedureExecution getCurrentProcedureExecution(Agent agt)
    {
        ProceduralBehavior proceduralBehavior = (ProceduralBehavior)(agt.getBehaviorExecutingByName("ProceduralBehavior"));
        List<ProcedureExecution> procedureExecutions = new List<ProcedureExecution>();
        if (proceduralBehavior != null)
        {
            procedureExecutions = proceduralBehavior.runningProcedures;
        }
        if (procedureExecutions.Count != 0)
        {
            foreach (ProcedureExecution procExe in procedureExecutions)
            {
                List<ActionNode> allActions = procExe.getAllActionsFor(agt.Aid);
                if (allActions != null)
                {
                    foreach (ActionNode action in allActions)
                    {
                        if (action.isRunning())
                        {
                            return procExe;
                        }
                    }
                }
            }
        }
        //Return null if initialization is not over
        return null;
    }

    public static List<ActivityEdge> getOutgoingEdges(Agent agt, ActionNode node)
    {
        ProceduralBehavior proceduralBehavior = (ProceduralBehavior)(agt.getBehaviorExecutingByName("ProceduralBehavior"));

        if (proceduralBehavior != null)
        {
            if (node != null)
            {
                List<ActivityEdge> outgoEdges = node.getOutgoingActionNodeEdges();
                return outgoEdges;
            }
        }
        return null;
    }

    public static List<ActionNode> getOutgoingNodes(Agent agt, ActionNode node)
    {
        ProceduralBehavior proceduralBehavior = (ProceduralBehavior)(agt.getBehaviorExecutingByName("ProceduralBehavior"));


        if (proceduralBehavior != null)
        {
            if (node != null)
            {
                List<ActionNode> outgoNodes = node.getOutgoingActionNode();
                Debug.Log(outgoNodes.Count);
                return outgoNodes;
            }
        }
        return null;
    }

    public static ActionNode getNextNodeToExecute(Agent agt)
    {
        List<ProceduralBehavior> proceduralBehaviors = GameObject.Find("MascaretApplication").GetComponent<UnityMascaretApplication>().ProcedureBehaviorExecution.ProceduralBehaviors;
        PrintSingleton.Instance.log("Agent : " + agt.name);
        ProceduralBehavior proceduralBehavior = (ProceduralBehavior)agt.getBehaviorExecutingByName("ProceduralBehavior");
        if (proceduralBehavior != null)
        {
            if (proceduralBehavior.runningProcedures.Count > 0)
            {
                PrintSingleton.Instance.log("Procedures : " + proceduralBehavior.runningProcedures.Count);
                ProcedureExecution procExec = proceduralBehavior.runningProcedures[proceduralBehavior.runningProcedures.Count - 1];

                List<ActionNode> nodesToExecute = procExec.getActionToExecuteFor(agt.Aid);
                List<ActivityNode> activeNodes = new List<ActivityNode>();
                foreach (ActivityExecutionToken t in procExec.getActiveToken())
                    activeNodes.Add(t.currentLocation);
                foreach (ActivityNode t in activeNodes)
                {
                    List<ActionNode> outgoActions = t.getOutgoingActionNode();
                    foreach (ActionNode n in outgoActions)
                    {
                        if (!n.isRunning() && nodesToExecute.Contains(n))
                        {
                            PrintSingleton.Instance.log("Action to execute : " + n.name);
                            return n;
                        }
                    }
                }
            }
        }
        return null;
    }

    public static bool agentIsPlaying(Agent agt)
    {
        List<ProceduralBehavior> proceduralBehaviors = GameObject.Find("MascaretApplication").GetComponent<UnityMascaretApplication>().ProcedureBehaviorExecution.ProceduralBehaviors;
        ProceduralBehavior proceduralBehavior = (ProceduralBehavior)agt.getBehaviorExecutingByName("ProceduralBehavior");
        if (proceduralBehavior != null)
        {
            if (proceduralBehavior.runningProcedures.Count > 0)
            {
                ProcedureExecution procExec = proceduralBehavior.runningProcedures[proceduralBehavior.runningProcedures.Count - 1];

                List<ActionNode> nodesToExecute = procExec.getActionToExecuteFor(agt.Aid);
                if (nodesToExecute.Count > 0)
                    return true;
            }
        }
        return false;
    }

    public static Agent getAgent(string name)
    {
        Dictionary<string, Agent> agents = VRApplication.Instance.AgentPlateform.Agents;
        foreach (KeyValuePair<string, Agent> kvp in agents)
        {
            if (kvp.Value.name == name)
                return kvp.Value;
        }
        return null;
    }

    public static Agent getHumanControlledAgent()
    {
        Dictionary<string, Agent> agents = VRApplication.Instance.AgentPlateform.Agents;
        foreach (KeyValuePair<string, Agent> kvp in agents)
        {
            if (kvp.Value.ControlledByHuman)
                return kvp.Value;
        }
        return null;
    }

    public static Operation getOperation(string op, Agent agt)
    {
        OpaqueBehavior ob = new OpaqueBehavior("dd");
        ob.Body = op;
        Class ocl = ob._lookForOperation((Class)(agt.Classifier));
        if (ocl != null)
        {
            if(ocl.Operations[ob.Body] != null)
                return ocl.Operations[ob.Body];
        }
        PrintSingleton.Instance.log("Operation " + op + " not found for " + agt.name);
        return null;
    }

    public static Dictionary<string, ValueSpecification> getActionSpecification(Dictionary<string,string> spec)
    {
        Dictionary<string, ValueSpecification> param = new Dictionary<string, ValueSpecification>();
        foreach (KeyValuePair<string, string> kvp in spec)
        {
            //int
            int i; double d; bool b;
            if (int.TryParse(kvp.Value, out i))
                param.Add(kvp.Key, new LiteralInteger(i));
            //float

            else if (double.TryParse(kvp.Value, out d))
                param.Add(kvp.Key, new LiteralReal(d));
            //boolean

            else if (bool.TryParse(kvp.Value, out b))
                param.Add(kvp.Key, new LiteralBoolean(b));
            //string
            else
                param.Add(kvp.Key, new LiteralString(kvp.Value));

        }
        return param;
    }

    public static Entity getEntity(string name)
    {
        List<Entity> entities = MascaretApplication.Instance.getEnvironment().getEntities();
        Entity a = entities.Find(x => x.name == name);
        if (a != null)
            return a;
        return null;
    }

    public static void setState(Agent agt, string state)
    {
        for (int i = agt.SmBehaviorExecutions.Count - 1; i >= 0; i--)
        {
            if (agt.SmBehaviorExecutions[i] != null)
            {
                agt.SmBehaviorExecutions[i].setCurrentState(state);
            }
        }
        PrintSingleton.Instance.log("State not found...");
    }

    public static string getState(Agent agt)
    {
        for (int i = agt.SmBehaviorExecutions.Count - 1; i >= 0; i--)
        {
            if (agt.SmBehaviorExecutions[i] != null)
            {
                //PrintSingleton.Instance.log("Current state : " + agt.SmBehaviorExecutions[i].CurrentState.name);
                if(agt.SmBehaviorExecutions[i].CurrentState != null)
                    return agt.SmBehaviorExecutions[i].CurrentState.name;
                else
                {
                    //PrintSingleton.Instance.log("State not found...");
                }
            }
        }
        PrintSingleton.Instance.log("State not found...");
        return null;
    }

    public static Dictionary<ActionNode, int> getQuantiFeedback(List<ActionNode> choices)
    {
        Dictionary<ActionNode, int> quantiFeedback = new Dictionary<ActionNode, int>();
        foreach (ActionNode an in choices)
        {
            int score = getChoiceScore(an);
            if (score != -1)
            {
                quantiFeedback.Add(an, score);
            }

        }
        return quantiFeedback;
    }

    public static int getChoiceScore(ActionNode choice)
    {
        if (choice.Action.Kind == "CallOperation")
        {
            foreach (ValuePin currentPin in choice.Action.ValuePins)
            {
                if (currentPin.name == "Feedback")
                {
                    PrintSingleton.Instance.log("Pin : " + currentPin.name + "   : " + currentPin.ValueSpec.getStringFromValue());
                    string feedback_text = stringUtils.CleanString(currentPin.ValueSpec.getStringFromValue());
                    string[] feedbackDiv = feedback_text.Split('_');
                    int feedbackValue = -1;
                    if (Int32.TryParse(feedbackDiv[0], out feedbackValue))
                        return feedbackValue;
                    //return CleanString(currentPin.ValueSpec.getStringFromValue());
                }

            }
        }
        return -1;
    }

    public static int GetWorstChoice(List<ActionNode> choices)
    {
        int min = int.MaxValue;
        int currentIndex = -1;
        for(int i=0; i < choices.Count;i++)
        {
            int score = getChoiceScore(choices[i]);
            if (score < min)
            {
                currentIndex = i;
                min = score;
            }
            if(score == min)
            {
                //Random choice
                if(UnityEngine.Random.Range(0.0f, 1.0f) <= 0.5f)
                {
                    currentIndex = i;
                }
            }
        }
        return currentIndex;
    }

    /*
    public static string explore(Ex_Node currentNode)
    {
        if(currentNode.state != "finished") //actually should always be true, not really needed
        {
            //loadScene(currentNode.decisionNode); //loads from an xml file the scene as it should be at this point
            //playScene(currentNode); //play everything that happens from the previous node to this one
            //saveScene(currentNode);  //saves in an xml file the scene as it is at this point
            currentNode.getChildren();
            foreach (Ex_Node child in currentNode.Choices)
            {
                if (child.state != "finished")
                {
                    explore(child);
                }
            }
            currentNode.state = "finished";
        }
        return currentNode.decisionNode;
    }
    */
}
