# Outputs for Jenkins Controller and Agent

output "jenkins_controller_public_ip" {
  description = "Public IP of Jenkins controller"
  value       = aws_eip.jenkins_controller_eip.public_ip
}

output "jenkins_controller_private_ip" {
  description = "Private IP of Jenkins controller"
  value       = aws_instance.jenkins_controller.private_ip
}

output "jenkins_controller_instance_id" {
  description = "Instance ID of Jenkins controller"
  value       = aws_instance.jenkins_controller.id
}

output "jenkins_agent_private_ip" {
  description = "Private IP of Jenkins agent"
  value       = aws_instance.jenkins_agent.private_ip
}

output "jenkins_agent_instance_id" {
  description = "Instance ID of Jenkins agent"
  value       = aws_instance.jenkins_agent.id
}

output "jenkins_controller_security_group_id" {
  description = "Security group ID for Jenkins controller"
  value       = aws_security_group.jenkins_controller.id
}

output "jenkins_agent_security_group_id" {
  description = "Security group ID for Jenkins agent"
  value       = aws_security_group.jenkins_agent.id
}