const Vignette = Parse.Object.extend('Vignette');
const Storyline = Parse.Object.extend('Storyline')
const Decision = Parse.Object.extend('Decision')
const Node = Parse.Object.extend('Node')
const Edge = Parse.Object.extend('Edge')
const Avatar = Parse.Object.extend('Avatar')
const Classroom = Parse.Object.extend('Classroom')
const Analytic = Parse.Object.extend('Analytic')
const PhaseStat = Parse.Object.extend('PhaseStat')
const SessionStat = Parse.Object.extend('SessionStat')
const Instance = Parse.Object.extend('Instance')
const Counter = Parse.Object.extend('Counter')
const Gatekeeper = Parse.Object.extend('Gatekeeper')

const _ = require('lodash')
const fs = require('fs')
const moment = require('moment')

async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

// Parse.Cloud.afterSave('SessionStat', function(request) {
//   let sessionStat = request.object
//   let user = request.user

//   if(!sessionStat.get('end')) return

//   console.log('Processing: SessionStat [afterSave]')

//   let storylinePtr = sessionStat.get('storyline')
//   let instancePtr = sessionStat.get('instance')
//   let queries = [
//     new Parse.Query(Storyline).get(storylinePtr.id),
//     new Parse.Query(Instance).get(instancePtr.id)
//   ]

//   Promise.all(queries)
//     .then(data => {
//       let storyline = data[0]
//       let instance = data[1]

//       let vignettePtr = storyline.get('vignette')
//       let query2 = new Parse.Query(Vignette)

//       query2.get(vignettePtr.id)
//         .then(vignette => {
//           let avatarPtr = vignette.get('avatar')
//           let classroomPtr = vignette.get('classroom')

//           let queries = [
//             new Parse.Query(Avatar).get(avatarPtr.id),
//             new Parse.Query(Classroom).get(classroomPtr.id)
//           ]

//           Promise.all(queries)
//             .then(data => {
//               let avatar = data[0]
//               let classroom = data[1]

//               let avatarName = avatar.get('name')
//               let classroomName = classroom.get('name')
//               let sessionStart = sessionStat.get('start')
//               let instanceStart = instance.get('start')

//               let query3 = new Parse.Query(Analytic)

//               query3.equalTo('user', user)

//               query3.first()
//                 .then(result => {
//                   let analytic = result ? result : new Analytic()
//                   let records = result ? (result.get('records1') || {}) : {}

//                   // update minutes of session per character
//                   if(!records['minutesOfSessionPerAvatar'])
//                     records['minutesOfSessionPerAvatar'] = {}
//                   let minutesOfSessionPerAvatar = records['minutesOfSessionPerAvatar']

//                   if(!minutesOfSessionPerAvatar[avatarName])
//                     minutesOfSessionPerAvatar[avatarName] = {}
//                   let avatarInQuestion = minutesOfSessionPerAvatar[avatarName]

//                   if(!avatarInQuestion[instanceStart])
//                     avatarInQuestion[instanceStart] = {}
//                   let instance1InQuestion = avatarInQuestion[instanceStart]

//                   if(!instance1InQuestion[sessionStart])
//                     instance1InQuestion[sessionStart] = 0
//                   instance1InQuestion[sessionStart] += 5

//                   // update minutes of session per classrooms
//                   if(!records['minutesOfSessionPerClassroom'])
//                     records['minutesOfSessionPerClassroom'] = {}
//                   let minutesOfSessionPerClassroom = records['minutesOfSessionPerClassroom']

//                   if(!minutesOfSessionPerClassroom[classroomName])
//                     minutesOfSessionPerClassroom[classroomName] = {}
//                   let classroomInQuestion = minutesOfSessionPerClassroom[classroomName]

//                   if(!classroomInQuestion[instanceStart])
//                     classroomInQuestion[instanceStart] = {}
//                   let instance2InQuestion = classroomInQuestion[instanceStart]

//                   if(!instance2InQuestion[sessionStart])
//                     instance2InQuestion[sessionStart] = 0
//                   instance2InQuestion[sessionStart] += 5

//                   // console.log(records)

//                   analytic.set('user', user)
//                   analytic.set('records1', records)
//                   analytic.save()
//                 })
//                 .catch(error => console.log)
//             })
//             .catch(error => console.log)
//         })
//         .catch(error => console.log)
//     })
//     .catch(error => console.log)
// });

// Parse.Cloud.afterSave('PhaseStat', function(request) {
//   let phaseStat = request.object
//   let user = request.user

//   console.log('Processing: PhaseStat [afterSave]')

//   let sessionStatPtr = phaseStat.get('session')
//   let query1 = new Parse.Query(SessionStat)

//   query1.get(sessionStatPtr.id)
//     .then(sessionStat => {
//       let sessionStart = sessionStat.get('start')
//       let phaseName = phaseStat.get('name')

//       let a = moment(phaseStat.get('start'))
//       let b = moment(phaseStat.get('end'))
//       let phaseDuration = b.diff(a, 'seconds')

//       let query2 = new Parse.Query(Analytic)

//       query2.equalTo('user', user)

//       query2.first()
//         .then(result => {
//           let analytic = result ? result : new Analytic()
//           let records = result ? (result.get('records2') || {}) : {}

//           // update minutes of session per character
//           if(!records['minutesOfPhasePerSession'])
//             records['minutesOfPhasePerSession'] = {}
//           let minutesOfPhasePerSession = records['minutesOfPhasePerSession']

//           if(!minutesOfPhasePerSession[sessionStart])
//             minutesOfPhasePerSession[sessionStart] = {}
//           let sessionInQuestion = minutesOfPhasePerSession[sessionStart]

//           sessionInQuestion[phaseName] = phaseDuration

//           analytic.set('user', user)
//           analytic.set('records2', records)
//           analytic.save()
//         })
//         .catch(error => console.log)
//     })
//     .catch(error => console.log)
// })


async function finalizeStoryline(storylineId) {
  console.log("finalizeStoryline")
  const storyline = await new Parse.Query(Storyline).include('vignette').get(storylineId)
  const user = storyline.get('user')
  const vignette = storyline.get('vignette')
  const level = vignette.get('level')
  const avatar = vignette.get('avatar')
  const logs = storyline.get('logs')
  const storylineChoices = logs.filter((log) => log.action.includes('choice_')).map((log) => log.action)
  const uniqueId = storylineChoices.join('-')
  const vignetteChoices = await vignette.relation('nodes').query().equalTo('operation', 'Choice').containedIn('name', storylineChoices).find()
  const correct = Math.max(vignetteChoices.reduce((acc, choice) => acc += choice.get('score'), 0), 0)
  const effectiveness = correct / storylineChoices.length
  const end = logs.find((log) => log.action.includes('_end'))
  const endNode = await new Parse.Query(Node).equalTo('type', 'ending').equalTo('name', end.action).equalTo('vignette', vignette).first()
  const isPosOrMixed = endNode.get('score') > 0

  if (level === 'Level-2') {
    let gatekeeper = await new Parse.Query(Gatekeeper).equalTo('user', user).equalTo('level', level).equalTo('avatar', avatar).first()

    if (!gatekeeper) {
      gatekeeper = new Gatekeeper().set({
        user, level, avatar,
        uniqueStorylines: [uniqueId],
        effectivenessCounters: [effectiveness],
        endingsPosOrMixed: (endNode.get('score') > 0) ? 1 : 0
      })
      await gatekeeper.save()
    } else if (gatekeeper.get('uniqueStorylines').indexOf(uniqueId) < 0) {
      gatekeeper.add('uniqueStorylines', uniqueId)
      gatekeeper.add('effectivenessCounters', effectiveness)
      if (isPosOrMixed) gatekeeper.increment('endingsPosOrMixed')
      await gatekeeper.save()
    }
  }
  return storyline.set({ uniqueId, effectiveness, complete: true, ending: endNode, endingPosOrMixed: isPosOrMixed }).save()
}

Parse.Cloud.define('finalizeStoryline', async (request, response) => {
  let { storylineId } = request.params

  try {
    const storyline = await finalizeStoryline(storylineId)
    response.success(storyline)
  } catch (e) { response.error(e) }
})

Parse.Cloud.beforeSave('Storyline', (request, response) => {
  console.log(request.object.dirtyKeys())
  response.success()
})



  // console.log(storyline.dirty('complete'), storyline.get('complete'))

  //

  // // continue only if complete was recently changed to true
  // if(!storyline.dirty('complete') || !storyline.get('complete')) return

  // let log = storyline.get('log')

  // let storylineName = storyline.id
  // let vignettePtr = storyline.get('vignette')

  // let query = new Parse.Query(Vignette)



  // return query.get(vignettePtr.id)
  //   .then(vignette => {
  //       let choiceNodes = log.filter(n => n.action.indexOf('choice_') != -1)
  //       let endNode = log.find(n => n.action.indexOf('_end') != -1)
  //       let uniqueStorylineId = ""
  //       let avatarPtr = vignette.get('avatar')

  //       console.log("inside")

  //       let choiceQueries = choiceNodes.map(cn => {
  //         let choiceQuery = vignette.relation('nodes').query()
  //         let name = cn.action
  //         uniqueStorylineId += name

  //         choiceQuery.equalTo('type', 'choice')
  //         choiceQuery.equalTo('name', name)

  //         return choiceQuery.first()
  //       })
  //       let endQuery = vignette.relation('nodes').query()

  //       endQuery.equalTo('type', 'ending')
  //       endQuery.equalTo('name', endNode.action)

  //       Parse.Promise.all([
  //         Parse.Promise.all(choiceQueries),
  //         endQuery.first(),
  //         new Parse.Query(Avatar).get(avatarPtr.id)
  //       ])
  //         .then(results => {
  //           let choices = results[0]
  //           let end = results[1]
  //           let avatar = results[2]
  //           let avatarName = avatar.get('name')
  //           console.log(avatarName)

  //           let effectiveness = choices.reduce((acc, cur) => acc + cur.get('score'), 0) / choices.length
  //           let endingType = end.get('score')

  //           console.log(`effectiveness: ${effectiveness} and endingType ${endingType}`)

  //           let query3 = new Parse.Query(Storyline)

  //           query3.equalTo('uniqueId', uniqueStorylineId)

  //           query3.first()
  //             .then(val => {
  //               let query4 = new Parse.Query(Analytic)

  //               query4.equalTo('user', user)

  //               query4.first()
  //                 .then(result => {
  //                   console.log('Processing: Storyline [afterSave]')

  //                   let analytic = result ? result : new Analytic()
  //                   let records = result ? (result.get('records3') || {}) : {}

  //                   // update session data about character
  //                   if(!records['gatekeeperLevel2PerAvatar'])
  //                     records['gatekeeperLevel2PerAvatar'] = {}
  //                   let gatekeeperLevel2PerAvatar = records['gatekeeperLevel2PerAvatar']

  //                   if(!gatekeeperLevel2PerAvatar[avatarName])
  //                     gatekeeperLevel2PerAvatar[avatarName] = {}
  //                   let avatarInQuestion = gatekeeperLevel2PerAvatar[avatarName]

  //                   let vignetteLevel = vignette.get('level')
  //                   if((!val || val.id == storyline.id) && vignetteLevel === 'Level-2') {
  //                     if(!avatarInQuestion['effectivenessCounter'])
  //                       avatarInQuestion['effectivenessCounter'] = 0
  //                     if(effectiveness >= 0.75) avatarInQuestion['effectivenessCounter']++

  //                     if(!avatarInQuestion['endingsPosOrMixed'])
  //                       avatarInQuestion['endingsPosOrMixed'] = 0
  //                     if(endingType > 0) avatarInQuestion['endingsPosOrMixed']++

  //                     if(!avatarInQuestion['uniqueStoryline'])
  //                       avatarInQuestion['uniqueStoryline'] = 0
  //                     avatarInQuestion['uniqueStoryline']++

  //                     if(!avatarInQuestion['highestEffectiveness']) avatarInQuestion['highestEffectiveness'] = effectiveness
  //                     else avatarInQuestion['highestEffectiveness'] = Math.max(avatarInQuestion['highestEffectiveness'], effectiveness)
  //                   }

  //                   if(!avatarInQuestion['sessionScores'])
  //                     avatarInQuestion['sessionScores'] = {}
  //                   let sessionScores = avatarInQuestion['sessionScores']

  //                   if(!sessionScores[storylineName])
  //                     sessionScores[storylineName] = {}

  //                   sessionScores[storylineName] = effectiveness

  //                   if(!avatarInQuestion['sessionScoresAvg'])
  //                     avatarInQuestion['sessionScoresAvg'] = {}
  //                   let allEffectScoresByLevel = avatarInQuestion['sessionScoresAvg']

  //                   if(!allEffectScoresByLevel[vignetteLevel])
  //                     allEffectScoresByLevel[vignetteLevel] = []
  //                   allEffectScoresByLevel[vignetteLevel].push(effectiveness)

  //                   analytic.set('user', user)
  //                   analytic.set('records3', records)
  //                   analytic.save()
  //                 })
  //             })
  //         })

  //   })
// })

// Parse.Cloud.afterSave('Storyline', function(request) {
//   let storyline = request.object
//   let user = request.user
// })

Parse.Cloud.afterSave('Support', function(request) {
  if (!request.object.existed()) {
    let query = new Parse.Query(Counter)
    return query.first().then((counterObj) => {
      counterObj.increment('supportCount')
      return counterObj.save()
    })
  }
})

Parse.Cloud.afterSave(Parse.User, function(request) {
  if (!request.object.existed()) {
    let query = new Parse.Query(Counter)
    return query.first().then((counterObj) => {
      counterObj.increment('userCount')
      return counterObj.save()
    })
  }
})

Parse.Cloud.job('addVignettes', async function(request, status) {
  let contents = fs.readFileSync('vignettes.json');
  let payload = JSON.parse(contents);
  let vignettes = payload.vignettes

  let avatars = await new Parse.Query(Avatar).find()
  let classrooms = await new Parse.Query(Classroom).find()

  let vignetteKeys = Object.keys(vignettes)

  await asyncForEach(vignetteKeys, async function(vKey) {
    let vignette = vignettes[vKey]

    let v = new Vignette()

    let grade = vignette.grade.replace(/\-/g,' ')
    let behavior = vignette.behavior
    let level = vignette.level

    let avatar = _.find(avatars, (o) => o.get('name') === vignette.avatar)
    let classroom = _.find(classrooms, (o) => o.get('name') === grade)

    v.set('avatar', avatar)
    v.set('classroom', classroom)
    v.set('behavior', behavior)
    v.set('level', level)
    v.set('name', vKey)

    v = await v.save()
    if (!v) return status.error(v)
    await v.fetch()

    let nodeRel = v.relation('nodes')
    let nodeKeys = Object.keys(vignette.nodes)
    let nodesDict = []

    await asyncForEach(nodeKeys, async function(nKey) {
      let node = vignette.nodes[nKey]

      let name = node.name || null
      let type = node.type || null
      let role = node.role || null
      let activity = node.activity || null
      let content = node.content || null
      let operation = node.operation || null
      let feedback = node.feedback || null
      let score = parseInt(node.score) || 0

      let n = new Node()

      n.set('name', name)
      n.set('type', type)
      n.set('role', role)
      n.set('activity', activity)
      n.set('content', content)
      n.set('operation', operation)
      n.set('feedback', feedback)
      n.set('score', score)
      n.set('unityId', nKey)
      n.set('vignette', v)

      n = await n.save()
      if (!n) return status.error(n)
      await n.fetch()

      nodesDict[nKey] = n
      nodeRel.add(n)
    })

    let edgeRel = v.relation('edges')
    let edgeKeys = Object.keys(vignette.edges)

    await asyncForEach(edgeKeys, async function(eKey) {
      let edge = vignette.edges[eKey]

      let source = nodesDict[edge.source] || null
      let target = nodesDict[edge.target] || null
      let guard = edge.guard || null
      let activity = edge.activity || null

      if((source != 0 && !source) || (target != 0 && !target)) {
        // do nothing
      } else {
        let e = new Edge()

        e.set('source', source)
        e.set('target', target)
        e.set('guard', guard)
        e.set('activity', activity)
        e.set('unityId', eKey)
        e.set('vignette', v)

        e = await e.save()

        await e.fetch()
        if (!e) return status.error(e)
        edgeRel.add(e)
      }
    })

    await v.save()
  })

  return status.success(`finished addVignettes job`)
});

Parse.Cloud.job('capitalizeNames', function(request, status) {
  let query = new Parse.Query(Parse.User)
  return query.find(null).then(results => {
    let promises = []
    results.forEach(result => {
      let newFirstName = result.get('firstName').trim().toUpperCase()
      let newLastName = result.get('lastName').trim().toUpperCase()
      console.log(`${newFirstName} ${newLastName}`)

      result.set('firstName', newFirstName)
      result.set('lastName', newLastName)

      promises.push(result)
    })
    return Parse.Object.saveAll(promises, {useMasterKey: true})
      .then(total => status.success(`saved: ${total.length} objects`))
      .catch(error => status.error(`unable to save all objects`))
  })
})
