var config = {
    development: {
        //databaseLink: "mongodb://fullstack:fullstack_01@ds215172.mlab.com:15172/firstdb",
        clientURL: "http://localhost:8081"
    },
    ec2: {
        //databaseLink: "mongodb://fullstack:fullstack_01@ds215172.mlab.com:15172/firstdb",
        clientURL: "http://ec2-34-208-42-160.us-west-2.compute.amazonaws.com:3006"
    },
};
module.exports = config;