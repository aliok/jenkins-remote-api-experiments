#!/usr/bin/env bash

function redecho {
    #    .---------- constant part!
    #    vvvv vvvv-- the code from above
    RED='\033[0;31m'
    NC='\033[0m' # No Color
    echo -e "${RED}$1${NC}"
}

JENKINS_URL="http://localhost:8080"
JENKINS_USER="admin"
JENKINS_PASSWORD="admin"
JOB_TO_READ="hello-world-gradle"

################################################ read all jobs
redecho "Gonna read Jenkins jobs"
OUTPUT=`
    curl \
        -X GET \
        "${JENKINS_URL}/view/All/api/json" \
        --user ${JENKINS_USER}:${JENKINS_PASSWORD} \
        --silent
`

redecho "Printing first 3"
redecho "Nr#1"
echo $OUTPUT | json jobs | json 1
redecho "Nr#2"
echo $OUTPUT | json jobs | json 2
redecho "Nr#3"
echo $OUTPUT | json jobs | json 3

################################################  read job details
redecho "Gonna read details of a Jenkins job: ${JOB_TO_READ}"
OUTPUT=`
    curl \
        -X GET \
        "${JENKINS_URL}/view/All/job/${JOB_TO_READ}/api/json" \
        --user ${JENKINS_USER}:${JENKINS_PASSWORD} \
        --silent
`

echo $OUTPUT | json


################################################  read last successful build
redecho "Gonna fetch last successful build of Jenkins job: ${JOB_TO_READ}"
OUTPUT=`
    curl \
        -X GET \
        "${JENKINS_URL}/view/All/job/${JOB_TO_READ}/lastSuccessfulBuild/api/json" \
        --user ${JENKINS_USER}:${JENKINS_PASSWORD} \
        --silent
`

echo $OUTPUT | json

################################################  read archived artifacts of last successful build
redecho "Gonna read archived artifacts of last successful build of Jenkins job: ${JOB_TO_READ}"
OUTPUT=`
    curl \
        -X GET \
        "${JENKINS_URL}/view/All/job/${JOB_TO_READ}/lastSuccessfulBuild/api/json?tree=artifacts[*]" \
        --user ${JENKINS_USER}:${JENKINS_PASSWORD} \
        --globoff \
        --silent \
        # --globoff option is required since we have brackets in the url
`

echo $OUTPUT | json artifacts


################################################  read console output of last successful build
redecho "Gonna read console output of last successful build of Jenkins job: ${JOB_TO_READ}"
redecho "First 10 lines:"
curl \
        -X GET \
        "${JENKINS_URL}/view/All/job/${JOB_TO_READ}/lastSuccessfulBuild/consoleText" \
        --user ${JENKINS_USER}:${JENKINS_PASSWORD} \
        --silent \
        | sed -n 1,10p
echo "..."


################################################  pipeline of last successful build
redecho "Gonna read pipeline of last successful build of Jenkins job: ${JOB_TO_READ}"
OUTPUT=`
    curl \
        -X GET \
        "${JENKINS_URL}/view/All/job/${JOB_TO_READ}/lastSuccessfulBuild/api/json?depth=5" \
        --user ${JENKINS_USER}:${JENKINS_PASSWORD} \
        --globoff \
        --silent \
        # --globoff option is required since we have brackets in the url
`

#echo $OUTPUT | json actions
echo $OUTPUT | json actions | json -c "this._class === 'org.jenkinsci.plugins.workflow.job.views.FlowGraphAction'"