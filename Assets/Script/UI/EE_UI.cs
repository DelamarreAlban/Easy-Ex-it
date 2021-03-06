﻿using Mascaret;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class EE_UI : MonoBehaviour {

    public bool displaying = false;
    public int decisionValue = -1;
    List<ActionNode> choiceNodes = new List<ActionNode>();
    Agent decisionAgent;

    public float DisplayTime = 3.0f;

    public Dictionary<GameObject, GameObject> actives = new Dictionary<GameObject, GameObject>();

    string currentUserEmotion = "insertEmotion";
    string currentECAEmotion;
    string currentECAStrategy;

    UnityEngine.UI.Button emotionSelected;

    #region UI_Elements

    public Image androidPanel;
    Text androidText;

    public Image playerPanel;
    Text playerText;

    public Image decisionPanel;
    public Image emotionPanel;
    public UnityEngine.UI.Button warningPanel;

    public GameObject radialMenu2Prefab;
    public GameObject radialMenu3Prefab;
    public GameObject radialMenu4Prefab;

    Dictionary<int, GameObject> menus = new Dictionary<int, GameObject>();
    GameObject currentRadialMenu;

    public Image finalPanel;

    public UnityEngine.UI.Button AngerButton;
    public UnityEngine.UI.Button JoyButton;
    public UnityEngine.UI.Button FearButton;
    public UnityEngine.UI.Button DisgustButton;
    public UnityEngine.UI.Button SadnessButton;
    public UnityEngine.UI.Button SurpriseButton;

    Dictionary<string, UnityEngine.UI.Button> emotionButtons = new Dictionary<string, UnityEngine.UI.Button>();
    #endregion

    #region accessors
    public Agent DecisionAgent
    {
        get{return decisionAgent;}
        set{ decisionAgent = value; }
    }

    public string CurrentUserEmotion
    {
        get
        {
            return currentUserEmotion;
        }
    }

    public string CurrentECAEmotion
    {
        get
        {
            return currentECAEmotion;
        }

        set
        {
            currentECAEmotion = value;
        }
    }

    public string CurrentECAStrategy
    {
        get
        {
            return currentECAStrategy;
        }

        set
        {
            currentECAStrategy = value;
        }
    }
    #endregion

    // Use this for initialization
    void Start () {

        #region UI Elements
        androidText = androidPanel.gameObject.transform.Find("AndroidText").GetComponent<Text>();
        playerText = playerPanel.gameObject.transform.Find("PlayerText").GetComponent<Text>();

        menus.Add(2, radialMenu2Prefab);
        menus.Add(3, radialMenu3Prefab);
        menus.Add(4, radialMenu4Prefab);

        emotionButtons.Add("anger", AngerButton);
        emotionButtons.Add("joy", JoyButton);
        emotionButtons.Add("fear", FearButton);
        emotionButtons.Add("disgust", DisgustButton);
        emotionButtons.Add("sadness", SadnessButton);
        emotionButtons.Add("surprise", SurpriseButton);

        #endregion

        resetAll();
    }

    // Update is called once per frame
    void Update () {
        foreach (KeyValuePair<GameObject, GameObject> kvp in actives)
        {
            kvp.Value.transform.position = UnityEngine.Camera.main.WorldToScreenPoint(kvp.Key.transform.position + new UnityEngine.Vector3(-4.5f, 1.0f, 0));
        }
    }

    public void resetAll()
    {
        androidPanel.gameObject.SetActive(false);
        playerPanel.gameObject.SetActive(false);
        finalPanel.gameObject.SetActive(false);
        emotionPanel.gameObject.SetActive(false);
        resetEmotionButtons();
        warningPanel.gameObject.SetActive(false);
    }

    #region displayText
    public void DisplayText(string text, AgentController agent)
    {
        
        if(agent is AndroidController)
        {
            AndroidController android = (AndroidController)agent;
            androidText.text = text;
            androidPanel.gameObject.SetActive(true);

            if(!actives.ContainsKey(android.Head))
                actives.Add(android.Head, androidPanel.gameObject);
        }
        else
        {
            PlayerController player = (PlayerController)agent;
            playerText.text = text;
            playerPanel.gameObject.SetActive(true);
        }
    }

    public void resetDisplayText(AgentController agent)
    {

        if (agent is AndroidController)
        {
            AndroidController android = (AndroidController)agent;
            androidPanel.gameObject.SetActive(false);
            if (actives.ContainsKey(android.Head))
                actives.Remove(android.Head);
        }
        else
        {
            PlayerController player = (PlayerController)agent;
            playerPanel.gameObject.SetActive(false);
        }
    }
    #endregion

    #region displayDecision

    public void DisplayChoices(List<ActionNode> choices, AgentController agent)
    {
        List<string> options = new List<string>();
        if (agent is AndroidController)
        {
            for (int i = 0; i < choices.Count; i++)
            {
                print(i + " - " + getNodeInfo(choices[i], "Specification").Split('_')[1] + " - " + getNodeInfo(choices[i], "Message"));
                options.Add(getNodeInfo(choices[i], "Specification").Split('_')[1]);
                choiceNodes.Add(choices[i]);
            }
            AndroidController android = (AndroidController)agent;
            android.Options = options;
            makeDecision(android.makeRandomDecision());
        }
        else
        {//Agent is player
            for (int i = 0; i < choices.Count; i++)
            {
                print(i + ": " + choices[i].name + " - " + getNodeInfo(choices[i], "Specification").Split('_')[1] + " - " + getNodeInfo(choices[i], "Message"));
                options.Add(getNodeInfo(choices[i], "Message"));
                choiceNodes.Add(choices[i]);
            }
            generateRadialMenu(options);
            emotionPanel.gameObject.SetActive(true);
            decisionPanel.gameObject.SetActive(true);
        }
    }

    public GameObject generateRadialMenu(List<string> choices)
    {
        cleanRadialMenu();
        currentRadialMenu = (GameObject)Instantiate(menus[choices.Count], decisionPanel.transform);
        currentRadialMenu.transform.position = decisionPanel.transform.position;

        RMF_RadialMenu RM = currentRadialMenu.GetComponent<RMF_RadialMenu>();
        for (int i = 0; i < RM.elements.Count; i++)
        {
            RM.elements[i].setText(choices[i]);
            UnityEngine.UI.Button button = RM.elements[i].button;
            //next, any of these will work:
            button.onClick.RemoveAllListeners();
            int currentIndex = i;
            button.onClick.AddListener(() => { makeDecision(currentIndex); });
        }

        return currentRadialMenu;
    }

    public void cleanRadialMenu()
    {
        if (currentRadialMenu != null)
            Destroy(currentRadialMenu);
    }
    
    public void makeDecision(int dV)
    {
        if (emotionSelected != null)
        {
            StartCoroutine(makeDecisionCoroutine(dV));
        }
        else
        {
            warningPanel.gameObject.SetActive(true);
        }
    }

    IEnumerator makeDecisionCoroutine(int dV)
    {
        decisionValue = dV;
        decisionPanel.gameObject.SetActive(false);
        emotionPanel.gameObject.SetActive(false);
        resetEmotionButtons();
        yield return new WaitForEndOfFrame();
        
        //if (decisionAgent.ControlledByHuman)
        //    MascaretHumanActions.executeOperation(choiceNodes[decisionValue], decisionAgent);

        MascaretHumanActions.changeConstraintValue(DecisionAgent, "decisionValue", decisionValue);
    }
    /*
    
    public void makeDecision(int dv)
    {
        MascaretHumanActions.changeConstraintValue(DecisionAgent, "decisionValue", dv);
        //decisionValue = dv;
        //if (DecisionAgent.ControlledByHuman)
        //    MascaretHumanActions.executeOperation(choiceNodes[dv], DecisionAgent);


        decisionPanel.gameObject.SetActive(false);
    }
    */
    #endregion

    #region buttons

    public void choice0_click()
    {

        makeDecision(0);
    }

    public void choice1_click()
    {
        makeDecision(1);
    }

    public void choice2_click()
    {
        makeDecision(2);
    }

    public void choice3_click()
    {
        makeDecision(3);
    }

    public void resetEmotionButtons()
    {
        emotionSelected = null;
        warningPanel.gameObject.SetActive(false);
        //currentUserEmotion = "";
        foreach (KeyValuePair<string,UnityEngine.UI.Button> b in emotionButtons)
            b.Value.interactable = true;
    }

    public void anger_click()
    {
        resetEmotionButtons();
        emotionSelected = AngerButton;
        currentUserEmotion = "Anger";
        AngerButton.interactable = false;
    }
    public void joy_click()
    {
        resetEmotionButtons();
        emotionSelected = JoyButton;
        currentUserEmotion = "Joy";
        JoyButton.interactable = false;
    }
    public void fear_click()
    {
        resetEmotionButtons();
        emotionSelected = FearButton;
        currentUserEmotion = "Fear";
        FearButton.interactable = false;
    }
    public void Disgust_click()
    {
        resetEmotionButtons();
        emotionSelected = DisgustButton;
        currentUserEmotion = "Disgust";
        DisgustButton.interactable = false;
    }
    public void sadness_click()
    {
        resetEmotionButtons();
        emotionSelected = SadnessButton;
        currentUserEmotion = "Sadness";
        SadnessButton.interactable = false;
    }
    public void suprise_click()
    {
        resetEmotionButtons();
        emotionSelected = SurpriseButton;
        currentUserEmotion = "Surprise";
        SurpriseButton.interactable = false;
    }
    #endregion

    #region stringCleaners
    public string getDescription(ActionNode actionNode)
    {
        if (actionNode.Action.Kind == "CallOperation")
        {
            foreach (ValuePin currentPin in actionNode.Action.ValuePins)
            {
                //PrintSingleton.Instance.log("Possible decision action  : " + actionNode.name + " : " + currentPin.ValueSpec.getStringFromValue());
                return CleanString(currentPin.ValueSpec.getStringFromValue());
            }
        }
        return null;
    }

    public string getNodeInfo(ActionNode actionNode, string type)
    {
        if (actionNode.Action.Kind == "CallOperation")
        {
            foreach (ValuePin currentPin in actionNode.Action.ValuePins)
            {
                //print("Possible decision action  : " + currentPin.name + " : " + currentPin.ValueSpec.getStringFromValue());
                if (currentPin.name == type)
                    return CleanString(currentPin.ValueSpec.getStringFromValue());
            }
        }
        return null;
    }

    public string formatString(string s)
    {
        if (s.Contains("<<"))
        {
            int index = s.IndexOf("<<");
            s = s.Insert(index, "<i>");
            index = s.IndexOf(">>");
            s = s.Insert(index + 2, "</i>");
        }
        return s;
    }

    public string CleanString(string s)
    {
        if (s.StartsWith("<p>"))
            s = s.Substring(s.IndexOf("<p>") + 3, s.Length - 4);
        if (s.EndsWith("</p>"))
            s = s.Substring(0, s.IndexOf("</p>"));

        if (s.Contains("&#39;"))
        {
            while (s.Contains("&#39;"))
            {
                int index = s.IndexOf("&#39;");
                s = s.Remove(index, 5);
                s = s.Insert(index, "'");
            }
        }

        if (s.Contains("&lt;"))
        {
            while (s.Contains("&lt;"))
            {
                int index = s.IndexOf("&lt;");
                s = s.Remove(index, 4);
                s = s.Insert(index, "<");
            }
        }

        if (s.Contains("&gt;"))
        {
            while (s.Contains("&gt;"))
            {
                int index = s.IndexOf("&gt;");
                s = s.Remove(index, 4);
                s = s.Insert(index, ">");
            }
        }
        if (s.Contains("&nbsp;"))
        {
            while (s.Contains("&nbsp;"))
            {
                int index = s.IndexOf("&nbsp;");
                s = s.Remove(index, 6);
                s = s.Insert(index, " ");
            }
        }
        return s;
    }
    #endregion

    #region Final Screen

    public void showFinalScreen()
    {
        finalPanel.gameObject.SetActive(true);
    }

    public void quitButton()
    {
        #if UNITY_EDITOR
                UnityEditor.EditorApplication.isPlaying = false;
        #else
                 Application.Quit();
        #endif
    }

    #endregion
}
