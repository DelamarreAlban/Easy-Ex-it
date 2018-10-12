using UnityEngine;
using System.Collections;
using Mascaret;


public class UnityBehaviorRealizer : BehaviorRealizer {

    public UnityBehaviorRealizer(UnityShapeSpecification shape){
        //GameObject go = GameObject.Find("MascaretApplication");
        //UnityMascaretApplication uma = go.GetComponent<UnityMascaretApplication>(); 
    }

	override public void addBehavior(string bml)
    {
        PrintSingleton.Instance.log("UnityBehaviorRealizer : " + bml);
    }
}
