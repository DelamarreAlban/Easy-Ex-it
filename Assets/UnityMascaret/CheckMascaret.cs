using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;

public class CheckMascaret : MonoBehaviour {

	// Use this for initialization
	void Start () {
		VRApplication mascaret = VRApplication.Instance;

		Dictionary<string, List<Class>> classesList = mascaret.Model.AllClasses;

		PrintSingleton.Instance.log ("==== Printing Class List in Model ========");
		foreach (KeyValuePair<string, List<Class>> cl in classesList)
		{
			PrintSingleton.Instance.log(" ============================================= ");
			Class c = cl.Value[0];
			PrintSingleton.Instance.log (c.getFullName());
			Dictionary <string, Property> props = c.Attributes;
			foreach(KeyValuePair<string, Property> p in props)
			{
				Property property = p.Value;
				PrintSingleton.Instance.log("    -> " + property.name + " : " + property.Type.name);
			}

			Dictionary<string,Behavior> behaviors = c.OwnedBehavior;
			PrintSingleton.Instance.log("   ----- Behaviors : ");
			foreach(KeyValuePair<string,Behavior> bhs in behaviors)
			{
				PrintSingleton.Instance.log(bhs.Value.getFullName());
				StateMachine stm = (StateMachine)bhs.Value;
				List<Region> regions = stm.Region;
				Region initialRegion = regions[0];
				List<Vertex> vertices = initialRegion.Vertices;
				foreach (Vertex vertex in vertices)
				{
					PrintSingleton.Instance.log("    * "+vertex.name);
					List<Transition> outgoing = vertex.Outgoing;
					foreach(Transition t in outgoing)
					{
						PrintSingleton.Instance.log("       --> " + t.Target.name);
					}
					List<Transition> incoming = vertex.Incoming;
					foreach(Transition t in incoming)
					{
						PrintSingleton.Instance.log("       <-- " + t.Source.name);
					}
					if (vertex.GetType().ToString() == "Mascaret.State")
					{
						State state = (State)vertex;
						Operation doOperation = state.DoBehavior;
						if (doOperation != null) PrintSingleton.Instance.log("        Do : " + doOperation.getFullName());
					}
				}
			}
/*
			Dictionary<string,InstanceSpecification> entities = c.Instances;
			PrintSingleton.Instance.log("   ----- instances : " );
			foreach (KeyValuePair<string, InstanceSpecification> instanceKV in entities)
			{
				PrintSingleton.Instance.log(instanceKV.Value.getFullName());
			}
*/
		}

		Dictionary<string, InstanceSpecification> instances = mascaret.getEnvironment().InstanceSpecifications;
		PrintSingleton.Instance.log("Nb Instances : " + instances.Count);

		PrintSingleton.Instance.log ("==== Printing Entity List in Model ========");
		foreach (KeyValuePair<string, InstanceSpecification> instanceKV in instances) 
		{
			PrintSingleton.Instance.log(" ============================================= ");
			InstanceSpecification instance = instanceKV.Value;
			PrintSingleton.Instance.log(instance.getFullName () + " : " + instance.Classifier.getFullName());
			Dictionary <string, Slot> slots = instance.Slots;
			foreach(KeyValuePair<string, Slot> propertyValues in slots)
			{
				Slot propertyValue = propertyValues.Value;
				string propertyName = propertyValue.DefiningProperty.name;
				ValueSpecification valueSpecif = propertyValue.getValue();
				if (valueSpecif != null)
				{
					string value = "";

					if(valueSpecif.GetType().ToString() == "Mascaret.LiteralInteger")
					{
						LiteralInteger integer = valueSpecif as LiteralInteger;
						int intValue = integer.IValue;
						value += intValue;
					}
					else if (valueSpecif.GetType().ToString() == "Mascaret.InstanceValue")
					{
						InstanceValue instanceValue = valueSpecif as InstanceValue;
						InstanceSpecification instanceSpecif = instanceValue.SpecValue;
						value = instanceSpecif.getFullName();
					}

					PrintSingleton.Instance.log(" ----> " + propertyName + " = " + value);
				}
				else 
				{
					PrintSingleton.Instance.log(" ----> " + propertyName + " not set");
				}
			}
			List<StateMachineBehaviorExecution> stmBEs = instance.SmBehaviorExecutions;
			foreach(StateMachineBehaviorExecution stmBE in stmBEs)
			{
				PrintSingleton.Instance.log("    - Execute : " + stmBE.getStateMachine().getFullName());
				//PrintSingleton.Instance.log("        * CurrentState : " + stmBE.CurrentState.name);
			}
			
		}

	}

}
