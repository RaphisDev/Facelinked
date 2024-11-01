CREATE TABLE IF NOT EXISTS Profile (
    username varchar(20) NOT NULL,
    name varchar(30) NOT NULL,
    profilePicturePath TEXT NOT NULL,
    age INT NOT NULL,
    schoolName varchar(35) NOT NULL,
    grade INT NOT NULL,
    classIdentifier char NOT NULL,
    inRelationship boolean NOT NULL,
    partner varchar(25),
    location varchar(30) NOT NULL,
    status varchar(10),
    PRIMARY KEY(username)
    );
