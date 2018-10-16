using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;
using System.IO;
using System.Linq;

public class VirtualHuman_Agent_Speak : BehaviorExecution {

	public string message ="";
    public string specification = "";
	public int state;

    string audioName = "";
	bool audioplay=false;
    
    public EE_UI ui;
    AgentController agent;

	public VirtualHuman_Agent_Speak()
	{
        
    }
	
	public override void init(Behavior specif,InstanceSpecification host,Dictionary<string,ValueSpecification> p,bool sync)
	{
		base.init(specif, host, p,sync);

        ui = GameObject.Find("Canvas").GetComponent<EE_UI>();
        if (Host.name == "PlayerAuto")
        {


            agent = GameObject.Find("Player").GetComponent<AgentController>();
        }
            
        else
            agent = GameObject.Find(Host.name).GetComponent<AgentController>();
        

        foreach (KeyValuePair<string,ValueSpecification> kvp in p)
		{
            if (kvp.Key == "Message")
            {
                message = stringUtils.CleanString(kvp.Value.getStringFromValue());
            }
            else if (kvp.Key == "Specification")
            {
                specification = cleanSpec(stringUtils.CleanString(kvp.Value.getStringFromValue()));
            }
        }

        if (message != "")
        {
            string[] s = message.Split('_');
            if (stringUtils.checkStringStart(s[0], "AUDIO:", out audioName))
            {
                audioplay = true;
                message = s[1];
            }
            else
                message = s[0];
        }

        PrintSingleton.Instance.log("====================================SPEAK==========================================");
        PrintSingleton.Instance.log(agent.name + " --> " + message);
        

        if (agent is AndroidController)
        {
            PrintSingleton.Instance.log("STRATEGY --> " + specification);
            ui.CurrentECAStrategy = specification;
        }
    }

    override public double execute(double dt)
    {
        if (state == 0)
        {
            if (agent != null)
            {
                if (audioplay)
                {
                    agent.playAudio(audioName);
                    audioplay = false;
                }
                ui.DisplayText(message, agent);
                /*
                Agent m_agent = MascaretUtils.getAgent(Host.name);
                Debug.Log("===================================   " + m_agent.name);
                ActionNode currentNode = MascaretUtils.getCurrentActionNode(m_agent);
                Debug.Log("===================================   " + currentNode.name);
                List<ActionNode> choices = MascaretUtils.getOutgoingNodes(m_agent, currentNode);
                foreach (ActionNode n in choices)
                    Debug.Log("===================================   " + n.name);
                ActionNode next = MascaretUtils.getNextNodeToExecute(m_agent);
                Debug.Log(" ========  " + next.name);
                */
            }

            state++;
            return ui.DisplayTime;
        }
        else {
            ui.resetDisplayText(agent);
            return 0;
        }
    }

    string cleanSpec(string oldspec)
    {
        string[] split = oldspec.Split('_');
        string strat = split[1];

        return strat;
    }
}
