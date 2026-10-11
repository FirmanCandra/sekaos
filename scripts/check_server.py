import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('46.202.186.254', port=65002, username='u267893077', password='Setiket*06')

cmd = 'cd domains/snow-sparrow-521382.hostingersite.com/public_html && git status && git log -n 2'
stdin, stdout, stderr = client.exec_command(cmd)
print("GIT STATUS ON SERVER:")
print(stdout.read().decode())
print(stderr.read().decode())

client.close()
