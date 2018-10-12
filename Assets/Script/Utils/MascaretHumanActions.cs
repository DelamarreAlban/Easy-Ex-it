using Mascaret;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class MascaretHumanActions {

    public static void executeOperation(ActionNode action, Agent agt)
    {
        PrintSingleton.Instance.log("Executing " + action.name + " by " + agt.name);
        ProceduralBehavior proceduralBehavior = (ProceduralBehavior)(agt.getBehaviorExecutingByName("ProceduralBehavior"));
        for (int iP = 0; iP < proceduralBehavior.runningProcedures.Count; iP++)
        {
            ProcedureExecution procInfo = proceduralBehavior.runningProcedures[iP];
            action.start(agt, procInfo.getAffectations(), false);
            proceduralBehavior.sendActionRealisationMessage(action, procInfo);
            procInfo.informActionRunning(agt.Aid, action);

            if (action.CurrentExecution != null)
            {
                proceduralBehavior.BehaviorToNode.Add(action.CurrentExecution, action);
                action.CurrentExecution.addCallbackOnBehaviorStop(onBehaviorStop);
            }
            else
            {
                procInfo.informActionDone(agt.Aid, action);
                proceduralBehavior.sendActionDoneMessage(action, procInfo);
            }
        }
    }

    public static void onBehaviorStop(BehaviorExecution be)
    {
        ProceduralBehavior proceduralBehavior = (ProceduralBehavior)(((Agent)be.Host).getBehaviorExecutingByName("ProceduralBehavior"));
        proceduralBehavior.BehaviorToNode[be].CurrentExecution.Finish = BehaviorScheduler.Instance.getCurrentVirtualTime();
        for (int iP = 0; iP < proceduralBehavior.RunningProcedures.Count; iP++)
        {
            ProcedureExecution procInfo = proceduralBehavior.runningProcedures[iP];              
            procInfo.informActionDone(((Agent)(proceduralBehavior.Host)).Aid, proceduralBehavior.BehaviorToNode[be]);
            proceduralBehavior.sendActionDoneMessage(proceduralBehavior.BehaviorToNode[be], procInfo);
        }

        //restart();
        proceduralBehavior.ispause = false;
    }

    public static float executeIsolateBehavior(string operation, Agent agt, Dictionary<string, string> spec)
    {
        float behaviorExecutionTime = 1.0f;
        Class cl = (Class)agt.Classifier;
        if (cl.hasOperation(operation))
        {
            Operation op = cl.Operations[operation];
            CallOperationAction act = new CallOperationAction();
            act.Operation = op;
            Dictionary<string, ValueSpecification> param = MascaretUtils.getActionSpecification(spec);
            BehaviorExecution be = new CallOperationBehaviorExecution(act, agt, param);
            behaviorExecutionTime = (float)be.execute(0.00);
        }
        else PrintSingleton.Instance.log("Operation " + operation + " not found for " + agt.name);
        return behaviorExecutionTime;
    }

    public static float executeIsolateBehavior(string operation, Agent agent)
    {
        float behaviorExecutionTime = 1.0f;
        Class cl = (Class)agent.Classifier;
        if (cl.hasOperation(operation))
        {
            Operation entryOp = cl.Operations[operation];

            Dictionary<string, ValueSpecification> param = new Dictionary<string, ValueSpecification>();

            CallOperationAction act = new CallOperationAction();
            act.Operation = entryOp;
            BehaviorExecution be = new CallOperationBehaviorExecution(act, agent, param);
            behaviorExecutionTime = (float)be.execute(0.00);
        }
        else
        {
            PrintSingleton.Instance.log("Operation " + operation + " not found for " + agent.name);
        }

        return behaviorExecutionTime;
    }

    public static void executeIsolateOperation(string operation, Agent agt, Dictionary<string, ValueSpecification> spec)
    {
        Operation op = MascaretUtils.getOperation(operation, agt);
        if (op != null)
        {
            CallOperationAction act = new CallOperationAction();
            act.Operation = op;
            BehaviorExecution be = act.createBehaviorExecution(agt, spec, false);
            PrintSingleton.Instance.log("Manually executing " + operation + " for " + agt.name);
            be.execute(0.0);
        }
        else PrintSingleton.Instance.log("Operation " + operation + " not found for " + agt.name);
    }

    public static void executeOperationInActivity(Agent agent, string operation, Dictionary<string, string> spec, int index, CallProcedureBehaviorExecution pbe)
    {
        if (pbe != null)
        {
            ActivityPartition agentPartition = new ActivityPartition(agent.name);
            CallOperationAction act = new CallOperationAction();
            act.Operation = MascaretUtils.getOperation(operation, agent);

            ActionNode an = new ActionNode(operation + "_" + index, "action");
            an.Action = act;
            foreach (KeyValuePair<string, string> kvp in spec)
                act.Arguments.Add(kvp.Key, kvp.Value);
            an.Partitions = new List<ActivityPartition>();
            an.Partitions.Add(agentPartition);

            AgentBehaviorExecution pbehavior = agent.getBehaviorExecutingByName("ProceduralBehavior");
            if (pbehavior != null)
            {
                ProceduralBehavior procBehave = (ProceduralBehavior)(pbehavior);
                PrintSingleton.Instance.log(procBehave.RunningProcedures.Count);
                OrganisationalEntity askedOrg = MascaretApplication.Instance.AgentPlateform.Organisations.Find(x => x.name == pbe.action.OrganisationalEntity);
                Procedure askedProc = askedOrg.Structure.Procedures.Find(x => x.name == pbe.action.Procedure);
                Role askedRole = askedOrg.RoleAssignement.Find(x => x.Role.name == agent.name).Role;
                if (procBehave.RunningProcedures.Count == 0) //No runningProcedure for this agent, need to create one
                {
                    Dictionary<string, ValueSpecification> procParams = new Dictionary<string, ValueSpecification>();
                    PrintSingleton.Instance.log("Launch procedure for " + agent.name);
                    askedProc.Activity.Partitions.Add(agentPartition);
                    procBehave.pushProcedureToDo(askedProc, askedOrg, askedRole, procParams);
                }
                //The new partition needs to be added to all agents..
                Dictionary<string, Agent> allAgents = VRApplication.Instance.AgentPlateform.Agents;
                foreach (KeyValuePair<string, Agent> kvp in allAgents)
                {
                    ProceduralBehavior pb = (ProceduralBehavior)kvp.Value.getBehaviorExecutingByName("ProceduralBehavior");
                    if (pb != null)
                    {
                        for (int iP = 0; iP < pb.runningProcedures.Count; iP++)
                        {
                            if (!pb.runningProcedures[iP].getAgentToPartition().ContainsKey(agent.Aid.toString()))
                                pb.runningProcedures[iP].getAgentToPartition().Add(agent.Aid.toString(), askedProc.Activity.Partitions.Find(x => x.name == agent.name));
                        }
                    }
                }

                executeOperation(an, agent);

            } else {PrintSingleton.Instance.log("Agent " + agent.name + " does not have a proceduralBehavior!");}
        } else { PrintSingleton.Instance.log("No procedure launched!");}
    }

    #region agent attributes
    public static int getAttributeValue(Agent agt, string constraintName)
    {
        foreach (KeyValuePair<string, Slot> Kslot in agt.Slots)
        {
            if (Kslot.Key == constraintName)
            {
                return (int)Kslot.Value.getValue().getDoubleFromValue();//s  getInstanceValue.ToString();
            }
        }
        return -1;
    }

    public static string getAttributeStringValue(Agent agt, string constraintName)
    {
        foreach (KeyValuePair<string, Slot> Kslot in agt.Slots)
        {
            if (Kslot.Key == constraintName)
            {
                return (string)Kslot.Value.getValue().getStringFromValue();//s  getInstanceValue.ToString();
            }
        }
        return "Attribute not found...";
    }

    public static void setAttributeValue(Agent agt, string constraintName, int value)
    {
        foreach (KeyValuePair<string, Slot> Kslot in agt.Slots)
        {
            if (Kslot.Key == constraintName)
            {
                PrintSingleton.Instance.log(constraintName + " = " + value);
                Kslot.Value.addValue(new LiteralReal(value));
            }
        }
        resetConstraints();
    }

    public static void setAttributeValue(Agent agt, string constraintName, string value)
    {
        foreach (KeyValuePair<string, Slot> Kslot in agt.Slots)
        {
            if (Kslot.Key == constraintName)
            {
                PrintSingleton.Instance.log(constraintName + " = " + value);
                Kslot.Value.addValue(new LiteralString(value));
            }
        }
        resetConstraints();
    }

    #endregion

    #region Signal

    public static void sendSignal(string signalName)
    {
        SendSignalAction action = new SendSignalAction();
        action.SignalClass = new Signal(signalName);
        //string target = "broadcast";

        //take any entitty to send the message
        List<Entity> entities = MascaretApplication.Instance.getEnvironment().getEntities();
        Entity entity = entities[0];
        foreach (Entity e in entities)
        {
            if (e != null)
            {
                entity = e;
                break;
            }
        }
        Action action2 = null;
        if (action.GetType().ToString() == "Mascaret.SendSignalAction")
        {
            MascaretApplication.Instance.VRComponentFactory.Log("############################ SEND SIGNAL : " + action.SignalClass.name);
            Signal signalC = ((SendSignalAction)(action)).SignalClass;
            InstanceSpecification signal = new InstanceSpecification(signalC.name, signalC);

            action2 = new SendSignalAction();
            ((SendSignalAction)(action2)).SignalClass = ((SendSignalAction)(action)).SignalClass;
            ((SendSignalAction)(action2)).Target = new SendSignalTarget();
            ((SendSignalAction)(action2)).Target.target = null;
            ((SendSignalAction)(action2)).Signal = signal;
        }
        BehaviorScheduler.Instance.executeBehavior(action2, entity, new Dictionary<string, ValueSpecification>(), false);
    }

    public static void sendSignal(string signalName, InstanceSpecification target)
    {
        SendSignalAction action = new SendSignalAction();
        action.SignalClass = new Signal(signalName);
        //string target = "broadcast";

        //take any entitty to send the message
        List<Entity> entities = MascaretApplication.Instance.getEnvironment().getEntities();
        Entity entity = entities[0];
        foreach (Entity e in entities)
        {
            if (e != null)
            {
                entity = e;
                break;
            }
        }
        Action action2 = null;
        if (action.GetType().ToString() == "Mascaret.SendSignalAction" && target != null)
        {
            PrintSingleton.Instance.log("############################ SEND SIGNAL : " + action.SignalClass.name + " to " + target.name +"  which is a "+target.Classifier.name);
            Signal signalC = ((SendSignalAction)(action)).SignalClass;
            InstanceSpecification signal = new InstanceSpecification(signalC.name, signalC);

            action2 = new SendSignalAction();
            ((SendSignalAction)(action2)).SignalClass = ((SendSignalAction)(action)).SignalClass;
            ((SendSignalAction)(action2)).Target = new SendSignalTarget();
            ((SendSignalAction)(action2)).Target.target = target;
            ((SendSignalAction)(action2)).Signal = signal;
        }
        BehaviorScheduler.Instance.executeBehavior(action2, entity, new Dictionary<string, ValueSpecification>(), false);
    }

    #endregion

    #region edge constraints
    private static List<ActivityEdge> constrainedEdges = new List<ActivityEdge>();
    public static void changeConstraintValue(Agent agt, string constraintName, int value)
    {
        foreach (KeyValuePair<string, Slot> Kslot in agt.Slots)
        {
            if (Kslot.Key == constraintName)
            {
                Kslot.Value.addValue(new LiteralReal(value));
                PrintSingleton.Instance.log("Attribute : " + Kslot.Key + " of "+ agt.name+ " changed to " + value);
            }
        }
        resetConstraints();
    }

    public static void setConstrainedEdges(List<ActivityEdge> edges)
    {
        resetConstraints();
        constrainedEdges.Clear();
        constrainedEdges.AddRange(edges);
    }

    public static void resetConstraints()
    {
        foreach (ActivityEdge edge in constrainedEdges)
        {
            edge.Guard.resetExpression();
        }
    }
    #endregion

    #region Launch procedure
    public static CallProcedureBehaviorExecution startProcedure(string procedure)
    {
        string orgEntity = null;

        List<OrganisationalStructure> structs = VRApplication.Instance.AgentPlateform.Structures;
        foreach (OrganisationalStructure s in structs)
        {
            List<Procedure> procs = s.Procedures;
            foreach (Procedure p in procs)
            {
                if (p.name == procedure)
                {
                    orgEntity = s.Entities[0].name;
                }
            }
        }
        if(orgEntity == null)
        {
            PrintSingleton.Instance.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            PrintSingleton.Instance.log("PROCEDURE NOT FOUND : " + procedure);
            PrintSingleton.Instance.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            return null;
        }
        PrintSingleton.Instance.log("RUNNING : " + procedure + " / " + orgEntity);
        List<Entity> entities = MascaretApplication.Instance.getEnvironment().getEntities();
        Entity entity = entities[0];
        Mascaret.Action action2 = null;
        action2 = new CallProcedureAction();
        ((CallProcedureAction)(action2)).Procedure = procedure;
        ((CallProcedureAction)(action2)).OrganisationalEntity = orgEntity;

        PrintSingleton.Instance.log("-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --");
        PrintSingleton.Instance.log("NEW PROCEDURE STARTED : " + procedure);
        PrintSingleton.Instance.log("-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --");
        CallProcedureBehaviorExecution cpbe = (CallProcedureBehaviorExecution)BehaviorScheduler.Instance.executeBehavior(action2, entity, new Dictionary<string, ValueSpecification>(), false);
        return cpbe;
    }

    public static CallProcedureBehaviorExecution startProcedureSwitchAgent(string procedure, Agent agentToSwitch, Agent newAgent)
    {
        string orgEntity = null;

        List<OrganisationalStructure> structs = VRApplication.Instance.AgentPlateform.Structures;
        foreach (OrganisationalStructure s in structs)
        {
            List<Procedure> procs = s.Procedures;
            foreach (Procedure p in procs)
            {
                if (p.name == procedure)
                {
                    orgEntity = s.Entities[0].name;
                }
            }
        }
        PrintSingleton.Instance.log("RUNNING : " + procedure + " / " + orgEntity);
        List<Entity> entities = MascaretApplication.Instance.getEnvironment().getEntities();
        Entity entity = entities[0];
        Mascaret.Action action2 = null;
        action2 = new CallProcedureAction();
        ((CallProcedureAction)(action2)).Procedure = procedure;
        ((CallProcedureAction)(action2)).OrganisationalEntity = orgEntity;

        #region switching agent
        if (agentToSwitch != null && newAgent != null)
        {
            List<OrganisationalEntity> orgs = MascaretApplication.Instance.AgentPlateform.Organisations;
            for (int iOrg = 0; iOrg < orgs.Count; iOrg++)
            {
                if (orgs[iOrg].name == ((CallProcedureAction)(action2)).OrganisationalEntity)
                {
                    orgs[iOrg].changeRoleAssignement(agentToSwitch.name, newAgent);
                }
            }
        }
        #endregion

        PrintSingleton.Instance.log("-- -- -- -- -- -- SWITCH -- -- -- -- -- -- SWITCH -- -- -- -- -- --");
        PrintSingleton.Instance.log("NEW PROCEDURE : " + procedure);
        PrintSingleton.Instance.log("AGENT SWITCH : " + agentToSwitch.name +" -->"+ newAgent.name);
        PrintSingleton.Instance.log("-- -- -- -- -- -- ƧMIꓕCH -- -- -- -- -- -- ƧMIꓕCH -- -- -- -- -- --");
        return (CallProcedureBehaviorExecution)BehaviorScheduler.Instance.executeBehavior(action2, entity, new Dictionary<string, ValueSpecification>(), false);
    }
    #endregion

}
