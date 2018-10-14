using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;

public class VirtualHuman_Agent_Choice : BehaviorExecution
{
    public int state = 0;

    string message;
    string specification;

    webGLCommunication webCom;

    public VirtualHuman_Agent_Choice()
    {
    }

    public override void init(Behavior specif, InstanceSpecification host, Dictionary<string, ValueSpecification> p, bool sync)
    {
        base.init(specif, host, p, sync);

        webCom = GameObject.Find("webglCom").GetComponent<webGLCommunication>();

        //0_Flirt,Encourage,Direction_}"
        foreach (KeyValuePair<string, ValueSpecification> kvp in p)
        {
            if (kvp.Key == "Message")
            {
                message = stringUtils.CleanString(kvp.Value.getStringFromValue());
            }
            else if(kvp.Key == "Specification")
            {
                specification = cleanSpec(stringUtils.CleanString(kvp.Value.getStringFromValue()));
            }
        }

        
    }

    override public double execute(double dt)
    {
        //Do nothing
        //The choice behavior is here to hold text to be displayed after a decision choice + the feedback (Quantitative + Qualitative)
        if (state == 0)
        {
            state++;
            webCom.sendChoice(jsonFormatString(specification));
            return Time.deltaTime;
        }
        else if (state == 1)
        {
            return 0;
        }
        return 1;
    }


    string jsonFormatString(string input)
    {
        string json = "{";

        json += "\"input_emotion\":\"" + "in_emo" + "\",\n";
        json += "\"input_tone\":\"" + "in_tone" + "\",\n";
        json += "\"input_strategy\":\"" + "in_strat" + "\",\n";

        json += "\"output_emotion\":\"" + "in_emo" + "\",\n";
        json += "\"output_tone\":\"" + "in_tone" + "\",\n";
        json += "\"output_strategy\":\"" + input + "\"";


        json += "}";
        return json;
    }

    string cleanSpec(string oldspec)
    {
        string[] split = oldspec.Split('_');
        string strat = split[1];

        return strat;
    }
}

