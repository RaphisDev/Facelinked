CREATE TABLE IF NOT EXISTS Profile(
    age INT NOT NULL,
    schoolName varchar(35) NOT NULL,
    inRelationship boolean NOT NULL,
    partner varchar(20),
    location varchar(30) NOT NULL,
    username varchar(20) NOT NULL,
    FOREIGN KEY(username) references UserSchema(username)
);
