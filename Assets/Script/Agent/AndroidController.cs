using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AndroidController : AgentController
{
    #region Animator

    private AnimatorStateInfo currentBaseState;
    private AnimatorStateInfo facialLayerState;

    static int facial_idleState = Animator.StringToHash("FacialExpressions.Idle");
    static int facial_angerState = Animator.StringToHash("FacialExpressions.Anger");
    static int facial_fearState = Animator.StringToHash("FacialExpressions.Fear");
    static int facial_disgustState = Animator.StringToHash("FacialExpressions.Disgust");
    static int facial_sadnessState = Animator.StringToHash("FacialExpressions.Sadness");
    static int facial_surpriseState = Animator.StringToHash("FacialExpressions.Surprise");
    static int facial_contemptState = Animator.StringToHash("FacialExpressions.Contempt");
    static int facial_joyState = Animator.StringToHash("FacialExpressions.Joy");

    static int idleState = Animator.StringToHash("Base Layer.Idle");

    #endregion

    public List<string> Expressions = new List<string>();
    public string currentFacialExpression = "";

    public GameObject Head;

    public Transform targetLookAt;
    public float lookSmoother = 3f;
    // Use this for initialization
    void Start()
    {
        animator = GetComponent<Animator>();
        Head = transform.Find("Android01/root/spine05/spine04/spine03/spine02/spine01/neck01/neck02/neck03/head").gameObject;

        #region Expressions

        Expressions.Add("Anger");
        Expressions.Add("Joy");
        Expressions.Add("Fear");
        Expressions.Add("Disgust");
        Expressions.Add("Sadness");
        Expressions.Add("Surprise");
        Expressions.Add("Contempt");

        #endregion
    }

    // Update is called once per frame
    void Update()
    {

    }
    public float lookWeight;                    // the amount to transition when using head look
    void OnAnimatorIK()
    {
        if (targetLookAt != null)
        {
            animator.SetLookAtWeight(lookWeight);
            animator.SetLookAtPosition(targetLookAt.position);
            lookWeight = Mathf.Lerp(lookWeight, 1f, Time.deltaTime * lookSmoother);
        }
    }

    void FixedUpdate()
    {
        currentBaseState = animator.GetCurrentAnimatorStateInfo(0);
        facialLayerState = animator.GetCurrentAnimatorStateInfo(1);

        #region facial expression states
        if (facialLayerState.fullPathHash == facial_angerState)
        {
            resetFacialExpression();
        }
        else if (facialLayerState.fullPathHash == facial_fearState)
        {
            resetFacialExpression();
        }
        else if (facialLayerState.fullPathHash == facial_disgustState)
        {
            resetFacialExpression();
        }
        else if (facialLayerState.fullPathHash == facial_sadnessState)
        {
            resetFacialExpression();
        }
        else if (facialLayerState.fullPathHash == facial_surpriseState)
        {
            resetFacialExpression();
        }
        else if (facialLayerState.fullPathHash == facial_contemptState)
        {
            resetFacialExpression();
        }
        else if (facialLayerState.fullPathHash == facial_joyState)
        {
            resetFacialExpression();
        }
        #endregion
    }

    #region DecisionMaking Process

    List<string> options = new List<string>();

    public List<string> Options
    {
        get{ return options;}
        set{options = value;}
    }

    public int makeRandomDecision()
    {
        int selectedIndex = -1;
        if (options.Count > 0)
        {
            int index = Random.Range(0, options.Count - 1);
            selectedIndex = index;
            print("RANDOM SELECTION - > " + Options[index]);
        }
        else { print("!!! Make sure to populate AndroidController.Options first!"); }


        return selectedIndex;
    }

    public int makeDecision()
    {
        int selectedIndex = -1;

        //APPLY DECISION MAKING PROCESS HERE

        return selectedIndex;
    }

    #endregion

    #region facial expression
    public void setFacialExpression(string facialExpression)
    {
        resetFacialExpression();
        if (Expressions.Contains(facialExpression))
        {
            animator.SetBool("Facial_"+facialExpression, true);
            currentFacialExpression = facialExpression;

        }
        else { print("Expression  " + facialExpression + " does not exist!"); }
    }

    public void resetFacialExpression()
    {
        foreach (string expression in Expressions)
            animator.SetBool("Facial_" + expression, false);
        currentFacialExpression = "Idle";
    }
    #endregion
}
