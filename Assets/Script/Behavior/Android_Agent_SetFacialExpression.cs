using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;
using System.IO;
using System.Linq;

public class Android_Agent_SetFacialExpression : BehaviorExecution {

    public int state = 0;
    public EE_UI ui;

    string expression = "";
    AndroidController android;

    public Android_Agent_SetFacialExpression()
    {

    }

    public override void init(Behavior specif, InstanceSpecification host, Dictionary<string, ValueSpecification> p, bool sync)
    {
        base.init(specif, host, p, sync);

        android = GameObject.Find(host.name).GetComponent<AndroidController>();

        foreach (KeyValuePair<string, ValueSpecification> kvp in p)
        {
            if (kvp.Key == "Expression")
            {
                expression = stringUtils.CleanString(kvp.Value.getStringFromValue());
            }
        }

        ui = GameObject.Find("Canvas").GetComponent<EE_UI>();
        PrintSingleton.Instance.log("==================================== SET FACIAL EXPRESSION ========================================== " + expression);
    }

    override public double execute(double dt)
    {
        if (state == 0)
        {
            android.setFacialExpression(expression);
            state++;
            return Time.deltaTime;
        }
        else {

            return 0;
        }
    }
}
