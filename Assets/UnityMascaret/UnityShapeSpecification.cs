using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Mascaret;
//using TextToSpeech;

//----------------------------------------------------------------

//----------------------------------------------------------------

public class UnityShapeSpecification : ShapeSpecification
{
    //----------------------------------------------------------------

    public Entity entity;

    int stateforAnimation = 0;

    //protected TTSChannel tc;
    //SpeechData currentSD = null;

    public GameObject entityGO;
    public GameObject EntityGO
    {
        get { return entityGO; }
        set { entityGO = value; }
    }

    public UnityShapeSpecification(string name) : base(name)
    {
    }

    //Default parameters movable=true, recursive =false, shader=""
    public UnityShapeSpecification(string name, List<double> distances, List<string> urls, bool movable, bool recursive, string shader) : base(name, distances, urls, movable, recursive, shader)

    {

    }

    public UnityShapeSpecification(string name, string url, bool movable, bool recursive, string shader) : base(name, url, movable, recursive, shader)

    {
        //PrintSingleton.Instance.log(" Looking for : " + url);

        entityGO = GameObject.Find(url);

        if (entityGO != null)
        {
            EntityGo ego = (EntityGo)entityGO.GetComponent("EntityGo");
            if (ego == null)
            {
                entityGO.AddComponent<EntityGo>();
                ego = (EntityGo)entityGO.GetComponent("EntityGo");
            }
            //else PrintSingleton.Instance.log(" Already has EntityGO Component");

            Dictionary<string, Agent> agents = VRApplication.Instance.AgentPlateform.Agents;
            string agentName = url + "@localhost:8080";

            if (agents.ContainsKey(agentName))
            {
                Mascaret.Agent agt = agents[agentName];
            }
        }
        //else PrintSingleton.Instance.log("GAME OBJECT NOT FOUND : " + url);

        //GameObject go = GameObject.Find("MascaretApplication");
        //UnityMascaretApplication uma = go.GetComponent<UnityMascaretApplication>();

    }

    public override void setVisibility(bool v) { }
    public override bool getVisibility() { return true; }

    public override void setScale(Mascaret.Vector3 scale) { }
    public override Mascaret.Vector3 getScale() { return null; }

    public override double playAnimation(string animationName)
    {
        double animationDuration = 1;
        if (stateforAnimation == 0)
        {
            //FOR ANIMATOR
            Animator animator = entityGO.GetComponent<Animator>();
            if (animator != null)
            {
                animator.Play(animationName);
                PrintSingleton.Instance.log("State speed of " + animationName + " : " + animator.GetCurrentAnimatorStateInfo(0).speed);
                foreach (AnimationClip c in animator.runtimeAnimatorController.animationClips)
                    if (c.name == animationName)
                    {

                        animationDuration = c.length / animator.GetCurrentAnimatorStateInfo(0).speed;

                    }

            }
            stateforAnimation++;
            return animationDuration;
        }
        else
        {
            PrintSingleton.Instance.log("Animation Done ***********************");
            stateforAnimation = 0;
            return stateforAnimation;
        }
    }

    public KeyValuePair<string, float> getCurrentAnimation()
    {
        KeyValuePair<string, float> kvp = new KeyValuePair<string, float>();
        Animator animator = entityGO.GetComponent<Animator>();
        if (animator != null)
        {
            int key = animator.GetCurrentAnimatorStateInfo(0).fullPathHash;
            AnimatorStateInfo animationState = animator.GetCurrentAnimatorStateInfo(0);
            //AnimatorClipInfo[] AnimatorClip = animator.GetCurrentAnimatorClipInfo(0);
            float value = /*AnimatorClip[0].clip.length **/ animationState.normalizedTime;
            kvp = new KeyValuePair<string, float>(key.ToString(), value);
        }

        return kvp;
    }

    public void setCurrentAnimation(string id, string time)
    {
        Animator animator = entityGO.GetComponent<Animator>();
        if (animator != null)
        {
            animator.Play(int.Parse(id), 0, float.Parse(time));
            //animator.speed = 0.0f;
        }
    }
    public override void setEntity(Entity entity)
    {
        EntityGo ego = null;
        if (entityGO != null)
            ego = (EntityGo)entityGO.GetComponent("EntityGo");
        if (ego != null) ego.entity = entity;
    }

    public override Entity getEntity()
    {
        EntityGo ego = (EntityGo)entityGO.GetComponent("EntityGo");
        return ego.entity;
    }

    public override double prepareSpeak(string text)
    {
        return 4;
    }

    public override bool speak(string text)
    {


        return true;
    }

    // --- Shape Modifier Operations ---
    public override Mascaret.Color getColor() { return null; }
    public override void setColor(Mascaret.Color color) { }
    public override void setTransparent(Mascaret.Color color) { }
    public override void growUp(float percent) { }
    public override bool restaureColor(Mascaret.Color color) { return false; }
    public override bool restaureShape() { return false; }

    #region Position and orientation
    //Should be in UnityPointSpecification
    public override Mascaret.Vector3 getGlobalOrientation()
    {
        return unityVector2MascaretVector(EntityGO.gameObject.transform.rotation.eulerAngles);
    }
    public override Mascaret.Vector3 getGlobalPosition()
    {
        return unityVector2MascaretVector(EntityGO.gameObject.transform.position);
    }
    public override Mascaret.Vector3 getLocalOrientation()
    {
        return unityVector2MascaretVector(EntityGO.gameObject.transform.localRotation.eulerAngles);
    }
    public override Mascaret.Vector3 getLocalPosition()
    {
        return unityVector2MascaretVector(EntityGO.gameObject.transform.localPosition);
    }
    public override void setGlobalOrientation(Mascaret.Vector3 ori)
    {
        EntityGO.gameObject.transform.eulerAngles = new UnityEngine.Vector3((float)ori.x, (float)ori.y, (float)ori.z);
    }
    public override void setGlobalPosition(Mascaret.Vector3 pos)
    {
        EntityGO.transform.position = new UnityEngine.Vector3((float)pos.x, (float)pos.y, (float)pos.z);
    }
    public override void setLocalOrientation(Mascaret.Vector3 ori)
    {
        EntityGO.gameObject.transform.localEulerAngles = new UnityEngine.Vector3((float)ori.x, (float)ori.y, (float)ori.z);
    }
    public override void setLocalPosition(Mascaret.Vector3 pos)
    {
        EntityGO.gameObject.transform.localPosition = new UnityEngine.Vector3((float)pos.x, (float)pos.y, (float)pos.z);
    }

    public Mascaret.Vector3 unityVector2MascaretVector(UnityEngine.Vector3 vec3)
    {

        return new Mascaret.Vector3(vec3.x, vec3.y, vec3.z);
    }
    public Mascaret.RotationVector unityQuaternion2RotationVector(UnityEngine.Quaternion vec4)
    {

        return new Mascaret.RotationVector(vec4.x, vec4.y, vec4.z, vec4.w);
    }
    public UnityEngine.Quaternion RotationVector2unityQuaternion(Mascaret.RotationVector vec4)
    {

        return new UnityEngine.Quaternion((float)vec4.x, (float)vec4.y, (float)vec4.z, (float)vec4.angle);
    }
    public UnityEngine.Vector3 mascaretVector2UnityVector(Mascaret.Vector3 vec3)
    {
        return new UnityEngine.Vector3((float)vec3.x, (float)vec3.y, (float)vec3.z);
    }
    #endregion
}
