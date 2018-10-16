using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PrintSingleton {

    public bool doPrint = true;
    public bool doPrintMasc = true;
    public bool doPrintErr = false;
    public bool doPrintWarn = false;
    public bool doPrintDebug = false;

    private static PrintSingleton instance;


    public static PrintSingleton Instance
    {
        get
        {

            if (instance == null)
            {
                instance = new PrintSingleton();
            }

            return instance;
        }
    }


    public void log(object str)
    {
        if(doPrint)
        {
            Debug.Log(str);
        }
    }

    public void logDebug(object str)
    {
        if (doPrintDebug)
        {
            Debug.Log(str);
        }
    }

    public void logMasc(object str)
    {
        if (doPrintMasc)
        {
            Debug.Log(str);
        }
    }

    public void logError(object str)
    {
        if(doPrintErr)
        {
            Debug.LogError(str);
        }
    }

    public void logWarning(object str)
    {
        if(doPrintWarn)
        {
            Debug.LogWarning(str);
        }
    }
}
