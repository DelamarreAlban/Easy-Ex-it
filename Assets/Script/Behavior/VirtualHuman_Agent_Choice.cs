using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;

public class VirtualHuman_Agent_Choice : BehaviorExecution
{
    public int state = 0;

    public VirtualHuman_Agent_Choice()
    {
    }

    public override void init(Behavior specif, InstanceSpecification host, Dictionary<string, ValueSpecification> p, bool sync)
    {
        base.init(specif, host, p, sync);
    }

    override public double execute(double dt)
    {
        //Do nothing
        //The choice behavior is here to hold text to be displayed after a decision choice + the feedback (Quantitative + Qualitative)
        if (state == 0)
        {
            state++;
            return Time.deltaTime;
        }
        else if (state == 1)
        {
            return 0;
        }
        return 1;
    }
}

