# jenkins-remote-api-experiments


Files:

* read.sh: read stuff from Jenkins using curl
  - Read Jenkins information
  - Read Jenkins jobs
  - Read details of a specific job
  - Read following of the last successful build of a Jenkins job
      - Read build info
      - Read read archived artifacts of last successful build a Jenkins job
      - Read console output of last successful build of a Jenkins job
      - Read pipeline of last successful build of a Jenkins job

* manipulate.js: manipulate stuff in Jenkins using the Node client. It was hard to do these in curl. *You need ES6, thus something like Node4*
  - Create a job
  - Trigger a build in the new job
  - Track the status of the build


* docs/queue_item_status_example.js: ordered examples of different state of a queue item. when item leaves the queue, the state will be fixed.

* docs/build_status_example.js: ordered examples of different state of a build