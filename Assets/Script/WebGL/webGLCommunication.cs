using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine;

public class webGLCommunication : MonoBehaviour {

    [DllImport("__Internal")]
    private static extern void SendEndNode(string end);

    [DllImport("__Internal")]
    private static extern void SendChoice(string choice);


    UnityMascaretApplication mascaret;

    // Use this for initialization
    void Start () {
        mascaret = GameObject.Find("MascaretApplication").GetComponent<UnityMascaretApplication>();
	}
	
	// Update is called once per frame
	void Update () {
		
	}

    public void sendChoice(string choice)
    {
        print("Send choice ======================>");
        print(choice);
        if (mascaret.webgl)
            SendChoice(choice);
    }

    public void sendEndNode(string end)
    {
        print("Send End Node ======================>");
        print(end);
        if (mascaret.webgl)
            SendEndNode(end);
    }
}
