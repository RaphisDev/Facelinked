v?=61

build:
	docker buildx build --platform linux/amd64 -t raphidev/facelinked:${v}.0 .
	docker push raphidev/facelinked:${v}.0
	ssh -i '/Users/raphaeltempler/Documents/Documents/Project Organisation/FaceLinked/key/key.pem' ec2-user@18.185.96.226 'sudo docker kill `sudo docker ps -q`'
	echo "Now manually upload new server update"
	open "https://hub.docker.com"
	ssh -i '/Users/raphaeltempler/Documents/Documents/Project Organisation/FaceLinked/key/key.pem' ec2-user@18.185.96.226