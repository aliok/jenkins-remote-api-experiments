"use strict";

const colors = require('colors');
const blessed = require('blessed');
const jenkins = require('jenkins')({baseUrl: 'http://admin:admin@localhost:8080', crumbIssuer: true, promisify: true});

var JOB_NAME = "helloworld-android-gradle-" + new Date().getTime();
var REPOSITORY = "https://github.com/aliok/helloworld-android-gradle.git";
var BRANCH = "*/jenkinsfile-experiments";

Promise.resolve()
    .then(createJob)
    .then(triggerBuild)
    .then(function (queueNumber) {
        return new Promise(function (fulfill, reject) {
            // we check the status here until it leaves the queue
            // see docs/queue_item_status_example.js for different states

            console.log("Starting checking status of the queue item".green);
            const interval = setInterval(function () {
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

            }, 1000);
        });
    })
    .then(function (buildNumber) {
        return new Promise(function (fulfill, reject) {
            // we check the status of the build here
            // see docs/build_status_example.js for examples of status

            console.log(`Starting checking status of the build #${buildNumber}`.green);

            const interval = setInterval(function () {
                let screen;
                let body;

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
                            if(!screen || !body){
                                screen = blessed.screen();
                                body = blessed.box({
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        tags: true
                                    });
                                screen.append(body);
                                screen.key(['C-c'], function() {
                                    return process.exit(0);
                                });
                            }

                            body.setLine(0, '{blue-bg}' + `Building since ${timeBuilding} secs, estimated duration: ${estimatedDuration}` + '{/blue-bg}');
                            screen.render();
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

                            if(!screen){
                                screen.destroy();
                            }
                        }
                    })
                    .catch(function (err) {
                        clearInterval(interval);
                        reject(err);
                    });

            }, 1000);
        });
    })
    .catch(function (err) {
        console.error("An error occurred".red.underline);
        console.error(err);
    })
    .then(function(){
        // gotta do this since blessed stops program being terminated
        process.exit(0);
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

function checkQueueItem(queueNumber) {
    return Promise.resolve()
        .then(function () {
            console.log("Gonna check the status of the build".green);
            return jenkins.queue.item(queueNumber);
        })
        .then(function (queueItemData) {
            console.log("Fetched queue item data".green);
            console.log(queueItemData);
            return queueItemData;
        });
}

