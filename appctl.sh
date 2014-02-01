#!/bin/bash

#
# PlayStartAppAngularJS Control Shell Script (appctl.sh)
#
# This script could be used with a standard installation.
# Read installation's documentation on https://github.com/yesnault/PlayStartAppAngularJS
# 
# ./appctl.sh start      : start
# ./appctl.sh stop       : stop
# ./appctl.sh restart    : restart
# ./appctl.sh configtest : check the configuration
# ./appctl.sh status     : display status (port regardless)
# 
#  YOU DOESN'T NEED TO MODIFY THIS SCRIPT.
# 
# 
#############################################################

########################################
#          Init vars
# You can define PLAY_START_APP_ANGULARJS_HOME and PLAY_START_APP_ANGULARJS_HTTP_PORT
# in you env (ex: .profile). 
# Default values : 
# - PLAY_START_APP_ANGULARJS_HOME : /opt/PlayStartAppAngularJS
# - PLAY_START_APP_ANGULARJS_HTTP_PORT : 9001
########################################
if [[ -z "${PLAY_START_APP_ANGULARJS_HOME}" ]]; then
    export PLAY_START_APP_ANGULARJS_HOME="/opt/PlayStartAppAngularJS"
fi

if [[ -z "${PLAY_START_APP_ANGULARJS_HTTP_PORT}" ]]; then
    export PLAY_START_APP_ANGULARJS_HTTP_PORT=9001
fi

########################################
#          Display Usage
# Display how to use appctl.sh
########################################
display_usage() { 
    echo -e "\nUsage:\n$0 [start|stop|restart|configtest|status] \n"
    return 0
}

########################################
#          Configtest
# Check the configuration of PlayStartAppAngularJS : 
# - chmod +x start file
# - check start file with dir lib/
# - check logger-prod.xml file
# - check java and version (>=1.6)
########################################
configtest() {
    ERROR=0

    export PLAY_START_APP_ANGULARJS_CURRENT="${PLAY_START_APP_ANGULARJS_HOME}/current"

    echo "PlayStartAppAngularJS Home: ${PLAY_START_APP_ANGULARJS_HOME}, port : ${PLAY_START_APP_ANGULARJS_HTTP_PORT}"
    echo "PlayStartAppAngularJS Current: ${PLAY_START_APP_ANGULARJS_CURRENT}"

    echo "Checking bin/PlayStartAppAngularJS file..."
    chmod +x ${PLAY_START_APP_ANGULARJS_CURRENT}/bin/PlayStartAppAngularJS
    if [ $? -ne 0 ]; then
        echo "ERROR : Failed to chmod +x bin/PlayStartAppAngularJS, please check your installation"
        ERROR=1
    fi

    cd ${PLAY_START_APP_ANGULARJS_CURRENT}
    JAR_FILE=`cd lib && ls PlayStartAppAngularJS*`
    grep $JAR_FILE bin/PlayStartAppAngularJS >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "ERROR : bin/PlayStartAppAngularJS file does not match with jar in dir lib/, please check your installation"
        ERROR=1
    fi

    echo "Checking logger-prod.xml file..."
    if [ ! -f ${PLAY_START_APP_ANGULARJS_CURRENT}/logger-prod.xml ]; then
        echo "ERROR : ${PLAY_START_APP_ANGULARJS_CURRENT}/logger-prod.xml not exist, please check your installation"
        ERROR=1
    fi

    echo "Checking java version..."
    if type -p java >/dev/null 2>&1 ; then
        JAVA_VER=$(java -version 2>&1 | sed 's/java version "\(.*\)\.\(.*\)\..*"/\1\2/; 1q')
        if [ "$JAVA_VER" -ge 17 ]; then
            echo "ok, java is 1.7 or newer"
        else
            echo "ERROR : java version is too old..."
            ERROR=1
        fi
    else
        echo "ERROR : no java found in PATH"
        ERROR=1
    fi

    return $ERROR
}


########################################
#          Start
# Start an instance of PlayStartAppAngularJS
# on http.port ${PLAY_START_APP_ANGULARJS_HTTP_PORT}
# Do nothing if PlayStartAppAngularJS is already started.
# If PlayStartAppAngularJS is not started : 
# - Deleting RUNNING_PID file if necessary
# - Start with nohup command
# - Call action "status"
# - Check pid on ${PLAY_START_APP_ANGULARJS_HTTP_PORT}
########################################
start() {
    ERROR=0
    echo "Starting PlayStartAppAngularJS..."

    ps -ef | grep java | grep PlayStartAppAngularJS | grep "http.port=${PLAY_START_APP_ANGULARJS_HTTP_PORT}" | grep -v grep >/dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "PlayStartAppAngularJS is already started on port ${PLAY_START_APP_ANGULARJS_HTTP_PORT}. Please stop before" ; 
        return 1;
    fi

    if [ -f ${PLAY_START_APP_ANGULARJS_CURRENT}/RUNNING_PID ]; then
        echo "WARN : there is ${PLAY_START_APP_ANGULARJS_CURRENT}/RUNNING_PID file. Deleting it and continue starting..."
        rm ${PLAY_START_APP_ANGULARJS_CURRENT}/RUNNING_PID
        if [ $? -ne 0 ]; then
            echo "ERROR : can't deleting ${PLAY_START_APP_ANGULARJS_CURRENT}/RUNNING_PID file. Abort Starting PlayStartAppAngularJS"
            return 1;
        fi
    fi

    CMD="${PLAY_START_APP_ANGULARJS_CURRENT}/bin/PlayStartAppAngularJS -Dlogger.file=${PLAY_START_APP_ANGULARJS_CURRENT}/logger-prod.xml -Dhttp.port=${PLAY_START_APP_ANGULARJS_HTTP_PORT} -DapplyEvolutions.default=true"
    nohup $CMD >/dev/null 2>&1 &

    if [ $? -ne 0 ]; then
        echo "ERROR while starting PlayStartAppAngularJS. Please run this command and check the log file:"
        echo "$CMD"
        ERROR=1
    fi

    sleep 3
    status

    ps -ef | grep java | grep PlayStartAppAngularJS | grep "http.port=${PLAY_START_APP_ANGULARJS_HTTP_PORT}" | grep -v grep >/dev/null 2>&1

    if [ $? -ne 0 ]; then
        echo "ERROR while starting PlayStartAppAngularJS. Please run this command and check the log file:"
        echo "$CMD"
        ERROR=1
    fi

    return $ERROR
}

########################################
#          Stop
# Stop instance of PlayStartAppAngularJS running 
# on http.port ${PLAY_START_APP_ANGULARJS_HTTP_PORT}
########################################
stop() {

    ps -ef | grep java | grep PlayStartAppAngularJS | grep "http.port=${PLAY_START_APP_ANGULARJS_HTTP_PORT}" | grep -v grep >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "PlayStartAppAngularJS is already stopped on http.port ${PLAY_START_APP_ANGULARJS_HTTP_PORT}"
        return 0
    fi


    echo "Stopping PlayStartAppAngularJS (on running http.port ${PLAY_START_APP_ANGULARJS_HTTP_PORT})..."
    ps -ef | grep java | grep PlayStartAppAngularJS | grep "http.port=${PLAY_START_APP_ANGULARJS_HTTP_PORT}" | grep -v grep | while read a b c; do kill -15 $b ; done

    sleep 10

    # kill if necessary
    ps -ef | grep java | grep PlayStartAppAngularJS | grep "http.port=${PLAY_START_APP_ANGULARJS_HTTP_PORT}" | grep -v grep | while read a b c; do echo "Normal TERM failed, kill -9 PlayStartAppAngularJS..." kill -9 $b ; done

    return 0
}

########################################
#          Status
# Display the status of all instances of PlayStartAppAngularJS
# with ps command. 
########################################
status() {
    echo "Status (all instances of PlayStartAppAngularJS are scanned):"
    ps -ef | grep java | grep PlayStartAppAngularJS | grep -v grep | while read a b c; do 
        PORT=$(echo $c | sed 's/\(.*\)-Dhttp.port.\([0-9]*\)\(.*\)/\2/; 1q')
        echo "PlayStartAppAngularJS is started with pid:$b and http.port:${PORT}"
    done

    ps -ef | grep java | grep PlayStartAppAngularJS | grep -v grep >/dev/null 2>&1

    if [ $? -ne 0 ]; then
        echo "PlayStartAppAngularJS is stopped"
    fi
    return 0
}

########################################
#          Restart
# Run stop then start action
########################################
restart() {
    stop
    start
}

########################################
#          Action
# Run configtest before run an action. If 
# the configtest failed, return directly
# param $1 : action to run
########################################
action() {
    configtest
    if [ $? -eq 0 ]; then
        $1
        ERROR=$?
    fi
    return $ERROR
}

#########################
#          MAIN
#########################
ACMD="$1"
ARGV="$@"

ERROR=0


case $ACMD in
start|stop|restart)
    action $ACMD
    ERROR=$?
    ;;
configtest)
    configtest
    ERROR=$?
    ;;
status)
    status
    ;;
*)
    display_usage
    ERROR=$?
esac

exit $ERROR
