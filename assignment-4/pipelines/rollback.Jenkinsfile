/**
 * Manual Rollback Pipeline - Task 7
 * Flips the ALB listener back to the previous target group
 */

pipeline {
    agent { label 'jenkins-agent' }
    
    environment {
        REGION = 'us-east-1'
        ALB_LISTENER_ARN = 'arn:aws:elasticloadbalancing:us-east-1:608051150213:listener/app/dev-web-alb/b418ffdab15f292a/a6676074084b9b79'
        TARGET_GROUP_BLUE_ARN = 'arn:aws:elasticloadbalancing:us-east-1:608051150213:targetgroup/blue-web-tg/5ac7eead8cbcbb80'
        TARGET_GROUP_GREEN_ARN = 'arn:aws:elasticloadbalancing:us-east-1:608051150213:targetgroup/green-web-tg/e4068da3538026da'
    }
    
    stages {
        stage('Rollback') {
            steps {
                script {
                    echo "Determining current live target group..."
                    def currentTgArn = sh(
                        script: """
                        aws elbv2 describe-listeners \
                            --listener-arns ${ALB_LISTENER_ARN} \
                            --region ${REGION} \
                            --query 'Listeners[0].DefaultActions[0].TargetGroupArn' \
                            --output text
                        """,
                        returnStdout: true
                    ).trim()
                    
                    def newTgArn = ""
                    def color = ""
                    
                    if (currentTgArn == TARGET_GROUP_BLUE_ARN) {
                        newTgArn = TARGET_GROUP_GREEN_ARN
                        color = "GREEN"
                    } else {
                        newTgArn = TARGET_GROUP_BLUE_ARN
                        color = "BLUE"
                    }
                    
                    echo "Current live is ${currentTgArn}. Rolling back to ${color} (${newTgArn})..."
                    
                    sh """
                    aws elbv2 modify-listener \
                        --listener-arn ${ALB_LISTENER_ARN} \
                        --default-actions Type=forward,TargetGroupArn=${newTgArn} \
                        --region ${REGION}
                    """
                    
                    echo "Rollback successful! Traffic is now routed to ${color}."
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
