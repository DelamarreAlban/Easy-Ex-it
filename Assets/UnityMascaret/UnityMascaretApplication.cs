using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;
using System.IO;
using System;
using UnityEngine.SceneManagement;
using System.Xml.Linq;
using UnityEngine.AI;

public class UnityMascaretApplication : MonoBehaviour
{
    public bool loadAll = true;

    public bool webgl = false;

    public string agent;
    public string procedure;
    [HideInInspector]
    public string m_BaseDir;
    [HideInInspector]
    public string m_ApplicationFile;


    private CallProcedureBehaviorExecution procedureBehaviorExecution;
    public CallProcedureBehaviorExecution ProcedureBehaviorExecution
    {
        get
        {
            return procedureBehaviorExecution;
        }

        set
        {
            procedureBehaviorExecution = value;
        }
    }

    private VRApplication m_Mascaret;
    public VRApplication Mascaret
    {
        get { return this.m_Mascaret; }
        set { m_Mascaret = value; }
    }

    void Awake()
	{
        string m_ApplicationFile = "MAS/MAS_" + agent;
        //Check if file exists
        TextAsset file = Resources.Load(m_ApplicationFile) as TextAsset;
        if (file != null)
        {
            PrintSingleton.Instance.log("MAS file name valid!");
            m_Mascaret = VRApplication.Instance;
            m_Mascaret.reset();
            m_Mascaret.window = new UnityWindow3D();
            m_Mascaret.VRComponentFactory = new UnityVirtualRealityComponentFactory();
            m_Mascaret.window.addPeripheric(new UnityKeyboard());
            m_Mascaret.window.addPeripheric(new UnityMouse());
            m_Mascaret.parse(m_ApplicationFile, "", loadAll);
        }
        else { PrintSingleton.Instance.log("MAS file not found"); }
    }

    void Start()
	{
		if (procedure != "") 
		{
            startProcedure(procedure);
        }
    }

    void Update()
    {
        m_Mascaret.step();
    }

    public void startProcedure(string procedure_name)
    {
        ProcedureBehaviorExecution = MascaretHumanActions.startProcedure(procedure_name);
    }
}

