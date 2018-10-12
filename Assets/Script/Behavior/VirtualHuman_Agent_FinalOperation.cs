﻿using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;
using System.IO;
using System.Linq;

public class VirtualHuman_Agent_FinalOperation : BehaviorExecution {

	public int state = 0;
    public EE_UI ui;

	public VirtualHuman_Agent_FinalOperation()
	{
        
    }
	
	public override void init(Behavior specif,InstanceSpecification host,Dictionary<string,ValueSpecification> p,bool sync)
	{
		base.init(specif, host, p,sync);

        ui = GameObject.Find("Canvas").GetComponent<EE_UI>();
        PrintSingleton.Instance.log("==================================== FINAL OPERATION ==========================================");
    }

    override public double execute (double dt)
	{
		if (state == 0) {

            ui.showFinalScreen();
			state++;
			return Time.deltaTime;
		}
        else {

            return 0;
		}
	}
}