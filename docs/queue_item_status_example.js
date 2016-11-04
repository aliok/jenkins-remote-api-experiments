var sentToQueue = `
{ _class: 'hudson.model.Queue$WaitingItem',
  actions: [ { _class: 'hudson.model.CauseAction', causes: [Object] } ],
  blocked: false,
  buildable: false,
  id: 56,
  inQueueSince: 1478245872217,
  params: '',
  stuck: false,
  task: 
   { _class: 'org.jenkinsci.plugins.workflow.job.WorkflowJob',
     name: 'helloworld-android-gradle-1478245871787',
     url: 'http://localhost:8080/job/helloworld-android-gradle-1478245871787/',
     color: 'notbuilt' },
  url: 'queue/item/56/',
  why: 'In the quiet period. Expires in 3.9 sec',
  timestamp: 1478245877217 }
`;

var startingBuild = `
{ _class: 'hudson.model.Queue$WaitingItem',
  actions: [ { _class: 'hudson.model.CauseAction', causes: [Object] } ],
  blocked: false,
  buildable: false,
  id: 56,
  inQueueSince: 1478245872217,
  params: '',
  stuck: false,
  task: 
   { _class: 'org.jenkinsci.plugins.workflow.job.WorkflowJob',
     name: 'helloworld-android-gradle-1478245871787',
     url: 'http://localhost:8080/job/helloworld-android-gradle-1478245871787/',
     color: 'notbuilt' },
  url: 'queue/item/56/',
  why: '???',
  timestamp: 1478245877217 }
`;

var leftQueue = `
{ _class: 'hudson.model.Queue$LeftItem',
  actions: [ { _class: 'hudson.model.CauseAction', causes: [Object] } ],
  blocked: false,
  buildable: false,
  id: 56,
  inQueueSince: 1478245872217,
  params: '',
  stuck: false,
  task: 
   { _class: 'org.jenkinsci.plugins.workflow.job.WorkflowJob',
     name: 'helloworld-android-gradle-1478245871787',
     url: 'http://localhost:8080/job/helloworld-android-gradle-1478245871787/',
     color: 'notbuilt' },
  url: 'queue/item/56/',
  why: null,
  cancelled: false,
  executable: 
   { _class: 'org.jenkinsci.plugins.workflow.job.WorkflowRun',
     number: 1,
     url: 'http://localhost:8080/job/helloworld-android-gradle-1478245871787/1/' } }
`;