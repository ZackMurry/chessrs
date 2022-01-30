cd backend
./gradlew build -x test
sudo docker build --build-arg JAR_FILE=build/libs/chessrs-0.1.2.jar -t zackmurry/chessrs-backend .

cd ../frontend
sudo docker build -t zackmurry/chessrs-frontend .



