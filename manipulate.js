"use strict";

const colors = require('colors');
const jenkins = require('jenkins')({baseUrl: 'http://admin:admin@localhost:8080', crumbIssuer: true, promisify: true});

var JOB_NAME = "helloworld-android-gradle-" + new Date().getTime();
var REPOSITORY = "https://github.com/aliok/helloworld-android-gradle.git";
var BRANCH = "*/jenkinsfile-experiments";

Promise.resolve()
    .then(createJob)
    .then(triggerBuild)
    .then(trackQueueItem)
    .then(trackBuild)
    .catch(function (err) {
        console.error("An error occurred".red.underline);
        console.error(err);
    });

function createJob() {
    return Promise.resolve()
        .then(function () {
            console.log("Gonna create a job".green);
        })
        .then(function () {
            var xml = `
            <flow-definition plugin="workflow-job@2.8">
                <description/>
                <keepDependencies>false</keepDependencies>
                <properties>
                    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
                        <triggers/>
                    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
                </properties>
                <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.22">
                    <scm class="hudson.plugins.git.GitSCM" plugin="git@3.0.0">
                        <configVersion>2</configVersion>
                        <userRemoteConfigs>
                            <hudson.plugins.git.UserRemoteConfig>
                                <url>${REPOSITORY}</url>
                            </hudson.plugins.git.UserRemoteConfig>
                        </userRemoteConfigs>
                        <branches>
                            <hudson.plugins.git.BranchSpec>
                                <name>${BRANCH}</name>
                            </hudson.plugins.git.BranchSpec>
                        </branches>
                        <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
                        <submoduleCfg class="list"/>
                        <extensions/>
                    </scm>
                    <scriptPath>Jenkinsfile</scriptPath>
                </definition>
                <triggers/>
            </flow-definition>
            `;

            return jenkins.job.create(JOB_NAME, xml);
        })
        .then(function () {
            console.log(`Successfully created the job ${JOB_NAME}`.green);
        })
        .then(function () {
            return jenkins.job.get(JOB_NAME);
        })
        .then(function (data) {
            console.log("some info of the created job".green);
            console.log(data);
        })
        .then(function (data) {
            return JOB_NAME;
        })
        .catch(function (err) {
            console.error("An error occurred".red.underline);
            console.error(err);
            return Promise.reject(err);
        });
}

function triggerBuild(jobName) {
    return Promise.resolve()
        .then(function () {
            console.log(`Gonna trigger build on job ${jobName}`.green);
        })
        .then(function () {
            return jenkins.job.build(jobName);
        })
        .then(function (queueNumber) {
            console.log(`Started build. Queue number #${queueNumber}`.green);
            return queueNumber;
        })
        .catch(function (err) {
            console.error("An error occurred".red.underline);
            console.error(err);
            return Promise.reject(err);
        });
}


function trackQueueItem(queueNumber) {
    return new Promise(function (fulfill, reject) {
        // we check the status here until it leaves the queue
        // see docs/queue_item_status_example.js for different states

        console.log("Starting checking status of the queue item".green);

        let recurring = function () {
            jenkins.queue.item(queueNumber)
                .then(function (data) {
                    if (data.executable && data.executable.number) {
                        let buildNumber = data.executable.number;
                        console.log(`Left the queue. Assigned build number : ${buildNumber}`.green);
                        clearInterval(interval);
                        fulfill(buildNumber);
                    }
                    else {
                        let timeInQueue = (new Date().getTime() - data.inQueueSince) / 1000;
                        timeInQueue = timeInQueue.toFixed(2);
                        console.log(`In the queue for ${timeInQueue} secs`.green);
                        console.log("Status: ".green + data.why);
                    }

                })
                .catch(function (err) {
                    clearInterval(interval);
                    reject(err);
                });
        };

        const interval = setInterval(recurring, 1000);
    });
}

function trackBuild(buildNumber) {
    return new Promise(function (fulfill, reject) {
        // we check the status of the build here
        // see docs/build_status_example.js for examples of status

        console.log(`Starting checking status of the build #${buildNumber}`.green);

        let logStream;
        let recurring = function () {
            jenkins.build.get(JOB_NAME, buildNumber)
                .then(function (data) {
                    if (data.building) {
                        let timeBuilding = (new Date().getTime() - data.timestamp) / 1000;
                        let estimatedDuration;
                        if (data.estimatedDuration && data.estimatedDuration > 0) {
                            estimatedDuration = (data.estimatedDuration / 1000).toFixed(2) + " secs";
                        }
                        else {
                            estimatedDuration = "UNKNOWN";
                        }

                        timeBuilding = timeBuilding.toFixed(2);
                        console.log(`Building since ${timeBuilding} secs, estimated duration: ${estimatedDuration}`.green);

                        if(!logStream){
                            logStream = jenkins.build.logStream(JOB_NAME, buildNumber);
                            logStream.on('data', function(text) {
                                let lines = text.split("\n");
                                for(let line of lines){
                                    console.log(("  ==BUILD LOG== " + line).gray);
                                }
                            });

                            logStream.on('error', function(err) {
                                console.error('  ==BUILD LOG ERROR=='.red);
                                console.error(err);
                            });

                            logStream.on('end', function() {
                                console.log('  ==BUILD LOG== <FIN>'.gray);
                            })
                        }
                    }
                    else {
                        let result = data.result;
                        let duration = (data.duration / 1000).toFixed(2);
                        let artifacts = data.artifacts;

                        console.log(`Finished build with result : : ${result}. It took ${duration} secs`.green);
                        if (artifacts) {
                            console.log("Here are the artifacts".green);
                            console.log(artifacts);
                        }
                        else {
                            console.log("No artifacts found".green);
                        }

                        clearInterval(interval);
                        fulfill(buildNumber);
                    }
                })
                .catch(function (err) {
                    clearInterval(interval);
                    reject(err);
                });
        };

        const interval = setInterval(recurring, 1000);
    });
}