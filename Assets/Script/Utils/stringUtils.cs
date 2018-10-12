using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class stringUtils {

	public static string CleanString(string s)
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
        return s;
    }

    public static bool checkStringStart(string s, string reference, out string newstring)
    {
        if (s.StartsWith(reference))
        {
            newstring = s.Substring(reference.Length);
            return true;
        }
        else
        {
            newstring = s;
            return false;
        }
    }
}
