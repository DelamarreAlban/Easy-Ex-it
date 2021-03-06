﻿using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;
using System.IO;
using System.Linq;

public class VirtualHuman_Agent_PlayAnimation : BehaviorExecution
{

    public string animation = "";
    public int state;

    public EE_UI ui;
    AgentController agent;

    public VirtualHuman_Agent_PlayAnimation()
    {

    }

    public override void init(Behavior specif, InstanceSpecification host, Dictionary<string, ValueSpecification> p, bool sync)
    {
        base.init(specif, host, p, sync);

        ui = GameObject.Find("Canvas").GetComponent<EE_UI>();
        if (Host.name == "PlayerAuto")
            agent = GameObject.Find("Player").GetComponent<AgentController>();
        else
            agent = GameObject.Find(Host.name).GetComponent<AgentController>();


        foreach (KeyValuePair<string, ValueSpecification> kvp in p)
        {
            if (kvp.Key == "Animation")
            {
                animation = stringUtils.CleanString(kvp.Value.getStringFromValue());
            }
        }

        PrintSingleton.Instance.log("==================================== PLAY ANIMATION ==========================================");
        PrintSingleton.Instance.log(agent.name + " --> " + animation);
    }

    override public double execute(double dt)
    {
        if (state == 0)
        {
            if (agent != null)
            {
                agent.playAnimation(animation);
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

