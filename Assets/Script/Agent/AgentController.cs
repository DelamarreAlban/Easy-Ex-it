using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AgentController : MonoBehaviour {

    protected Animator animator;

    // Use this for initialization
    void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
		
	}

    public void playAudio(string audioName)
    {
        print("PLayAudio : " + audioName);
    }

    public void playAnimation(string animation)
    {
        animator.SetTrigger(animation);
    }
}
