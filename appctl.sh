#!/bin/bash

#
# App Control Shell Script (appctl.sh)
#
# This script could be used with a standard installation of app.
# Read installation's documentation on http://app.github.io/app
# 
# ./appctl.sh start      : start app
# ./appctl.sh stop       : stop app
# ./appctl.sh restart    : restart app
# ./appctl.sh configtest : check the configuration
# ./appctl.sh status     : display app status (port regardless)
# ./appctl.sh run        : same as start app, but without nohup
# 
#  YOU DOESN'T NEED TO MODIFY THIS SCRIPT.
# 
# 
#############################################################

########################################
#          Init vars
# You can define APP_HOME and APP_HTTP_PORT
# in you env (ex: .profile). 
# Default values : 
# - APP_HOME : /opt/app
# - APP_HTTP_PORT : 9010
# - APP_DB_URL : jdbc:mysql://localhost:3306/app
# - APP_DB_USER : app
# - APP_DB_PASSWORD : app
########################################
if [[ -z "${APP_HOME}" ]]; then
    APP_HOME="/opt/app"
fi

if [[ -z "${APP_HTTP_PORT}" ]]; then
    APP_HTTP_PORT=9010
fi

if [[ -z "${APP_DB_URL}" ]]; then
    APP_DB_URL="jdbc:mysql://localhost:3306/app"
fi

if [[ -z "${APP_DB_USER}" ]]; then
    APP_DB_USER="app"
fi

if [[ -z "${APP_DB_PASSWORD}" ]]; then
    APP_DB_PASSWORD="app"
fi

########################################
#          Display Usage
# Display how to use appctl.sh
########################################
display_usage() { 
    echo -e "\nUsage:\n$0 [run|start|stop|restart|configtest|status] \n"
    return 0
}

########################################
#          Configtest
# Check the configuration of app : 
# - chmod +x start file
# - check start file with dir lib/
# - check java and version (>=1.6)
########################################
configtest() {
    ERROR=0

    export APP_CURRENT="${APP_HOME}/current"

    echo "App Home: ${APP_HOME}, port : ${APP_HTTP_PORT}"
    echo "App Current: ${APP_CURRENT}"

    echo "Checking bin/app file..."
    chmod +x ${APP_CURRENT}/bin/app
    if [ $? -ne 0 ]; then
        echo "ERROR : Failed to chmod +x bin/app, please check your installation"
        ERROR=1
    fi

    cd ${APP_CURRENT}
    JAR_FILE=`cd lib && ls *app*`
    grep $JAR_FILE bin/app >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "ERROR : bin/app file does not match with jar in dir lib/, please check your installation"
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
#          Run
# Use start Method to start App
# without nohup command
########################################
run() {
    start "run"
}

########################################
#          Start
# Start an instance of app
# on http.port ${APP_HTTP_PORT}
# Do nothing if App is already started.
# If App is not started : 
# - Deleting RUNNING_PID file if necessary
# - Start with nohup command
# - Call action "status"
# - Check pid on ${APP_HTTP_PORT}
########################################
start() {
    RUN=$1

    ERROR=0
    

    ps -ef | grep java | grep app | grep "http.port=${APP_HTTP_PORT}" | grep -v grep >/dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "App is already started on port ${APP_HTTP_PORT}. Please stop before" ; 
        return 1;
    fi

    if [ -f ${APP_CURRENT}/RUNNING_PID ]; then
        echo "WARN : there is ${APP_CURRENT}/RUNNING_PID file. Deleting it and continue starting..."
        rm ${APP_CURRENT}/RUNNING_PID
        if [ $? -ne 0 ]; then
            echo "ERROR : can't deleting ${APP_CURRENT}/RUNNING_PID file. Abort Starting App"
            return 1;
        fi
    fi

    CMD="${APP_CURRENT}/bin/app -Dlogger.file=${APP_CURRENT}/conf/logger-prod.xml -Dhttp.port=${APP_HTTP_PORT} -DapplyEvolutions.default=true -Ddb.default.url=${APP_DB_URL} -Ddb.default.user=${APP_DB_USER} -Ddb.default.password=${APP_DB_PASSWORD}"

    if [ "x${RUN}" = "xrun" ]; then
        echo "Running App..."
        $CMD
    else
        echo "Starting App (with nohup)..."
        nohup $CMD >/dev/null 2>&1 &

        if [ $? -ne 0 ]; then
            echo "ERROR while starting app. Please run this command and check the log file:"
            echo "$CMD"
            ERROR=1
        fi

        sleep 3
        status

        ps -ef | grep java | grep app | grep "http.port=${APP_HTTP_PORT}" | grep -v grep >/dev/null 2>&1

        if [ $? -ne 0 ]; then
            echo "ERROR while starting app. Please run this command and check the log file:"
            echo "$CMD"
            ERROR=1
        fi

        return $ERROR
    fi;
}

########################################
#          Stop
# Stop instance of app running 
# on http.port ${APP_HTTP_PORT}
########################################
stop() {

    ps -ef | grep java | grep app | grep "http.port=${APP_HTTP_PORT}" | grep -v grep >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "App is already stopped on http.port ${APP_HTTP_PORT}"
        return 0
    fi


    echo "Stopping App (on running http.port ${APP_HTTP_PORT})..."
    ps -ef | grep java | grep app | grep "http.port=${APP_HTTP_PORT}" | grep -v grep | while read a b c; do kill -15 $b ; done

    sleep 4

    # kill if necessary
    ps -ef | grep java | grep app | grep "http.port=${APP_HTTP_PORT}" | grep -v grep | while read a b c; do echo "Normal TERM failed, kill -9 app..." kill -9 $b ; done

    return 0
}

########################################
#          Status
# Display the status of all instances of app
# with ps command. 
########################################
status() {
    echo "Status (all instances of app are scanned):"
    ps -ef | grep java | grep app | grep -v grep | while read a b c; do 
        PORT=$(echo $c | sed 's/\(.*\)-Dhttp.port.\([0-9]*\)\(.*\)/\2/; 1q')
        echo "App is started with pid:$b and http.port:${PORT}"
    done

    ps -ef | grep java | grep app | grep -v grep >/dev/null 2>&1

    if [ $? -ne 0 ]; then
        echo "App is stopped"
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
start|stop|restart|run)
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
