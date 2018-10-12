using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;
using Mascaret;

public class VirtualHuman_Agent_Decision : BehaviorExecution {

	public string textToSpeak ="";
	public double decisionChoice = 0;
	private int state = 0;

	public double newval = -1;
    
    public List<ActionNode> choices = new List<ActionNode>();

    public EE_UI ui;

    Agent agent;
    AgentController agentC;

    public VirtualHuman_Agent_Decision()
	{
        
    }

	public override void init(Behavior specif,InstanceSpecification host,Dictionary<string,ValueSpecification> p,bool sync)
	{
		base.init(specif, host, p,sync);
        agent = (Agent)host;
        ui = GameObject.Find("Canvas").GetComponent<EE_UI>();

        

        ui.DecisionAgent = agent;
        if (agent.name == "PlayerAuto")
            ui.DecisionAgent = MascaretUtils.getAgent("Player");

        agentC = GameObject.Find(ui.DecisionAgent.name).GetComponent<AgentController>();

        ui = GameObject.Find("Canvas").GetComponent<EE_UI>();
        
    }

    override public double execute (double dt)
	{
        if (state == 0) {

            ActionNode currentNode = MascaretUtils.getCurrentActionNode(agent);
            MascaretHumanActions.changeConstraintValue(ui.DecisionAgent, "decisionValue", -1);
            ui.decisionValue = -1;
            choices = MascaretUtils.getOutgoingNodes(agent, currentNode);
            MascaretHumanActions.setConstrainedEdges(MascaretUtils.getOutgoingEdges(agent, currentNode));
            PrintSingleton.Instance.log("==================================== DECISION ========================================== " + choices.Count);
            ui.DisplayChoices(choices, agentC);
            state++;

            return Time.deltaTime;
		} else{            

            if (ui.decisionValue != -1)
            {
                PrintSingleton.Instance.log("|||||||||||||||||||||   DECISION HAVE BEEN MADE : " + ui.decisionValue);
                return 0;
            }
            else
            {
                MascaretHumanActions.resetConstraints();
                return Time.deltaTime;
            }
            
		}
	}

}
