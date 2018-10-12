using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;
using System.IO;
using System.Linq;

public class VirtualHuman_Agent_Speak : BehaviorExecution {

	public string message ="";
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
            agent = GameObject.Find("Player").GetComponent<AgentController>();
        else
            agent = GameObject.Find(Host.name).GetComponent<AgentController>();
        

        foreach (KeyValuePair<string,ValueSpecification> kvp in p)
		{
            if (kvp.Key == "Message")
            {
                message = stringUtils.CleanString(kvp.Value.getStringFromValue());
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
            }

            state++;
            return ui.DisplayTime;
        }
        else {
            ui.resetDisplayText(agent);
            return 0;
        }
    }


}
